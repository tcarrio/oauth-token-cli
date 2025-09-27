import type { Logger } from "@0xc/oauth-device-code-cli/src/logger";
import { time } from "@0xc/oauth-device-code-cli/src/time";
import { $ } from "bun";
import type { TokenResponse } from "../common";
import type {
	DeviceCodeFlowOAuthClient,
	DeviceCodeResponse,
} from "./device-code-flow-client";

export class DeviceCodeFlowOAuthAgent {
	constructor(
		private readonly client: DeviceCodeFlowOAuthClient,
		private readonly logger: Logger,
	) {}

	async authenticate(): Promise<TokenResponse> {
		const deviceCodeResponse = await this.client.getDeviceCode();

		return this.pollForAccessToken(deviceCodeResponse);
	}

	private async pollForAccessToken(deviceCodeResponse: DeviceCodeResponse) {
		const { verification_uri_complete, user_code, interval } =
			deviceCodeResponse;

		this.logger.info(`Open "${verification_uri_complete}" in your browser`);
		try {
			this.logger.info(
				`Your user's device code is "${user_code}". Please confirm this is correct before logging in!`,
			);
			await $`open "${verification_uri_complete}"`;
		} catch (error) {
			this.logger.info(`Open "${verification_uri_complete}" in your browser`);
		}

		this.logger.info("Waiting while you authorize in your browser...");
		const now = Date.now();
		const maximumWaitDatetime = now + time.Minute * 10;

		while (maximumWaitDatetime > Date.now()) {
			const nextStartTime = Date.now() + interval * time.Second;

			const [codeResponse] = await Promise.allSettled([
				this.client.retrieveToken(deviceCodeResponse),
			]);

			switch (codeResponse.status) {
				case "fulfilled":
					return codeResponse.value;
				default: {
					this.logger.debug("Waiting for next poll...");

					const timeToWait = nextStartTime - Date.now();
					if (timeToWait > 0) {
						await this.sleep(timeToWait);
					}
				}
			}
		}

		throw new Error("Timeout while waiting for user to authorize");
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
