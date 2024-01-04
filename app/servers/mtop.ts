import { toPath } from "../utils/url";
import {
  EventSourceMessage,
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

export const DEFAULT_HEADER = {
  "Content-Type": "application/json",
  "x-requested-with": "XMLHttpRequest",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Allow-Headers":
    "access-control-allow-credentials,authorization,content-type,x-requested-with",
};
export enum MethodType {
  POST = "POST",
  GET = "GET",
}
export interface ReqParams {
  routePath: string;
  data: { [key: string]: any };
  signal?: AbortSignal;
  headers?: { [key: string]: any };
}
export interface StreamReqParams extends ReqParams {
  method: MethodType;
  onopen?: (response: Response) => Promise<void>;
  onmessage?: (ev: EventSourceMessage) => void;
  onclose?: () => void;
  onerror?: (err: any) => number | void;
  openWhenHidden?: boolean;
}
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:7001";
export async function mtopPost(reqParams: ReqParams) {
  const { routePath, data, headers } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath).href;
  const res = await fetch(pathUrl, {
    method: MethodType.POST,
    body: JSON.stringify(data),
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
  });
  return res;
}

export async function mtopGet(reqParams: ReqParams) {
  const { routePath, data, headers } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath, data).href;
  const res = await fetch(pathUrl, {
    method: MethodType.GET,
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
  });
  return res;
}

export async function mtopStream(reqParams: StreamReqParams) {
  const { routePath, method, data, headers, ...args } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath).href;
  fetchEventSource(pathUrl, {
    method,
    body: JSON.stringify(data),
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
    ...args,
  });
}