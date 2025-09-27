import { z } from "zod";

export abstract class OAuthConfig
  implements z.infer<(typeof OAuthConfig)["SCHEMA"]>
{
  public static readonly SCHEMA = z.object({
    clientId: z.string().min(1).readonly(),
    scopes: z.string().min(1).readonly(),
    audience: z.string().url().readonly(),
    baseUrl: z.string().url().readonly(),
  });

  constructor(
    public readonly clientId: string,
    public readonly scopes: string,
    public readonly audience: string,
    public readonly baseUrl: string,
  ) {}
}
