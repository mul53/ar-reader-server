import { JSDOM } from "jsdom";
import Metascraper from "metascraper";
import MetascraperDate from "metascraper-date";
import MetascraperDescription from "metascraper-description";
import MetascraperImage from "metascraper-image";
import MetascraperPublisher from "metascraper-publisher";
import MetascraperTitle from "metascraper-title";
import Readability from "readability";
import r from "request";
import Sentiment from "sentiment";
import { promisify } from "util";

const metascraper = Metascraper([
  MetascraperTitle(),
  MetascraperDate(),
  MetascraperDescription(),
  MetascraperImage(),
  MetascraperPublisher()
]);

const get = promisify(r.get);
const post = promisify(r.post);

export const getRequest = (url: any) => get(url);
export const postRequest = (url: any, options: object) => post(url, options);

export const contentTypeSupported = (str: string) =>
  str === "html" || str === "text";

export const extractMeta = async (html: string, url: string) => {
  const metadata = await metascraper({ html, url });
  return metadata;
};

export const getMetatags = (html: string) => {
  const dom = new JSDOM(html);
  const metaTags = dom.window.document.getElementsByTagName("meta");
  const result = [...metaTags].map((tag) => tag.outerHTML);
  return result.join("");
};

export const generateMetatags = (tags: any) => {
  let result = "";

  result += generateOpenGraphTags(tags);
  result += generateTwitterTags(tags);

  result += createOgMetaTag("og:type", "article");
  result += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';

  return result;
};

const createOgMetaTag = (property: string, content: string) =>
    `<meta property="${property}" content="${content}" >`;

export const generateOpenGraphTags = (tags: any) => {
  let result = "";

  const og: any = { image: "og:image", title: "og:title", description: "og:description" };
  const keys = Object.keys(tags);

  for (const key of keys) {
    if (og[key]) { result += createOgMetaTag(og[key], tags[key]); }
  }

  return result;
};

const createTwMetaTag = (property: string, content: string) =>
    `<meta name="${property}" content="${content}" >`;

export const generateTwitterTags = (tags: any) => {
  let result = "";

  const og: any = { image: "twitter:image", title: "twitter:title", description: "twitter:description" };
  const keys = Object.keys(tags);

  for (const key of keys) {
    if (og[key]) { result += createTwMetaTag(og[key], tags[key]); }
  }

  return result;
};

export const getTitle = async (html: string) => {
  const dom = new JSDOM(html);
  const collection = dom.window.document.getElementsByTagName("title");
  const title = collection[0];
  if (title) { return title.textContent; }
};

export const getTitleTag = (html: string) => {
  const dom = new JSDOM(html);
  const collection = dom.window.document.getElementsByTagName("title");
  const title = collection[0];
  if (title) { return title.outerHTML; }
};

export const getDescription = (html: string, url: string) => {
  const doc = new JSDOM(html, { url });
  const { excerpt } = new Readability(doc.window.document).parse();
  return excerpt;
};

export const sentimentAnalysis = (text: string) => {
  const sentiment = new Sentiment();
  const { score } = sentiment.analyze(text);
  return score;
};
