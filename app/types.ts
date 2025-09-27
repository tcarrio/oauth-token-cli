import type { Logger } from "../src/logger";
import type { TokenResponse } from "../src/oauth";
import type { CliArgs } from "./cli";

export interface RunnerDeps {
  logger: Logger;
}

export type OAuthFlowRunner = (
  deps: RunnerDeps,
  cliArgs: CliArgs,
) => Promise<TokenResponse>;
