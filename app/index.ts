#!/usr/bin/env bun

import clipboard from "clipboardy";
import { OAuthFlow } from "@0xc/oauth-device-code-cli/src/oauth";
import { parseCliArgs, type CliArgs } from "./cli";
import { runDeviceCodeFlow } from "./device-code";
import { runAuthorizationCodeFlow } from "./authorization-code";
import { runClientCredentialsFlow } from "./client-credentials";
import { ConsoleLogger, LogLevel } from "../src/logger";
import type { OAuthFlowRunner } from "./types";

const RUNNERS: Record<string, OAuthFlowRunner> = {
  [OAuthFlow.AuthorizationCode]: runAuthorizationCodeFlow,
  [OAuthFlow.DeviceCode]: runDeviceCodeFlow,
  [OAuthFlow.ClientCredentials]: runClientCredentialsFlow,
} as const;

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
