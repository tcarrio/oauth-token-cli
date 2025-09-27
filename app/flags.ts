export function booleanFlag(short?: string, defaultValue?: boolean) {
	return {
		type: "boolean",
		default: defaultValue,
		short,
	} as const;
}

export function stringFlag(short?: string, defaultValue?: string) {
	return {
		type: "string",
		default: defaultValue,
		short,
	} as const;
}
