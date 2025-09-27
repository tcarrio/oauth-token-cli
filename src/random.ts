import { randomBytes } from "node:crypto";

export interface RandomStringGenerator {
  generate(length: number): string;
}

export class NodeRandomStringGenerator implements RandomStringGenerator {
  public generate(length: number): string {
    return randomBytes(length).toString("base64");
  }
}
