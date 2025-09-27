import type { Logger } from "./types";

export class NullLogger implements Logger {
	debug(...data: unknown[]): void {
		/* no-op */
	}
	error(...data: unknown[]): void {
		/* no-op */
	}
	info(...data: unknown[]): void {
		/* no-op */
	}
	trace(...data: unknown[]): void {
		/* no-op */
	}
	warn(...data: unknown[]): void {
		/* no-op */
	}
}
