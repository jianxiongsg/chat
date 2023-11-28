import { getBytes, getLines, getMessages } from "./parse";
export const EventStreamContentType = "text/event-stream";
const DefaultRetryInterval = 1000;
const LastEventId = "last-event-id";
const __rest = (s: any, e: (string | symbol)[]) => {
  const t: any = {};
  for (let p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {
      t[p] = s[p];
    }
  }
  if (s != null && typeof Object.getOwnPropertySymbols === "function") {
    const symbols = Object.getOwnPropertySymbols(s);
    for (let i = 0; i < symbols.length; i++) {
      if (
        e.indexOf(symbols[i]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(s, symbols[i])
      ) {
        t[symbols[i]] = s[symbols[i]];
      }
    }
  }
  return t;
};
export function fetchEventSource(input, reqParams, local) {
  const {
    signal: inputSignal,
    onopen: inputOnOpen,
    onmessage,
    onclose,
    onerror,
    openWhenHidden,
    fetch: inputFetch,
  } = local;
  const rest = __rest(reqParams, [
    "signal",
    "headers",
    "onopen",
    "onmessage",
    "onclose",
    "onerror",
    "openWhenHidden",
    "fetch",
  ]);
  const { headers: inputHeaders } = reqParams;
  return new Promise((resolve, reject) => {
    const headers = Object.assign({}, inputHeaders);
    if (!headers.accept) {
      headers.accept = EventStreamContentType;
    }
    let curRequestController;
    function onVisibilityChange() {
      curRequestController.abort();
      if (!document.hidden) {
        create();
      }
    }
    if (typeof document !== "undefined" && !openWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    let retryInterval = DefaultRetryInterval;
    let retryTimer;
    function dispose() {
      if (typeof document !== "undefined" && !openWhenHidden) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      clearTimeout(retryTimer);
      curRequestController.abort();
    }
    inputSignal === null || inputSignal === void 0
      ? void 0
      : inputSignal.addEventListener("abort", () => {
          dispose();
          resolve(true);
        });
    const fetchFn =
      inputFetch !== null && inputFetch !== void 0 ? inputFetch : fetch;
    const onopen =
      inputOnOpen !== null && inputOnOpen !== void 0
        ? inputOnOpen
        : defaultOnOpen;
    async function create() {
      let _a;
      curRequestController = new AbortController();
      try {
        const response = await fetchFn(
          input,
          Object.assign(Object.assign({}, reqParams, headers)),
        );
        await onopen(response);
        await getBytes(
          response.body,
          getLines(
            getMessages(
              onmessage,
              (id) => {
                if (id) {
                  headers[LastEventId] = id;
                } else {
                  delete headers[LastEventId];
                }
              },
              (retry) => {
                retryInterval = retry;
              },
            ),
          ),
        );
        onclose === null || onclose === void 0 ? void 0 : onclose();
        dispose();
        resolve(true);
      } catch (err) {
        if (!curRequestController.signal.aborted) {
          try {
            const interval =
              (_a =
                onerror === null || onerror === void 0
                  ? void 0
                  : onerror(err)) !== null && _a !== void 0
                ? _a
                : retryInterval;
            clearTimeout(retryTimer);
            retryTimer = setTimeout(create, interval);
          } catch (innerErr) {
            dispose();
            reject(innerErr);
          }
        }
      }
    }
    create();
  });
}

export function requestReadableStream(
  path: string,
  reqParams: { [key: string]: any },
  local: { [key: string]: any },
) {
  return new Promise((resolve, reject) => {
    const { onopen, onmessage, onclose, onerror, fetch: inputFetch } = local;
    if (!reqParams.headers.accept) {
      reqParams.headers.accept = EventStreamContentType;
    }
    const fetchFn =
      inputFetch !== null && inputFetch !== void 0 ? inputFetch : fetch;
    async function create() {
      try {
        const response = await fetchFn(
          path,
          Object.assign(Object.assign({}, reqParams)),
        );
        const reader = response.body.getReader();
        let responseText = "";
        new ReadableStream({
          start(controller) {
            function read() {
              reader.read().then((data: any) => {
                const { done, value } = data;
                if (done) {
                  controller.close();
                  onclose();
                  resolve(true);
                  return;
                }
                const decoder = new TextDecoder("utf-8");

                try {
                  const utf8Val = decoder
                    .decode(value, { stream: true })
                    .trim();
                  console.log("........txt", Date.now(), responseText);
                  console.log(utf8Val);
                  // const dataJson = JSON.parse(utf8Val);
                  // responseText += dataJson?.choices?.[0].delta?.content;
                  // onmessage({ text: responseText, content: dataJson })
                  // // options.onUpdate(
                  // //     responseText,
                  // //     dataJson?.choices?.[0].delta?.content,
                  // // );
                  // console.log(dataJson?.choices?.[0].delta?.content);
                } catch (error) {
                  console.log(error);
                }
                // 处理每个数据块
                // controller.enqueue(value);
                read();
              });
            }

            read();
          },
        });
      } catch (err) {
        onerror(err);
        reject(err);
      }
    }
    create();
  });
}

function defaultOnOpen(response) {
  const contentType = response.headers.get("content-type");
  if (
    !(contentType === null || contentType === void 0
      ? void 0
      : contentType.startsWith(EventStreamContentType))
  ) {
    throw new Error(
      `Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`,
    );
  }
}
//# sourceMappingURL=fetch.js.map
