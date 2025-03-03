import { ChatReference, ChatReferenceType, WebSearchResult } from "@/types";
import { CodeChunkQueryResult } from "./embedding";

export class PromptBuilder {
  protected readonly compressPrompt: boolean;
  protected readonly role: string;
  protected readonly goal: string;
  protected instructions: string[];
  protected constraints: string[];
  protected context: string;
  protected userQuestion: string;
  protected prompt: string;

  protected cot: string; // Chain of thought
  protected references?: ChatReference[]; // References
  protected webSearch?: WebSearchResult[]; // Web search

  protected isRendered: boolean;

  constructor(compressPrompt: boolean = false, role?: string, goal?: string) {
    this.compressPrompt = compressPrompt;

    // Base role
    this.role = role ?? "You are an expert software engineer.";

    // Base goal
    this.goal =
      goal ??
      "Your goal is to respond to the user's question based on the provided context. Remember that your main goal is to help the user understand the codebase, suggest changes, provide general advice and help them with their questions.";

    // Base instructions
    this.instructions = [
      "You will receive a list of constraints that you must follow.",
      "Your response must be in markdown format.",
      "The context provided is a list of code chunks that are related to the user's question, the description of each code chunk and the start and end lines of the code chunk.",
      "The context is extracted using RAG (Retrieval-Augmented Generation) technique.",
      "Always try to reference the code chunks in your response. When applicable.",
      "You can suggest modifications to the code chunks in your response. When applicable.",
    ];

    // Base constraints
    this.constraints = [
      `If you don't know the answer, just say "I don't know" and suggest the user to ask a different question that might be a better fit. However, always try to answer the question based on the context and available information.`,
      "Your response must be in markdown format.",
      "Your response must be concise and to the point.",
      "Your response must be easy to understand, helpful and actionable.",
      "Your response must be in the same language as the user's question.",
      `You are allowed to provide code snippets in your response using the markdown format \`\`\`code\`\`\` or \`\`\`code\`\`\`language.`,
      "If the user question requires code examples, you must provide code examples.",
    ];

    // Context and user question are injected
    this.context = "";
    this.userQuestion = "";

    // Chain of thought is not injected by default
    this.cot = "";

    // Prompt is not rendered by default
    this.prompt = ``;
    this.isRendered = false;
  }

  public useCOT(cot: string): this {
    this.cot = cot;
    return this;
  }

  public useReferences(references: ChatReference[] | undefined): this {
    this.references = references;

    if (!references || references.length === 0) {
      return this;
    }

    this.injectInstructions([
      `The user has explicitly provided references to specific contents, you must use them to support the to the answer the user's question.`,
      `References are found on the <user-question> section. And the context for each reference is found on the <references> section inside the <context> section.`,
      `References follow the following format:`,
      ` - @${ChatReferenceType.FILE}:<reference-target>`,
      ` - @${ChatReferenceType.PROJECT}:<reference-target>`,
      ` - @${ChatReferenceType.AGENT}:<reference-target>`,
      ` - @${ChatReferenceType.WEB}:<reference-target>`,
    ]);

    const referenceContext = references
      .map(
        (reference) =>
          `Reference: @${reference.referenceType}:${reference.referenceTarget}\nContent: ${reference.referenceContent}`
      )
      .join("\n");

    const referenceContextHeader = `
      <references>
      ${referenceContext}
      </references>
      `;

    this.injectContext(referenceContextHeader);

    return this;
  }

  public injectInstructions(instructions: string[]): this {
    this.instructions = this.instructions.concat(instructions);
    return this;
  }

  public injectConstraints(constraints: string[]): this {
    this.constraints = this.constraints.concat(constraints);
    return this;
  }

  public injectCodeChunksIntoContext(codeChunks: CodeChunkQueryResult): this {
    const codeChunksContext = codeChunks
      .map(
        (chunk, idx) => `
          Chunk ${idx + 1}
          Project Name: ${chunk.projectName}
          File Name: ${chunk.fileName}
          Start Line: ${chunk.chunkStartLine}
          End Line: ${chunk.chunkEndLine}
          RAG Distance: ${chunk.distance}
          ${
            this.compressPrompt
              ? ""
              : `Description: ${
                  chunk.description ?? "No description available"
                }`
          }
          Code:
          ${chunk.chunkText}
          `
      )
      .join("\n");

    const codeChunksContextHeader = `
      <code-chunks-context>
      ${codeChunksContext}
      </code-chunks-context>
      `;

    this.injectContext(codeChunksContextHeader);
    return this;
  }

  public injectWebSearchIntoContext(webSearch: WebSearchResult[]): this {
    this.webSearch = webSearch;
    const webSearchContent = webSearch
      .map((result) => `- ${result.title}\n${result.content}`)
      .join("\n");

    const webSearchContentHeader = `
      <web-search-content>
      ${webSearchContent}
      </web-search-content>
      `;

    this.injectContext(webSearchContentHeader);
    return this;
  }

  public injectContext(context: string): this {
    this.context = this.context.concat(context).concat("\n");
    return this;
  }

  public injectUserQuestion(userQuestion: string): this {
    this.userQuestion = this.userQuestion.concat(userQuestion);
    return this;
  }

  public render(): this {
    this.prompt = `
      ${this.cot ? `<think>\n${this.cot}\n</think>` : ""}

      <role>
      ${this.role}
      </role>

      <goal>
      ${this.goal}
      </goal>

      <instructions>
      ${this.instructions.map((instruction) => `- ${instruction}`).join("\n")}
      </instructions>

      <constraints>
      ${this.constraints.map((constraint) => `- ${constraint}`).join("\n")}
      </constraints>

      ${
        this.context && this.context.length > 0
          ? `<context>\n${this.context}\n</context>`
          : ""
      }

      <user-question>
      ${this.userQuestion}
      </user-question>

      <answer>
      </answer>
    `;

    this.isRendered = true;

    return this;
  }

  public getPrompt(): string {
    if (!this.isRendered) {
      this.render();
    }

    return this.prompt;
  }

  public toString(): string {
    return this.getPrompt();
  }

  get getCot(): string {
    return this.cot;
  }

  get getContext(): string {
    return this.context;
  }

  get getUserQuestion(): string {
    return this.userQuestion;
  }

  get getReferences(): ChatReference[] | null {
    return this.references ?? null;
  }

  get getWebSearch(): WebSearchResult[] | null {
    return this.webSearch ?? null;
  }
}
