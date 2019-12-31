import { extract } from "article-parser";
import { IHtmlParser } from "./htmlParser";

export class HtmlParser2 implements IHtmlParser {
  public static parserId = "2";
  public contentType: "html";

  public async parseHTML(url: string): Promise<object> {
    const parsedContent: any = await extract(url);
    const result: any = { content: parsedContent.content };
    return result;
  }
}
