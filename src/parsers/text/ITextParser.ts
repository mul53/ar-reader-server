import { IParser } from "../IParser";

export interface ITextParser extends IParser {
  contentType: "text";
  parseText(html: string, url: string): Promise<object>;
}
