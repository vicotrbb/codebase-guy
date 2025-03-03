import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateChatCompletion, generateContent } from "@/lib/llm";
import { getSettings } from "@/lib/settings";
import { errorMessage } from "@/lib/defaultMessages";
import {
  getCodeChunks,
  parseCodeChunksIntoRelatedProjects,
} from "@/lib/embedding";
import { ChatRole, UserChatMessage } from "@/types";
import { PromptBuilder } from "@/lib/prompt";
import { searchWebByQuery } from "@/lib/webSearcher";
import { enhanceReference } from "@/lib/references";
import { COTPromptBuilder } from "@/lib/cot-prompt";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { referenceChatId: params.chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const __request = await request.json();
    const {
      message,
      references,
      chainOfThought,
      webSearch,
      agenticMode,
      ticketResolver,
    } = __request as UserChatMessage;

    // Validate chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId },
      include: {
        chatMessage: {
          orderBy: { createdAt: "desc" },
          take: 4,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: "user",
        content: message,
        referenceChatId: params.chatId,
      },
    });

    const settings = await getSettings();

    // Prepare the prompt builder
    const promptBuilder = new PromptBuilder();

    // Fetch code chunks
    const codeChunks = await getCodeChunks({ message, topN: 10 });

    if (codeChunks && codeChunks.length > 0) {
      promptBuilder.injectCodeChunksIntoContext(codeChunks);
    }

    // Fetch web search results
    if (webSearch && settings.webSearchEnabled) {
      const webSearchResults = await searchWebByQuery(message, 3, true);

      if (webSearchResults && webSearchResults.length > 0) {
        promptBuilder.injectWebSearchIntoContext(webSearchResults);
      }
    }

    console.log(__request);

    if (references) {
      const enhancedReferences = await Promise.all(
        references.map(enhanceReference)
      );

      promptBuilder.useReferences(enhancedReferences);
    }

    // Inject user question and references into the prompt
    promptBuilder.injectUserQuestion(message).useReferences(references);

    // Generate chain of thought
    if (chainOfThought) {
      const cotPrompt = new COTPromptBuilder()
        .fromPrompt(promptBuilder)
        .render()
        .getPrompt();

      const cot = await generateContent({
        prompt: cotPrompt,
        model: settings.reasoningModel,
      });

      promptBuilder.useCOT(cot);
    }

    // Renders the prompt and returns it
    const prompt = promptBuilder.render().getPrompt();

    // Convert chat messages to input messages
    // This allow us to use the chat history in the prompt
    // The chat history is limited to the last 4 messages
    const messages = chat.chatMessage.map((message) => ({
      role: message.role as ChatRole,
      content: message.content,
    }));
    const inputMessages = [
      ...messages,
      { role: "user" as ChatRole, content: prompt },
    ];

    const modelResponse = await generateChatCompletion({
      messages: inputMessages,
      model: settings.strongModel,
    });
    const relatedProjects = parseCodeChunksIntoRelatedProjects(codeChunks);

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: modelResponse,
        relatedProjects: relatedProjects as any,
        prompt,
        chainOfThought: promptBuilder.getCot,
        webSearch: promptBuilder.getWebSearch as any,
        references: promptBuilder.getReferences as any,
        referenceChatId: params.chatId,
      },
    });

    return NextResponse.json(
      {
        userMessage,
        assistantMessage,
        relatedProjects,
        chainOfThought: promptBuilder.getCot,
        webSearch: promptBuilder.getWebSearch,
        references: promptBuilder.getReferences,
        agenticMode,
        ticketResolver,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 }
    );
  }
}
