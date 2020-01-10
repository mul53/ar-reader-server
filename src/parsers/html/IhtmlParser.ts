import { IParser } from "../IParser";

export interface IHtmlParser extends IParser {
  contentType: "html";
  parseHTML(html: string, url: string): Promise<object>;
}
