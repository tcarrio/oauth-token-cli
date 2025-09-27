import type { Logger } from "@0xc/oauth-device-code-cli/src/logger";
import { $ } from "bun";
import type { TokenResponse } from "../common";
import type { AuthorizationCodeListener } from "./authorization-code-listener";
import type { AuthorizationCodePkceFlowOAuthClient } from "./authorization-code-pkce-client";

export class AuthorizationCodePkceFlowOAuthAgent {
	constructor(
		private readonly client: AuthorizationCodePkceFlowOAuthClient,
		private readonly listener: AuthorizationCodeListener,
		private readonly logger: Logger,
	) {}

	async authenticate(): Promise<TokenResponse> {
		const { state, codeVerifier, url } =
			await this.client.getAuthorizationUrl();

		const codePromise = this.listener.register(state);

		await this.promptAuthorizationFlow(url);

		const code = await codePromise;

		this.logger.debug("code", code);

		return this.client.retrieveToken({
			code,
			codeVerifier,
		});
	}

	private async promptAuthorizationFlow(authorizationUrl: string) {
		this.logger.info(`Open "${authorizationUrl}" in your browser`);
		try {
			await $`open "${authorizationUrl}"`;
		} catch (error) {
			this.logger.info(`Open "${authorizationUrl}" in your browser`);
		}
	}
}
