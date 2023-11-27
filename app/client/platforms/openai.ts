import {
  DEFAULT_API_HOST,
  DEFAULT_MODELS,
  OpenaiPath,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";

import { ChatOptions, getHeaders, LLMApi, LLMModel, LLMUsage } from "../api";
import Locale from "../../locales";
import { prettyObject } from "@/app/utils/format";
import { getClientConfig } from "@/app/config/client";
import { onSubmit } from "../chatDemo";
// import { EventStreamContentType, fetchEventSource } from "../fetchEventSource";
import { requestReadableStream } from "../fetchEventSource/fetch";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}
const BASE_URL = "http://127.0.0.1:7001";
export class ChatGPTApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    let openaiUrl = useAccessStore.getState().openaiUrl;
    const apiPath = "/api/openai";

    if (openaiUrl.length === 0) {
      const isApp = !!getClientConfig()?.isApp;
      openaiUrl = isApp ? DEFAULT_API_HOST : apiPath;
    }
    if (openaiUrl.endsWith("/")) {
      openaiUrl = openaiUrl.slice(0, openaiUrl.length - 1);
    }
    if (!openaiUrl.startsWith("http") && !openaiUrl.startsWith(apiPath)) {
      openaiUrl = "https://" + openaiUrl;
    }
    return [openaiUrl, path].join("/");
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: v.content,
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const requestPayload = {
      messages,
      stream: true, //options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
    };

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(OpenaiPath.ChatPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };
      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      if (shouldStream) {
        let responseText = "";
        let finished = false;

        const finish = () => {
          if (!finished) {
            options.onFinish(responseText);
            finished = true;
          }
        };

        controller.signal.onabort = finish;
        fetchEventSource("http://127.0.0.1:7001/chat/", {
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");
            console.log(
              "[OpenAI] request response content type: ",
              contentType,
            );

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }
            console.log("........headers", res.headers.get("content-type"));
            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [responseText];
              let extraInfo = await res.clone().text();
              try {
                const resJson = await res.clone().json();
                extraInfo = prettyObject(resJson);
              } catch (err) {
                console.log("err", err);
              }

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              responseText = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage(msg) {
            console.log("........msg", msg);
            if (msg.data === "[DONE]" || finished) {
              return finish();
            }
            const text = msg.data;
            try {
              const json = JSON.parse(text);
              responseText += json.msg;
              options.onUpdate?.(responseText, json.msg);
              // const delta = json.choices[0].delta.content;
              // if (delta) {
              //   responseText += delta;
              //   options.onUpdate?.(responseText, delta);
              // }
            } catch (e) {
              console.error("[Request] parse error", text, msg);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            options.onError?.(e);
            throw e;
          },
          openWhenHidden: true,
        });
        //'https://api.openai.com' +

        // onSubmit(chatPayload, options);
        // return;
        // requestReadableStream("http://127.0.0.1:7001/chat/", chatPayload, {
        //   // fetchEventSource('https://chat-gpt-web-weld-eight.vercel.app/api/openai/v1/chat/completions', {

        //   async onopen(res) {
        //     clearTimeout(requestTimeoutId);
        //     const contentType = res.headers.get("content-type");
        //     console.log(
        //       "[OpenAI] request response content type: ",
        //       contentType,
        //     );

        //     if (contentType?.startsWith("text/plain")) {
        //       responseText = await res.clone().text();
        //       return finish();
        //     }

        //     if (
        //       !res.ok ||
        //       !res.headers
        //         .get("content-type")
        //         ?.startsWith(EventStreamContentType) ||
        //       res.status !== 200
        //     ) {
        //       console.log(".....res", res, responseText);
        //       const responseTexts = [responseText];
        //       let extraInfo = await res.clone().text();
        //       try {
        //         const resJson = await res.clone().json();
        //         extraInfo = prettyObject(resJson);
        //       } catch {}

        //       if (res.status === 401) {
        //         responseTexts.push(Locale.Error.Unauthorized);
        //       }

        //       if (extraInfo) {
        //         responseTexts.push(extraInfo);
        //       }

        //       responseText = responseTexts.join("\n\n");

        //       return finish();
        //     }
        //   },
        //   onmessage(msg) {
        //     console.log("..........msg", msg);
        //     return;
        //     // if (msg.data === "[DONE]" || finished) {
        //     //   return finish();
        //     // }
        //     // const text = msg.data;
        //     // try {
        //     //   const json = JSON.parse(text);
        //     //   const delta = json.choices[0].delta.content;
        //     //   if (delta) {
        //     //     responseText += delta;
        //     //     options.onUpdate?.(responseText, delta);
        //     //   }
        //     // } catch (e) {
        //     //   console.error("[Request] parse error", text, msg);
        //     // }
        //   },
        //   onclose() {
        //     console.log(".....onclose");
        //     finish();
        //   },
        //   onerror(e) {
        //     console.log(".....err", e);
        //     options.onError?.(e);
        //     throw e;
        //   },
        //   openWhenHidden: true,
        // });
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const message = this.extractMessage(resJson);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;
    const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = formatDate(startOfMonth);
    const endDate = formatDate(new Date(Date.now() + ONE_DAY));

    const [used, subs] = await Promise.all([
      fetch(
        this.path(
          `${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`,
        ),
        {
          method: "GET",
          headers: getHeaders(),
        },
      ),
      fetch(this.path(OpenaiPath.SubsPath), {
        method: "GET",
        headers: getHeaders(),
      }),
    ]);

    if (used.status === 401) {
      throw new Error(Locale.Error.Unauthorized);
    }

    if (!used.ok || !subs.ok) {
      throw new Error("Failed to query usage from openai");
    }

    const response = (await used.json()) as {
      total_usage?: number;
      error?: {
        type: string;
        message: string;
      };
    };

    const total = (await subs.json()) as {
      hard_limit_usd?: number;
    };

    if (response.error && response.error.type) {
      throw Error(response.error.message);
    }

    if (response.total_usage) {
      response.total_usage = Math.round(response.total_usage) / 100;
    }

    if (total.hard_limit_usd) {
      total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
    }

    return {
      used: response.total_usage,
      total: total.hard_limit_usd,
    } as LLMUsage;
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await fetch(this.path(OpenaiPath.ListModelPath), {
      method: "GET",
      headers: {
        ...getHeaders(),
      },
    });

    const resJson = (await res.json()) as OpenAIListModelResponse;
    const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
    console.log("[Models]", chatModels);

    if (!chatModels) {
      return [];
    }

    return chatModels.map((m) => ({
      name: m.id,
      available: true,
    }));
  }
}
export { OpenaiPath };
