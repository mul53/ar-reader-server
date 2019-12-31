import { IParser } from "../baseParser";

export interface IHtmlParser extends IParser {
  contentType: "html";
  parseHTML(url: string): Promise<object>;
}
