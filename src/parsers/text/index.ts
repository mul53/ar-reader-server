import { ITextParser } from "./ITextParser";
import { TextParser1 } from "./textParser1";
import { TextParser2 } from "./textParser2";

export function getTextParser(parserId: string): ITextParser {
  switch (parserId) {
    case TextParser1.parserId:
      return new TextParser1();
    case TextParser2.parserId:
      return new TextParser2();
    default:
      return new TextParser1();
  }
}
