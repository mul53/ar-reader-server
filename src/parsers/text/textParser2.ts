import htmlToText from "html-to-text";
import { getRequest } from "../../util";
import { ITextParser } from "./ITextParser";

export class TextParser2 implements ITextParser {
  public static parserId = "2";
  public contentType: "text";

  public async parseText(url: string): Promise<object> {
    const { body: htmlString } = await getRequest(url);
    const parsedContent = htmlToText.fromString(htmlString, {
      ignoreHref: true,
      noLinkBrackets: true,
      tables: true,
      uppercaseHeadings: true,
      wordwrap: 100,
    });
    const result: any = { content: parsedContent };
    return result;
  }
}
