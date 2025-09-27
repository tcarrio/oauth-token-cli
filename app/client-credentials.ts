import { KyHttpClient } from "@0xc/oauth-device-code-cli/src/http";
import type { TokenResponse } from "../src/oauth";
import {
  ClientCredentialsFlowOAuthAgent,
  ClientCredentialsFlowOAuthClient,
  ClientCredentialsFlowOAuthConfig,
} from "../src/oauth/client-credentials";
import type { CliArgs } from "./cli";
import type { RunnerDeps } from "./types";

export async function runClientCredentialsFlow(
  { logger }: RunnerDeps,
  { logLevel, clientSecret, ...config }: CliArgs,
): Promise<TokenResponse> {
  if (!clientSecret) {
    throw new Error(
      "Client secret is required for client credentials flow. Use --client-secret or set OAUTH_CLIENT_SECRET environment variable.",
    );
  }

  const oauthConfig = new ClientCredentialsFlowOAuthConfig(
    config.clientId,
    config.scopes,
    config.audience,
    config.baseUrl,
    clientSecret,
  );

  const httpClient = new KyHttpClient(logger);
  const client = new ClientCredentialsFlowOAuthClient(oauthConfig, httpClient);
  const agent = new ClientCredentialsFlowOAuthAgent(client, logger);

  return await agent.authenticate();
}
