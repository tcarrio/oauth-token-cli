export interface HttpClient {
	post(url: string, options: HttpRequestOptions): Promise<HttpResponse>;
}

export type RequestHttpHeaders = Record<string, string>;

export interface ResponseHttpHeaders {
	get(name: string): string | null;
	has(name: string): boolean;
}

export interface HttpRequestOptions {
	headers?: RequestHttpHeaders;
	body?: string | null;
	/** timeout for the request measured in ms */
	timeout?: number;
}

export interface HttpResponse {
	status: number;
	headers: ResponseHttpHeaders;
	text(): Promise<string>;
	json<T = unknown>(): Promise<T>;
}
