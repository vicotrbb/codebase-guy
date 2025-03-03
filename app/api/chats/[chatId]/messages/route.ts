import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateChatCompletion } from "@/lib/llm";
import { getSettings } from "@/lib/settings";
import { errorMessage } from "@/lib/defaultMessages";
import {
  getCodeChunks,
  parseCodeChunksIntoRelatedProjects,
} from "@/lib/embedding";

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
    const { role, content, chainOfThought, webSearch } = await request.json();

    // Validate chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: params.chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: "user",
        content,
        referenceChatId: params.chatId,
      },
    });

    // Process message and get AI response
    const settings = await getSettings();
    const codeChunks = await getCodeChunks({ message: content });
    const codeChunksContext = codeChunks
      .map(
        (chunk, idx) => `
          Chunk ${idx + 1}
          Project Name: ${chunk.projectName}
          File Name: ${chunk.fileName}
          Start Line: ${chunk.chunkStartLine}
          End Line: ${chunk.chunkEndLine}
          Description: ${chunk.description ?? "No description available"}
          Code:
          ${chunk.chunkText}
          `
      )
      .join("\n");

    const prompt = `
      <role>
      You are an expert software engineer.
      </role>

      <goal>
      Your goal is to respond to the user's question based on the provided context. Remember that your main goal is to help the user understand the codebase, suggest changes, provide general advice and help them with their questions.
      </goal>

      <instructions>
      You will receive a list of constraints that you must follow.
      The context provided is a list of code chunks that are related to the user's question, the description of each code chunk and the start and end lines of the code chunk.
      The context is extracted using RAG (Retrieval-Augmented Generation) technique.
      </instructions>

      <constraints>
      - If you don't know the answer, just say "I don't know" and suggest the user to ask a different question that might be a better fit. However, always try to answer the question based on the context and available information.
      - Your response must be in markdown format.
      - Your response must be concise and to the point.
      - Your response must be easy to understand, helpful and actionable.
      - Your response must be in the same language as the user's question.
      - You are allowed to provide code snippets in your response using the markdown format \`\`\`code\`\`\` or \`\`\`code\`\`\`language.
      - If the user question requires code examples, you must provide code examples.
      </constraints>

      <context>
      ${codeChunksContext}
      </context>

      <user-question>
      ${content}
      </user-question>

      <answer>
      </answer>
    `;

    const modelResponse = await generateChatCompletion({
      messages: [{ role: "user", content: prompt }],
      model: settings.strongModel,
    });

    const relatedProjects = parseCodeChunksIntoRelatedProjects(codeChunks);

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: modelResponse,
        relatedProjects: relatedProjects as any,
        referenceChatId: params.chatId,
      },
    });

    return NextResponse.json(
      {
        userMessage,
        assistantMessage,
        relatedProjects,
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
