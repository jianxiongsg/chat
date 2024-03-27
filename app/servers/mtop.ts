import { toPath } from "../utils/url";
import {
  EventSourceMessage,
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

export const DEFAULT_HEADER = {
  "Content-Type": "application/json",
  "x-requested-with": "XMLHttpRequest",
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
const BASE_URL = process.env.BASE_URL || "http://43.142.51.24:7001";
function checkLogin(info) {
  if (info?.code === "NEED_LOGIN") {
    window.location.href = window.location.origin + "/#/user/login";
  }
}
export async function mtopPost(reqParams: ReqParams) {
  const { routePath, data, headers } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath).href;
  const res = await fetch(pathUrl, {
    method: MethodType.POST,
    credentials: "include",
    body: JSON.stringify(data),
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
  });
  const resJson = await res.json();
  checkLogin(resJson);
  return res;
}

export async function mtopGet(reqParams: ReqParams) {
  const { routePath, data, headers } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath, data).href;
  const res = await fetch(pathUrl, {
    method: MethodType.GET,
    credentials: "include",
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
  });
  const resJson = await res.json();
  checkLogin(resJson);
  return resJson;
}

export async function mtopStream(reqParams: StreamReqParams) {
  const { routePath, method, data, headers, ...args } = reqParams;
  const pathUrl = toPath(BASE_URL, routePath).href;
  fetchEventSource(pathUrl, {
    method,
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      ...DEFAULT_HEADER,
      ...(headers || {}),
    },
    ...args,
  });
}
