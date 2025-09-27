import type { EnumValue } from "@0xc/oauth-device-code-cli/src/enum";
import { type Logger, LogLevel, type LogLevelType } from "./types";

export abstract class WrappedLogger {
  constructor(
    private readonly instance: Logger,
    private readonly logLevel: EnumValue<LogLevelType> = LogLevel.Info,
  ) {}

  trace(...data: unknown[]): void {
    if (this.logLevel >= LogLevel.Trace) {
      this.instance.trace(...data);
    }
  }
  debug(...data: unknown[]): void {
    if (this.logLevel >= LogLevel.Debug) {
      this.instance.debug(...data);
    }
  }
  info(...data: unknown[]): void {
    if (this.logLevel >= LogLevel.Info) {
      this.instance.info(...data);
    }
  }
  warn(...data: unknown[]): void {
    if (this.logLevel >= LogLevel.Warn) {
      this.instance.warn(...data);
    }
  }
  error(...data: unknown[]): void {
    if (this.logLevel >= LogLevel.Error) {
      this.instance.error(...data);
    }
  }
}
