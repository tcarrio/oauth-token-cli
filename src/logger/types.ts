export interface Logger {
	debug(...data: unknown[]): void;
	error(...data: unknown[]): void;
	info(...data: unknown[]): void;
	trace(...data: unknown[]): void;
	warn(...data: unknown[]): void;
}

export type LogLevelType = typeof LogLevel;
export const LogLevel = {
	Trace: 100,
	Debug: 75,
	Info: 50,
	Warn: 25,
	Error: 0,
} as const;
