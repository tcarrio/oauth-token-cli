import { KyHttpClient } from "@0xc/oauth-device-code-cli/src/http";
import type { TokenResponse } from "../src/oauth";
import {
	DeviceCodeFlowOAuthAgent,
	DeviceCodeFlowOAuthClient,
	DeviceCodeFlowOAuthConfig,
} from "../src/oauth/device-code";
import type { CliArgs } from "./cli";
import type { RunnerDeps } from "./types";

export async function runDeviceCodeFlow(
	{ logger }: RunnerDeps,
	{ logLevel, ...config }: CliArgs,
): Promise<TokenResponse> {
	if (!config.scopes) {
		throw new Error(
			"Scopes are required for device code flow. Use --scopes or set OAUTH_SCOPES environment variable.",
		);
	}

	const oauthConfig = DeviceCodeFlowOAuthConfig.fromConfigLike({
		...config,
		scopes: config.scopes,
	});
	const httpClient = new KyHttpClient(logger);
	const client = new DeviceCodeFlowOAuthClient(oauthConfig, httpClient);
	const agent = new DeviceCodeFlowOAuthAgent(client, logger);

	return await agent.authenticate();
}
