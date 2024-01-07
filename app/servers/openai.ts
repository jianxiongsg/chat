import { DEFAULT_MODELS, OpenaiPath, REQUEST_TIMEOUT_MS } from "@/app/constant";
import { useAppConfig, useChatStore } from "@/app/store";

import { ChatOptions, LLMApi, LLMModel } from "./api";
import Locale from "../locales";
import { prettyObject } from "@/app/utils/format";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { MethodType, mtopGet, mtopPost, mtopStream } from "./mtop";
import { WebError } from "../utils/response";

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}
export interface ChatGPTApiProps {
  baseUrl: string;
}
export class ChatGPTApi implements LLMApi {
  private disableListModels = false;
  private baseUrl: string;
  constructor(info: ChatGPTApiProps) {
    this.baseUrl = info.baseUrl;
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
        mtopStream({
          method: MethodType.POST,
          data: requestPayload,
          signal: controller.signal,
          routePath: "chat",
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
      } else {
        const res = await mtopPost({
          data: requestPayload,
          routePath: "chat",
        });
        clearTimeout(requestTimeoutId);

        const message = this.extractMessage(res);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }

  async models(): Promise<LLMModel[]> {
    if (this.disableListModels) {
      return DEFAULT_MODELS.slice();
    }

    const res = await mtopGet({
      data: {},
      routePath: "models",
    });
    if (!res.ok) {
      return [];
    }
    const chatModels = res.data?.filter((m) => m.id.startsWith("gpt-"));
    // console.log("[Models]", resJson, chatModels);

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
