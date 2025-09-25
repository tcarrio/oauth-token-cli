import {
  LogLevel,
  type LogLevelType,
} from "@0xc/oauth-device-code-cli/src/logger";
import type { EnumKey } from "@0xc/oauth-device-code-cli/src/enum";
import { ConfigResult } from "./config";
import { parseArgs, type ParseArgsConfig } from "node:util";
import { booleanFlag, stringFlag } from "./flags";
import { z } from "zod";

type NonEmptyArray<T> = [T, ...T[]];

export type CliArgs = z.infer<typeof CliArgsSchema>;
const CliArgsSchema = z.object({
  help: z.boolean().default(false),
  clientId: z.string(),
  clientSecret: z.string().optional(),
  baseUrl: z.string(),
  scopes: z.string().optional(),
  audience: z.string(),
  flow: z.string(),
  copy: z.boolean(),
  logLevel: z.enum(
    Object.keys(LogLevel) as NonEmptyArray<EnumKey<LogLevelType>>,
  ),
  callbackUrl: z.string().optional(),
});

function showHelpForOptions(options: ParseArgsConfig["options"]): void {
  const header = "Usage: oauth-token-cli [flags]";

  if (
    typeof options === "undefined" ||
    options === null ||
    Object.keys(options).length === 0
  ) {
    console.log(header);
    return;
  }

  console.log(`
${header}

flags:
  ${Object.entries(options)
    .reduce((arr, [flag, { short }]) => {
      arr.push(`--${flag}, -${short}`);

      return arr;
    }, [] as string[])
    .join("\n  ")}
`);
}

async function parseCliArgsWithNodeUtil(): Promise<CliArgs> {
  const {
    oauth = {},
    logLevel,
    output,
  } = (await ConfigResult.loadDefault()).value;

  const options = {
    help: booleanFlag("h", false),
    "client-id": stringFlag("i", Bun.env.OAUTH_CLIENT_ID ?? oauth.clientId),
    "client-secret": stringFlag("S", Bun.env.OAUTH_CLIENT_SECRET ?? oauth?.clientSecret),
    "base-url": stringFlag("u", Bun.env.OAUTH_BASE_URL ?? oauth?.baseUrl),
    scopes: stringFlag("s", Bun.env.OAUTH_SCOPES ?? oauth?.scopes),
    audience: stringFlag("a", Bun.env.OAUTH_AUDIENCE ?? oauth?.audience),
    "callback-url": stringFlag(
      "c",
      Bun.env.OAUTH_CALLBACK_URL ?? oauth?.callbackUrl,
    ),
    flow: stringFlag("f", Bun.env.OAUTH_FLOW ?? oauth?.flow ?? "device-code"),
    "log-level": stringFlag("L", Bun.env.LOG_LEVEL ?? logLevel ?? "Info"),
    copy: booleanFlag(
      "C",
      (Bun.env.OUTPUT_TARGET ?? output?.target) === "clipboard",
    ),
  } as const;

  const { values } = parseArgs({
    options,
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
    allowNegative: true,
  });

  if (values.help) {
    showHelpForOptions(options);
    process.exit(0);
  }

  return CliArgsSchema.parse({
    clientId: values["client-id"],
    clientSecret: values["client-secret"],
    baseUrl: values["base-url"],
    scopes: values.scopes,
    audience: values.audience,
    callbackUrl: values["callback-url"],
    flow: values.flow,
    logLevel: values["log-level"],
    copy: values.copy,
  });
}

export const parseCliArgs = parseCliArgsWithNodeUtil;
