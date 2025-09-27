import { z } from "zod";
import { OAuthConfig } from "../common";

export class AuthorizationCodePkceFlowOAuthConfig
  extends OAuthConfig
  implements z.infer<(typeof AuthorizationCodePkceFlowOAuthConfig)["SCHEMA"]>
{
  public static readonly SCHEMA = OAuthConfig.SCHEMA.extend({
    callbackUrl: z.string().url(),
  });

  constructor(
    clientId: string,
    scopes: string,
    audience: string,
    baseUrl: string,
    public readonly callbackUrl: string,
  ) {
    super(clientId, scopes, audience, baseUrl);
    AuthorizationCodePkceFlowOAuthConfig.SCHEMA.parse(this);
  }

  static fromConfigLike(
    maybeConfig: unknown,
  ): AuthorizationCodePkceFlowOAuthConfig {
    const config =
      AuthorizationCodePkceFlowOAuthConfig.SCHEMA.parse(maybeConfig);

    return new AuthorizationCodePkceFlowOAuthConfig(
      config.clientId,
      config.scopes,
      config.audience,
      config.baseUrl,
      config.callbackUrl,
    );
  }
}
