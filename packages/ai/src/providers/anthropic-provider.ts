import Anthropic from "@anthropic-ai/sdk";
import type { AiProviderClient, CompletionRequest, CompletionResult } from "../types";
import { AiProviderError } from "../types";

export class AnthropicProvider implements AiProviderClient {
  readonly provider = "ANTHROPIC" as const;
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    readonly model = "claude-sonnet-5"
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const start = Date.now();
    try {
      const userPrompt = request.jsonMode
        ? `${request.userPrompt}\n\nRespond with valid JSON only, no markdown fences, no commentary.`
        : request.userPrompt;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? 2000,
        temperature: request.temperature ?? 0.4,
        system: request.systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n");

      return {
        content,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
        },
        model: response.model,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      throw new AiProviderError("ANTHROPIC", "Anthropic completion failed", error);
    }
  }
}
