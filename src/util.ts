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
import ar from "./ar";

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

export const generateMetatags = async (tags: any) => {
  let result = "";

  const link = tags.image;
  const img = await getImgFromURL(link);
  const ext = getImgExtFromLink(link);
  const contentType = getImgContentType(ext);
  const newImgUrl = await postImg(img, contentType);

  result += await generateOpenGraphTags(tags);
  result += createOgMetaTag("og:image", newImgUrl);
  result += createOgMetaTag("og:type", "article");

  result += await generateTwitterTags(tags);
  result += createTwMetaTag("twitter:image", newImgUrl);

  result += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';

  return result;
};

const createOgMetaTag = (property: string, content: string) =>
    `<meta property="${property}" content="${content}" >`;

export const generateOpenGraphTags = async (tags: any) => {
  let result = "";

  const og: any = { title: "og:title", description: "og:description" };
  const keys = Object.keys(tags);

  for (const key of keys) {
    if (og[key]) {
      result += createOgMetaTag(og[key], tags[key]);
    }
  }

  return result;
};

const createTwMetaTag = (property: string, content: string) =>
    `<meta name="${property}" content="${content}" >`;

export const generateTwitterTags = async (tags: any) => {
  let result = "";

  const og: any = { title: "twitter:title", description: "twitter:description" };
  const keys = Object.keys(tags);

  for (const key of keys) {
    if (og[key]) {
      result += createTwMetaTag(og[key], tags[key]);
    }
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

export const getImgFromURL = (url: string | URL) => {
  return new Promise((resolve, reject) => {
    r({ url, method: "get", encoding: null }, (err: any, resp: any, buffer: any) => {
      if (err) {
        reject(err);
      }

      resolve(buffer);
    });
  });
};

export const postImg = async (buffer: any, contentType: string) => {
  const tx = await ar.createTransaction(buffer);
  tx.addTag("Content-Type", contentType);

  await ar.dispatchTx(tx);

  return ar.buildResourceUrl(tx.id);
};

export const getImgExtFromLink = (link: string) => {
  const extRgx = /.(apng|bmp|png|gif|jpeg|jpg|jfif|pjpeg|pjp|svg|webp)$/i;
  return link.match(extRgx)[1];
};

export const getImgContentType = (ext: string) => {
  switch (ext) {
    case "apng":
      return "image/apng";
    case "bmp":
      return "image/bmp";
    case "gif":
      return "image/gif";
    case "jpeg":
    case "jpg":
    case "jfif":
    case "pjpeg":
    case "pjp":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
  }
};

export const sentimentAnalysis = (text: string) => {
  const sentiment = new Sentiment();
  const { score } = sentiment.analyze(text);
  return score;
};

export const walletCheck = () => {
  if (!process.env.WALLET_FILE) {
    console.log("⛔ ERROR: Please specify a wallet file to load using argument " +
        "'--wallet-file <PATH>'.");
    process.exit();
  }
};

export const getLinkFromImgTag = (text: string) => {
  const imgSrcRegex = /src\s*=\s*"(.+?)"/i;
  const result = text.match(imgSrcRegex)[0];
  const link = result.slice(4);
  return link.replace(/"/g, "");
};

export const replaceImages = async (text: string) => {
  const imgTagRegex = /(<img.+\/?>)/gi;
  const map: any = {};
  let result = text;

  const imageTags = text.match(imgTagRegex);

  if (!imageTags) { return text; }

  const newImgTag = (url: any) => `<img src="${url}" />`;

  for (const imageTag of imageTags) {
    let url = getLinkFromImgTag(imageTag);
    url = url.replace(/"/g, "");
    const img = await getImgFromURL(url);
    const ext = getImgExtFromLink(url);
    const contentType = getImgContentType(ext);
    const newImgUrl = await postImg(img, contentType);
    map[imageTag] = newImgTag(newImgUrl);
  }

  for (const imageTag of Object.keys(map)) {
    result = result.replace(imageTag, map[imageTag]);
  }

  return result;
};
