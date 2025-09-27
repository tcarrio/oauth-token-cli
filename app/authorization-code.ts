import { KyHttpClient } from "@0xc/oauth-device-code-cli/src/http";
import { WebBase64Format } from "../src/base64";
import type { TokenResponse } from "../src/oauth";
import {
  AuthorizationCodeListener,
  AuthorizationCodeListenerConfig,
  AuthorizationCodePkceFlowOAuthAgent,
  AuthorizationCodePkceFlowOAuthClient,
  AuthorizationCodePkceFlowOAuthConfig,
} from "../src/oauth/authorization-code";
import { NodeRandomStringGenerator } from "../src/random";
import type { CliArgs } from "./cli";
import type { RunnerDeps } from "./types";

export async function runAuthorizationCodeFlow(
  { logger }: RunnerDeps,
  cliArgs: CliArgs,
): Promise<TokenResponse> {
  if (!cliArgs.scopes) {
    throw new Error(
      "Scopes are required for authorization code flow. Use --scopes or set OAUTH_SCOPES environment variable.",
    );
  }

  const oauthConfig = AuthorizationCodePkceFlowOAuthConfig.fromConfigLike({
    ...cliArgs,
    scopes: cliArgs.scopes,
  } as AuthorizationCodePkceFlowOAuthConfig);
  const listenerConfig = AuthorizationCodeListenerConfig.fromCallbackUrl(
    oauthConfig.callbackUrl,
  );
  const listener = new AuthorizationCodeListener(listenerConfig, logger);

  const httpClient = new KyHttpClient(logger);
  const randomStringGenerator = new NodeRandomStringGenerator();
  const base64 = new WebBase64Format(false);

  const client = new AuthorizationCodePkceFlowOAuthClient(
    oauthConfig,
    httpClient,
    logger,
    randomStringGenerator,
    base64,
  );
  const agent = new AuthorizationCodePkceFlowOAuthAgent(
    client,
    listener,
    logger,
  );

  const auth = await agent.authenticate();

  return auth;
}
