import { readFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";
import { z } from "zod";
import { enumKeys, enumValues } from "../src/enum";
import { LogLevel } from "../src/logger";
import { OAuthFlow } from "../src/oauth";

const DOT_CONFIG_DIR = ".config";
const PROJECT_NAME_DIR = "oauth-device-code-cli";

export type Config = z.infer<typeof SCHEMA>;

const SCHEMA = z.object({
	oauth: z
		.object({
			clientId: z.string().optional(),
			audience: z.string().url().optional(),
			baseUrl: z.string().url().optional(),
			scopes: z.string().optional(),
			callbackUrl: z.string().url().optional(),
			flow: z.enum(enumValues(OAuthFlow)).optional(),
		})
		.optional(),
	logLevel: z.enum(enumKeys(LogLevel)).optional(),
	output: z
		.object({
			target: z.enum(["tty", "clipboard"]).optional(),
		})
		.optional(),
});

export class ConfigResult {
	private static readonly DEFAULT_CONFIG_PATH_ARGS = [
		PROJECT_NAME_DIR,
		"config.json",
	] as const;

	constructor(
		private readonly config: Config = {},
		public readonly error: boolean = false,
	) {
		Object.freeze(config);
	}

	public static async load(path: string): Promise<ConfigResult> {
		try {
			const config = await readFile(path);

			const content = JSON.parse(config.toString("utf-8"));

			return new ConfigResult(content, false);
		} catch (error) {
			return new ConfigResult({}, true);
		}
	}

	public static async loadDefault(): Promise<ConfigResult> {
		const path = ConfigResult.determineConfigPath();

		return ConfigResult.load(path);
	}

	private static determineConfigPath(): string {
		const xdgConfigHome = Bun.env.XDG_CONFIG_HOME;

		if (xdgConfigHome) {
			return path.join(xdgConfigHome, ...ConfigResult.DEFAULT_CONFIG_PATH_ARGS);
		}

		if (Bun.env.HOME) {
			return path.join(
				Bun.env.HOME,
				DOT_CONFIG_DIR,
				...ConfigResult.DEFAULT_CONFIG_PATH_ARGS,
			);
		}

		if (!Bun.env.USER) {
			throw new Error("Failed to determine root config path");
		}

		let userRoot: string;
		switch (platform()) {
			case "linux":
			case "freebsd":
			case "openbsd":
			case "sunos":
				userRoot = path.join("/home", Bun.env.USER);
				break;
			case "darwin":
				userRoot = path.join("/Users", Bun.env.USER);
				break;
			default:
				throw new Error("Unsupported platform");
		}

		return path.join(
			userRoot,
			DOT_CONFIG_DIR,
			...ConfigResult.DEFAULT_CONFIG_PATH_ARGS,
		);
	}

	public get value(): Readonly<Config> {
		return this.config;
	}
}
