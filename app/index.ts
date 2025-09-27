#!/usr/bin/env bun

import { OAuthFlow } from "@0xc/oauth-device-code-cli/src/oauth";
import clipboard from "clipboardy";
import { ConsoleLogger, LogLevel } from "../src/logger";
import { runAuthorizationCodeFlow } from "./authorization-code";
import { type CliArgs, parseCliArgs } from "./cli";
import { runClientCredentialsFlow } from "./client-credentials";
import { runDeviceCodeFlow } from "./device-code";
import type { OAuthFlowRunner } from "./types";

const RUNNERS: Record<string, OAuthFlowRunner> = {
	[OAuthFlow.AuthorizationCode]: runAuthorizationCodeFlow,
	[OAuthFlow.DeviceCode]: runDeviceCodeFlow,
	[OAuthFlow.ClientCredentials]: runClientCredentialsFlow,
} as const;

async function main() {
	const args = await parseCliArgs();

	const logger = new ConsoleLogger(LogLevel[args.logLevel]);
	const runner = RUNNERS[args.flow] ?? RUNNERS[OAuthFlow.AuthorizationCode];

	const tokenResponse = await runner({ logger }, args);

	if (args.copy) {
		await clipboard.write(tokenResponse.access_token);
		logger.info("Access token copied to clipboard");
	} else {
		logger.info(tokenResponse);
	}
}

main().catch(console.error);
