import Mercury from "@postlight/mercury-parser";
import { IHtmlParser } from "./IhtmlParser";

export class HtmlParser1 implements IHtmlParser {
  public static parserId = "1";
  public contentType: "html";

  public async parseHTML(url: string): Promise<object> {
    const parsedContent: any = await Mercury.parse(url);
    const result: any = { content: parsedContent.content };
    return result;
  }
}
