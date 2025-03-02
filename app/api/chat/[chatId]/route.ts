import { errorMessage } from "@/lib/defaultMessages";
import {
  getCodeChunks,
  parseCodeChunksIntoRelatedProjects,
} from "@/lib/embedding";
import { generateChatCompletion } from "@/lib/llm";
import { getSettings } from "@/lib/settings";
import { Chat, SystemChatMessage, UserChatMessage } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      chatMessage: true,
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const response: Chat = {
    id: chat.id,
    name: chat.name,
    messages: chat.chatMessage.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        chatMessage: true,
      },
    });

    const settings = await getSettings();
    const {
      message,
      chainOfThought,
      webSearch,
      agenticMode: _,
    } = (await request.json()) as UserChatMessage;

    /*
     * Get the code chunks that are related to the user's question
     *
     * Also generates the context to be appended to the prompt.
     */
    const codeChunks = await getCodeChunks({ message });
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
      ${message}
      </user-question>

      <answer>
      </answer>
      `;

    console.log(prompt);

    const modelResponse = await generateChatCompletion({
      messages: [{ role: "user", content: prompt }],
      model: settings.strongModel,
    });

    const relatedProjects = parseCodeChunksIntoRelatedProjects(codeChunks);

    const response: SystemChatMessage = {
      message: modelResponse,
      relatedProjects: relatedProjects,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    const response: SystemChatMessage = {
      message: errorMessage,
      relatedProjects: [],
    };

    return NextResponse.json(response, { status: 200 });
  }
}
