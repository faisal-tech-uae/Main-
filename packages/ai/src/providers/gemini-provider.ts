import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiProviderClient, CompletionRequest, CompletionResult } from "../types";
import { AiProviderError } from "../types";

export class GeminiProvider implements AiProviderClient {
  readonly provider = "GEMINI" as const;
  private readonly client: GoogleGenerativeAI;

  constructor(
    apiKey: string,
    readonly model = "gemini-1.5-pro"
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const start = Date.now();
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: request.systemPrompt,
        generationConfig: {
          temperature: request.temperature ?? 0.4,
          maxOutputTokens: request.maxTokens ?? 2000,
          responseMimeType: request.jsonMode ? "application/json" : "text/plain",
        },
      });

      const result = await model.generateContent(request.userPrompt);
      const response = result.response;
      const content = response.text();
      const usage = response.usageMetadata;

      return {
        content,
        usage: {
          promptTokens: usage?.promptTokenCount ?? 0,
          completionTokens: usage?.candidatesTokenCount ?? 0,
        },
        model: this.model,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      throw new AiProviderError("GEMINI", "Gemini completion failed", error);
    }
  }
}
