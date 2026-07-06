export type AiProviderName = "OPENAI" | "ANTHROPIC" | "GEMINI";

export type AiFeature =
  | "RESUME_ANALYSIS"
  | "ATS_ANALYSIS"
  | "KEYWORD_ANALYSIS"
  | "COVER_LETTER"
  | "INTERVIEW_PREP"
  | "LINKEDIN_OPTIMIZATION"
  | "RESUME_REWRITE"
  | "BULLET_REWRITE";

export interface PromptSpec {
  systemPrompt: string;
  /** Mustache-style template with {{variable}} placeholders. */
  userPromptTemplate: string;
}

export interface CompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  /** Ask the provider to constrain output to valid JSON where supported. */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface CompletionResult {
  content: string;
  usage: CompletionUsage;
  model: string;
  latencyMs: number;
}

export interface AiProviderClient {
  readonly provider: AiProviderName;
  readonly model: string;
  complete(request: CompletionRequest): Promise<CompletionResult>;
}

export class AiProviderError extends Error {
  constructor(
    public readonly provider: AiProviderName,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
