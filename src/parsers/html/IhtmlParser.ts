import { IParser } from "../IParser";

export interface IHtmlParser extends IParser {
  contentType: "html";
  parseHTML(url: string): Promise<object>;
}
