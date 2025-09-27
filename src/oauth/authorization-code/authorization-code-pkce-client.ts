import {
  ContentType,
  type HttpClient,
  type HttpRequestOptions,
} from "@0xc/oauth-device-code-cli/src/http";
import type { UrlSafeBase64Transformer } from "../../base64";
import type { Logger } from "../../logger";
import type { RandomStringGenerator } from "../../random";
import type { TokenResponse } from "../common";
import type { AuthorizationCodePkceFlowOAuthConfig } from "./authorization-code-pkce-config";

const GrantType = {
  AuthorizationCode: "authorization_code",
} as const;

const FormBody = (options: Record<string, string>) =>
  new URLSearchParams(options).toString();

export class AuthorizationCodePkceFlowOAuthClient {
  private readonly HASH_METHOD = "sha256";
  private readonly CHALLENGE_METHOD = "S256";

  constructor(
    private readonly config: AuthorizationCodePkceFlowOAuthConfig,
    private readonly httpClient: HttpClient,
    private readonly logger: Logger,
    private readonly randomStringGenerator: RandomStringGenerator,
    private readonly urlSafeBase64Transformer: UrlSafeBase64Transformer,
  ) {}

  async getAuthorizationUrl(): Promise<AuthorizationInfo> {
    const url = new URL("/authorize", this.config.baseUrl);

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const state = this.generateRandomState();

    url.searchParams.set("response_type", "code");
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", this.CHALLENGE_METHOD);
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", this.config.callbackUrl);
    url.searchParams.set("scope", this.config.scopes);
    url.searchParams.set("state", state);

    this.logger.debug({
      url,
      codeVerifier,
      state,
    });

    return {
      url: url.toString(),
      codeVerifier,
      state,
    };
  }

  async retrieveToken({
    code,
    codeVerifier,
  }: RetrieveTokenOptions): Promise<TokenResponse> {
    const url = `${this.config.baseUrl}/oauth/token`;

    const options: HttpRequestOptions = {
      headers: { "content-type": ContentType.Form },
      body: FormBody({
        grant_type: GrantType.AuthorizationCode,
        client_id: this.config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: this.config.callbackUrl,
      }),
    };

    try {
      const response = await this.httpClient.post(url, options);

      return await response.json();
    } catch (err) {
      this.logger.error("An error occurred while retrieving the token", err);

      throw err;
    }
  }

  private generateCodeVerifier() {
    return this.urlSafeBase64Transformer.toUrlSafe(
      this.randomStringGenerator.generate(32),
    );
  }

  private generateCodeChallenge(codeVerifier: string) {
    const hasher = new Bun.CryptoHasher(this.HASH_METHOD);

    hasher.update(codeVerifier);

    return this.urlSafeBase64Transformer.toUrlSafe(
      hasher.digest().toString("base64"),
    );
  }

  private generateRandomState(): string {
    return this.randomStringGenerator.generate(32);
  }
}

export interface AuthorizationInfo {
  url: string;
  codeVerifier: string;
  state: string;
}

export interface AuthorizationRedirectOptions {
  code: string;
  state: string;
}

export interface RetrieveTokenOptions {
  code: string;
  codeVerifier: string;
}
