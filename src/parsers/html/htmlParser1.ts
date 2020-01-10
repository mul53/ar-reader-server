import Mercury from "@postlight/mercury-parser";
import { IHtmlParser } from "./IhtmlParser";

export class HtmlParser1 implements IHtmlParser {
  public static parserId = "1";
  public contentType: "html";

  public async parseHTML(html: string, url: string): Promise<object> {
    const { title, content } = await Mercury.parse(url, { html });
    const result = {
      content,
      title,
    };
    return result;
  }
}
