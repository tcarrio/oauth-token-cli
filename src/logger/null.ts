import type { Logger } from "./types";

export class NullLogger implements Logger {
  debug(..._data: unknown[]): void {
    /* no-op */
  }
  error(..._data: unknown[]): void {
    /* no-op */
  }
  info(..._data: unknown[]): void {
    /* no-op */
  }
  trace(..._data: unknown[]): void {
    /* no-op */
  }
  warn(..._data: unknown[]): void {
    /* no-op */
  }
}
