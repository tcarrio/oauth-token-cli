import type { Logger } from "@0xc/oauth-device-code-cli/src/logger";
import type { ClientCredentialsFlowOAuthClient } from "./client-credentials-flow-client";
import type { TokenResponse } from "../common";

export class ClientCredentialsFlowOAuthAgent {
  constructor(
    private readonly client: ClientCredentialsFlowOAuthClient,
    private readonly logger: Logger,
  ) {}

  async authenticate(): Promise<TokenResponse> {
    this.logger.debug("Requesting access token using client credentials flow");

    const tokenResponse = await this.client.getAccessToken();

    this.logger.debug("Successfully obtained access token");

    return tokenResponse;
  }
}