import { z } from "zod";

export class ClientCredentialsFlowOAuthConfig
	implements z.infer<(typeof ClientCredentialsFlowOAuthConfig)["SCHEMA"]>
{
	static SCHEMA = z.object({
		clientId: z.string().min(1).readonly(),
		clientSecret: z.string().min(1).readonly(),
		scopes: z.string().optional().readonly(),
		audience: z.string().url().readonly(),
		baseUrl: z.string().url().readonly(),
	});

	constructor(
		public readonly clientId: string,
		public readonly scopes: string | undefined,
		public readonly audience: string,
		public readonly baseUrl: string,
		public readonly clientSecret: string,
	) {}

	static fromConfigLike(
		config: ClientCredentialsFlowOAuthConfig,
	): ClientCredentialsFlowOAuthConfig {
		return new ClientCredentialsFlowOAuthConfig(
			config.clientId,
			config.scopes,
			config.audience,
			config.baseUrl,
			config.clientSecret,
		);
	}
}
