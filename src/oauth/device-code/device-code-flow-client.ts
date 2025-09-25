import { time } from "@0xc/oauth-device-code-cli/src/time";
import {
  FormBody,
  type HttpClient,
  type HttpRequestOptions,
} from "@0xc/oauth-device-code-cli/src/http";
import type { TokenResponse } from "../common";
import type { DeviceCodeFlowOAuthConfig } from "./device-code-flow-config";

const ContentType = {
  Form: "application/x-www-form-urlencoded",
} as const;

const GrantType = {
  DeviceCode: "urn:ietf:params:oauth:grant-type:device_code",
} as const;

export class DeviceCodeFlowOAuthClient {
  constructor(
    private readonly config: DeviceCodeFlowOAuthConfig,
    private readonly httpClient: HttpClient,
  ) {}

  async getDeviceCode(): Promise<DeviceCodeResponse> {
    const url = `${this.config.baseUrl}/oauth/device/code`;
    const options: HttpRequestOptions = {
      headers: { "content-type": ContentType.Form },
      body: FormBody({
        client_id: this.config.clientId,
        scope: this.config.scopes,
        audience: this.config.audience,
      }),
    };

    try {
      const response = await this.httpClient.post(url, options);
      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as { response: { text(): Promise<string>; status: number; statusText: string } };
        try {
          const errorBody = await httpError.response.text();
          throw new Error(
            `Device code request failed (${httpError.response.status} ${httpError.response.statusText}): ${errorBody}`
          );
        } catch {
          // If we can't read the response body, fall back to the original error
        }
      }
      throw error;
    }
  }

  async retrieveToken({
    device_code,
    interval,
  }: DeviceCodeResponse): Promise<TokenResponse> {
    const url = `${this.config.baseUrl}/oauth/token`;
    const options: HttpRequestOptions = {
      headers: { "content-type": ContentType.Form },
      body: FormBody({
        grant_type: GrantType.DeviceCode,
        device_code: device_code,
        client_id: this.config.clientId,
      }),
      timeout: interval * time.Second,
    };

    try {
      const response = await this.httpClient.post(url, options);
      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as { response: { text(): Promise<string>; status: number; statusText: string } };
        try {
          const errorBody = await httpError.response.text();
          throw new Error(
            `Token retrieval failed (${httpError.response.status} ${httpError.response.statusText}): ${errorBody}`
          );
        } catch {
          // If we can't read the response body, fall back to the original error
        }
      }
      throw error;
    }
  }
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: `${string}?user_code=${DeviceCodeResponse["user_code"]}`;
  /**
   * The number of seconds in which the device code and user code will expire.
   */
  expires_in: number;
  /**
   * The interval at which to poll for successful authorization measured in seconds
   */
  interval: number;
}
