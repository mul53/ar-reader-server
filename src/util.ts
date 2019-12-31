import r from "request";
import { promisify } from "util";

const get = promisify(r.get);

export const getRequest = (url: any) => get(url);
