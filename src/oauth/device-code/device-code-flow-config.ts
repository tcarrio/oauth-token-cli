import type { z } from "zod";
import { OAuthConfig } from "../common";

export class DeviceCodeFlowOAuthConfig
  extends OAuthConfig
  implements z.infer<(typeof DeviceCodeFlowOAuthConfig)["SCHEMA"]>
{
  static fromConfigLike(
    config: DeviceCodeFlowOAuthConfig,
  ): DeviceCodeFlowOAuthConfig {
    return new DeviceCodeFlowOAuthConfig(
      config.clientId,
      config.scopes,
      config.audience,
      config.baseUrl,
    );
  }
}
