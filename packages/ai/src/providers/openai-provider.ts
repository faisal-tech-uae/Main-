import OpenAI from "openai";
import type { AiProviderClient, CompletionRequest, CompletionResult } from "../types";
import { AiProviderError } from "../types";

export class OpenAiProvider implements AiProviderClient {
  readonly provider = "OPENAI" as const;
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    readonly model = "gpt-4o"
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const start = Date.now();
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: request.temperature ?? 0.4,
        max_tokens: request.maxTokens ?? 2000,
        response_format: request.jsonMode ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content ?? "";
      return {
        content,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
        },
        model: response.model,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      throw new AiProviderError("OPENAI", "OpenAI completion failed", error);
    }
  }
}
