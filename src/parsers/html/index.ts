import { HtmlParser1 } from "./htmlParser1";
import { HtmlParser2 } from "./htmlParser2";
import { IHtmlParser } from "./IhtmlParser";

export function getHTMLParser(parserId: string): IHtmlParser {
  switch (parserId) {
    case HtmlParser1.parserId:
      return new HtmlParser1();
    case HtmlParser2.parserId:
      return new HtmlParser2();
    default:
      return new HtmlParser1();
  }
}

export function getHTMLParserIds(): string[] {
  return [
    HtmlParser1,
    HtmlParser2
  ].map( (htmlParser) => htmlParser.parserId );
}
