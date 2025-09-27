import {
  type HttpClient,
  type HttpRequestOptions,
  JsonBody,
} from "@0xc/oauth-device-code-cli/src/http";
import type { TokenResponse } from "../common";
import type { ClientCredentialsFlowOAuthConfig } from "./client-credentials-flow-config";

const ContentType = {
  Json: "application/json",
} as const;

const GrantType = {
  ClientCredentials: "client_credentials",
} as const;

export class ClientCredentialsFlowOAuthClient {
  constructor(
    private readonly config: ClientCredentialsFlowOAuthConfig,
    private readonly httpClient: HttpClient,
  ) {}

  async getAccessToken(): Promise<TokenResponse> {
    const url = `${this.config.baseUrl}/oauth/token`;
    const requestBody: Record<string, string> = {
      grant_type: GrantType.ClientCredentials,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      audience: this.config.audience,
    };

    // Only include scope if it's provided
    if (this.config.scopes) {
      requestBody.scope = this.config.scopes;
    }

    const options: HttpRequestOptions = {
      headers: { "content-type": ContentType.Json },
      body: JsonBody(requestBody),
    };

    try {
      const response = await this.httpClient.post(url, options);
      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as {
          response: {
            text(): Promise<string>;
            status: number;
            statusText: string;
          };
        };
        try {
          const errorBody = await httpError.response.text();
          throw new Error(
            `OAuth token request failed (${httpError.response.status} ${httpError.response.statusText}): ${errorBody}`,
          );
        } catch {
          // If we can't read the response body, fall back to the original error
        }
      }
      throw error;
    }
  }
}
