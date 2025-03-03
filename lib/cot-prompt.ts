import { PromptBuilder } from "./prompt";

export class COTPromptBuilder extends PromptBuilder {
  constructor(compressPrompt: boolean = false) {
    super(
      compressPrompt,
      "You are an expert software engineer with advanced analytical and reasoning capabilities.",
      "Your goal is to break down complex problems into logical steps, showing your reasoning process before providing a final answer. You should analyze the provided context thoroughly and explain your thought process clearly."
    );

    // Override base instructions with COT-specific instructions
    this.instructions = [
      "You will receive a list of constraints that you must follow.",
      "Your response must be in markdown format.",
      "Break down your thinking process into clear, sequential steps.",
      "Explicitly state your assumptions and reasoning at each step.",
      "The context provided is a list of code chunks that are related to the user's question.",
      "When analyzing code, explain your understanding of each relevant component before making conclusions.",
      "If you make technical decisions, explain the rationale behind them.",
    ];

    // Override base constraints with COT-specific constraints
    this.constraints = [
      "Always structure your response in a 'Let's think about this step by step' format.",
      "Before providing code examples, explain your reasoning for the proposed solution.",
      "If you're unsure about something, explicitly state your uncertainty and explain why.",
      "Your response must be in markdown format.",
      "Your final answer should be clearly separated from your reasoning process.",
      "When referencing code, explain which parts you're focusing on and why.",
      "If multiple approaches are possible, explain why you chose one over the others.",
    ];
  }

  public fromPrompt(prompt: PromptBuilder): this {
    this.context = prompt.getContext;
    this.references = prompt.getReferences ?? [];
    this.webSearch = prompt.getWebSearch ?? [];
    this.userQuestion = prompt.getUserQuestion;
    return this;
  }
}
