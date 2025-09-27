import type { KyResponse } from "ky";
import ky from "ky";
import type { Logger } from "../logger";
import type {
	HttpClient,
	HttpRequestOptions,
	HttpResponse,
	ResponseHttpHeaders,
} from "./types";

export class KyHttpClient implements HttpClient {
	constructor(private readonly logger: Logger) {}

	async post(url: string, options: HttpRequestOptions): Promise<HttpResponse> {
		this.logger.debug(url, options);

		return await ky.post(url, options);
	}
}

export class KyHttpResponse implements HttpResponse {
	constructor(private readonly response: KyResponse) {}

	async json<T>(): Promise<T> {
		return this.response.json();
	}

	async text(): Promise<string> {
		return this.response.text();
	}

	get headers(): ResponseHttpHeaders {
		return this.response.headers;
	}

	get status(): number {
		return this.response.status;
	}
}
