import { EventEmitter } from "node:events";
import type { Server } from "bun";
import type { Logger } from "../../logger";
import type { AuthorizationCodeListenerConfig } from "./authorization-code-listener-config";

export class AuthorizationCodeListener {
	private server: Server | null = null;
	private emitter = new EventEmitter();
	private readonly stateTracker: Record<string, Promise<string>> = {};

	constructor(
		private readonly config: AuthorizationCodeListenerConfig,
		private readonly logger: Logger,
	) {}

	register(state: string): Promise<string> {
		this.listen();

		return (this.stateTracker[state] ??= new Promise<string>((resolve) => {
			this.emitter.on(state, (code) => {
				delete this.stateTracker[state];

				resolve(code);

				if (Object.keys(this.stateTracker).length === 0) {
					this.stop();
				}
			});
		}));
	}

	private async listen(): Promise<void> {
		this.server ??= Bun.serve({
			hostname: this.config.host,
			port: this.config.port,
			fetch: async (request: Request): Promise<Response> => {
				const url = new URL(request.url);
				if (url.pathname !== this.config.path) {
					return new Response("Not found", {
						status: 404,
					});
				}

				this.logger.debug(`Request received @ ${request.url}`);

				const code = url.searchParams.get("code");
				const state = url.searchParams.get("state");

				if (!code || !state) {
					return new Response("Missing code or code_verifier", {
						status: 400,
					});
				}

				if (!(state in this.stateTracker)) {
					return new Response("Invalid state", {
						status: 409,
					});
				}

				setImmediate(() => this.emitter.emit(state, code));

				return this.successResponse();
			},
		});
	}

	async stop(): Promise<void> {
		if (this.server) {
			this.server.stop(true);
		}
	}

	private successResponse(): Response {
		return new Response(
			`
        <!doctype html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div class="flex items-center justify-center h-screen w-screen">
            <div class="space-y-4 text-center">
              <h1 class="text-3xl font-bold underline">
                Authorization code is processing locally.
              </h1>

              <h2 class="text-2xl">
                Browser will close automatically in a few seconds...
              </h2>

              <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onclick="window.close()"
              >
                Close window now
              </button>
            </div>
          </div>
          <script>
            setTimeout(() => window.close(), 3333);
          </script>
        </body>
        </html>
      `,
			{
				status: 200,
				headers: {
					"Content-Type": "text/html",
				},
			},
		);
	}
}
