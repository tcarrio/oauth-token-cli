import type { CliArgs } from "./cli";
import { KyHttpClient } from "@0xc/oauth-device-code-cli/src/http";
import {
  AuthorizationCodePkceFlowOAuthConfig,
  AuthorizationCodePkceFlowOAuthClient,
  AuthorizationCodePkceFlowOAuthAgent,
  AuthorizationCodeListenerConfig,
  AuthorizationCodeListener,
} from "../src/oauth/authorization-code";
import type { TokenResponse } from "../src/oauth";
import type { RunnerDeps } from "./types";
import { NodeRandomStringGenerator } from "../src/random";
import { WebBase64Format } from "../src/base64";

export async function runAuthorizationCodeFlow(
  { logger }: RunnerDeps,
  cliArgs: CliArgs,
): Promise<TokenResponse> {
  if (!cliArgs.scopes) {
    throw new Error(
      "Scopes are required for authorization code flow. Use --scopes or set OAUTH_SCOPES environment variable.",
    );
  }

  const oauthConfig = AuthorizationCodePkceFlowOAuthConfig.fromConfigLike(
    { ...cliArgs, scopes: cliArgs.scopes } as AuthorizationCodePkceFlowOAuthConfig,
  );
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
