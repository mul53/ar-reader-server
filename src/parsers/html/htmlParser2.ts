import { JSDOM } from "jsdom";
import Readability from "readability";
import { getRequest } from "../../util";
import { IHtmlParser } from "./IhtmlParser";

export class HtmlParser2 implements IHtmlParser {
  public static parserId = "2";
  public contentType: "html";

  public async parseHTML(html: string, url: string): Promise<object> {
    const doc = new JSDOM(html, { url });
    const { content, title } = new Readability(doc.window.document).parse();
    const result = {
      content,
      title
    };
    return result;
  }
}
