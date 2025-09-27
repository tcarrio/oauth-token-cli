import type {
  Base64Decoder,
  Base64Encoder,
  UrlSafeBase64Transformer,
} from "./types";
import { WebBase64Format } from "./web-base64";

export class Base64Factory {

  getEncoder(): Base64Encoder {
    return new WebBase64Format(false);
  }

  getDecoder(): Base64Decoder {
    return new WebBase64Format(false);
  }

  getUrlSafeTransformer(): UrlSafeBase64Transformer {
    return new WebBase64Format(false);
  }
}
