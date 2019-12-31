import { ITextParser } from "./ITextParser";
import { TextParser1 } from "./textParser1";

export function getTextParser(parserId: string): ITextParser {
  switch (parserId) {
    case TextParser1.parserId:
      return new TextParser1();
    default:
      return new TextParser1();
  }
}
