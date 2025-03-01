import { GenerationRequestParams, LLMRequestParams, Settings } from "@/types";
import { getSettings } from "@/lib/settings";
import { ModelProvider } from "@prisma/client";
import OpenAI from "openai";
import { Ollama } from "ollama";

export async function generateContent(
  args: GenerationRequestParams
): Promise<string> {
  const { prompt, model, temperature, max_tokens } = args;

  const chatParams: LLMRequestParams = {
    messages: [{ role: "user", content: prompt }],
    model: model || undefined,
    temperature,
    max_tokens,
  };

  return generateChatCompletion(chatParams);
}

export async function generateChatCompletion(
  args: LLMRequestParams
): Promise<string> {
  const settings = await getSettings();

  if (!settings) {
    throw new Error("Settings not found");
  }

  switch (settings.modelProvider) {
    case ModelProvider.OPENAI:
      return handleOpenAICompletion(args, settings);
    case ModelProvider.OLLAMA:
      return handleOllamaCompletion(args, settings);
    default:
      throw new Error(`Unsupported model provider: ${settings.modelProvider}`);
  }
}

async function handleOpenAICompletion(
  args: LLMRequestParams,
  settings: Settings
): Promise<string> {
  if (!settings.modelApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const openai = new OpenAI({
    apiKey: settings.modelApiKey,
    ...(settings.openApiCompatibleApiUrl && {
      baseURL: settings.openApiCompatibleApiUrl,
    }),
  });

  const {
    messages,
    model = args.model || settings.strongModel,
    temperature = 0.7,
  } = args;

  const formattedMessages = messages.map((msg) => {
    const baseMessage = {
      role: msg.role,
      content: msg.content,
    };

    if (msg.role === "function" && msg.name) {
      return {
        ...baseMessage,
        name: msg.name,
      };
    }

    return baseMessage;
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: formattedMessages as any, // Type assertion to any to avoid complex type mapping
      temperature,
      response_format: { type: "text" },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      console.error("Unexpected OpenAI response:", JSON.stringify(response));
      throw new Error("No completion content found in the response");
    }

    return messageContent;
  } catch (error) {
    console.error("Error generating completion with OpenAI:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate completion with OpenAI");
  }
}

async function handleOllamaCompletion(
  args: LLMRequestParams,
  settings: Settings
): Promise<string> {
  if (!settings.ollamaUrl) {
    throw new Error("Ollama URL is not configured");
  }

  const ollama = new Ollama({ host: settings.ollamaUrl });
  const model = args.model || settings.strongModel;

  try {
    const response = await ollama.chat({
      model,
      messages: args.messages,
      options: {
        temperature: args.temperature || 0.7,
      },
    });

    if (!response.message || !response.message.content) {
      throw new Error("No response content received from Ollama");
    }

    return response.message.content;
  } catch (error) {
    console.error("Error generating completion with Ollama:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate completion with Ollama");
  }
}
