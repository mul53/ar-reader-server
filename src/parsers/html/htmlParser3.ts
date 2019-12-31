import { JSDOM } from "jsdom";
import Readability from "readability";
import r from "request";
import { promisify } from "util";
import { IHtmlParser } from "./htmlParser";

const get = promisify(r.get);

export class HtmlParser3 implements IHtmlParser {
  public static parserId = "3";
  public contentType: "html";

  public async parseHTML(url: string): Promise<object> {
    const { body: htmlString } = await get(url);
    const doc = new JSDOM(htmlString, { url });
    const { content } = new Readability(doc.window.document).parse();
    const result: any = { content };
    return result;
  }
}
