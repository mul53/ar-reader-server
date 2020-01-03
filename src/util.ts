import r from "request";
import { promisify } from "util";

const get = promisify(r.get);
const post = promisify(r.post);

export const getRequest = (url: any) => get(url);
export const postRequest = (url: any, options: object) => post(url, options);
