import { ModelType } from "../store";
import { toPath } from "../utils/url";
import { MethodType, mtopGet, mtopPost } from "./mtop";
import { ChatGPTApi } from "./openai";

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export type ChatModel = ModelType;

export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  available: boolean;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract models(): Promise<LLMModel[]>;
}

export class ClientApi {
  public llm: LLMApi;
  public baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BASE_URL || "http://43.142.51.24:7001";
    this.llm = new ChatGPTApi({
      baseUrl: this.baseUrl,
    });
  }

  async register(info) {
    const res = await mtopPost({
      routePath: "register",
      data: info,
    });

    return res;
  }

  async login(info) {
    const res = await mtopPost({
      routePath: "login",
      data: info,
    });

    return res;
  }

  getModels() {
    return this.llm.models();
  }
  config() {}

  prompts() {}

  masks() {}
}

export const api = new ClientApi();
