import { IParser } from "../IParser";

export interface ITextParser extends IParser {
  contentType: "text";
  parseText(url: string): Promise<object>;
}
