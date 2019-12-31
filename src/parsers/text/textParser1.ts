import Mercury from "@postlight/mercury-parser";
import { ITextParser } from "./ITextParser";

export class TextParser1 implements ITextParser {
  public static parserId = "1";
  public contentType: "text";

  public async parseText(url: string): Promise<object> {
    const parsedContent: any = await Mercury.parse(url, { contentType: "text" });
    const result: any = { content: parsedContent.content };
    return result;
  }

}
