export interface TokenResponse {
	/** JWT when using OIDC */
	access_token: string;
	/** Defined when scope `offline_access` included */
	refresh_token?: string;
	/** JWT when using OIDC */
	id_token?: string;
	/** The scopes provided to initial OAuth flow */
	scope: string;
	/** measured in seconds */
	expires_in: number;
	token_type: "Bearer" | string;
}

export const OAuthFlow = {
	AuthorizationCode: "authorization-code",
	DeviceCode: "device-code",
	ClientCredentials: "client-credentials",
} as const;
