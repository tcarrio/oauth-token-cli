export interface Base64Encoder {
	encode(input: string): string;
}

export interface Base64Decoder {
	decode(input: string): string;
}

export interface UrlSafeBase64Transformer {
	toUrlSafe(input: string): string;
}
