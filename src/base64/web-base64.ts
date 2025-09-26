import type {
  Base64Decoder,
  Base64Encoder,
  UrlSafeBase64Transformer,
} from "./types";

export class WebBase64Format
  implements Base64Encoder, Base64Decoder, UrlSafeBase64Transformer
{
  constructor(private readonly urlSafe: boolean) {}

  public encode(input: string): string {
    const encoded = btoa(input);

    if (!this.urlSafe) {
      return encoded;
    }

    return this.toUrlSafe(encoded);
  }

  public decode(input: string): string {
    return atob(input);
  }

  public toUrlSafe(encoded: string): string {
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}
