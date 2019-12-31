import { IHtmlParser } from "./htmlParser";
import { HtmlParser1 } from "./htmlParser1";

export function getHTMLParser(parserId: string): IHtmlParser {
  switch (parserId) {
    case HtmlParser1.parserId:
      return new HtmlParser1();
    default:
      return new HtmlParser1();
  }
}

export function getHTMLParserIds(): string[] {
  return [
    HtmlParser1
  ].map( (htmlParser) => htmlParser.parserId );
}
