import { errorMessage, noResultsMessage } from "@/lib/defaultMessages";
import { generateEmbedding } from "@/lib/embedding";
import { queryLlm } from "@/lib/llm";
import { RelatedProject, SystemChatMessage, UserChatMessage } from "@/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const topN = 20;

export type CodeEmbeddingQueryResult = Array<{
  projectName: string;
  fileName: string;
  filePath: string;
  absolutePath: string;
  chunkText: string;
  chunkStart: number;
  chunkEnd: number;
  chunkStartLine: number;
  chunkEndLine: number;
  distance: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}>;

export async function POST(request: Request) {
  try {
    const { message, chainOfThought, webSearch, yoloMode } =
      (await request.json()) as UserChatMessage;

    const userMessageEmbedding = await generateEmbedding(message);

    const results: CodeEmbeddingQueryResult = await prisma.$queryRaw(
      Prisma.raw(`
      SELECT 
        "CodeEmbedding"."project_name" as "projectName",
        "CodeEmbedding"."file_name" as "fileName",
        "CodeEmbedding"."file_path" as "filePath", 
        "CodeEmbedding"."absolute_path" as "absolutePath", 
        "CodeEmbedding"."chunk_text" as "chunkText",
        "CodeEmbedding"."chunk_start" as "chunkStart",
        "CodeEmbedding"."chunk_end" as "chunkEnd",
        "CodeEmbedding"."chunk_start_line" as "chunkStartLine",
        "CodeEmbedding"."chunk_end_line" as "chunkEndLine",
        "CodeEmbedding"."created_at" as "createdAt",
        "CodeEmbedding"."updated_at" as "updatedAt",
        "CodeEmbedding"."description" as "description",
        "CodeEmbedding"."embedding" <-> '[${userMessageEmbedding}]' AS distance,
        "Project"."id" as "projectId"
      FROM "code_embedding" "CodeEmbedding"
      INNER JOIN "project" "Project" ON "CodeEmbedding"."project_name" = "Project"."name"
      ORDER BY distance ASC
      LIMIT ${topN}
    `)
    );

    if (results.length < 1) {
      const response: SystemChatMessage = {
        message: noResultsMessage,
        relatedProjects: [],
      };

      return NextResponse.json(response, { status: 200 });
    }

    const context = results
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
    You are an expert software engineer.
    Your goal is to respond to the user's question based on the provided context. Remember that your main goal is to help the user understand the codebase, suggest changes, provide general advice and help them with their questions.
    You will receive a list of constraints that you must follow.
    The context provided is a list of code chunks that are related to the user's question, the description of each code chunk and the start and end lines of the code chunk.
    The context is extracted using RAG (Retrieval-Augmented Generation) technique.

    Constraints:
    - If the user's question is not related to the context, just say "I don't know" and suggest the user to ask a different question that might be a better fit.
    - If the user's question is related to the context, respond to the question based on the context.
    - Your response must be in markdown format.
    - Your response must be concise and to the point.
    - Your response must be easy to understand, helpful and actionable.
    - Your response must be in the same language as the user's question.
    - You are allowed to provide code snippets in your response using the markdown format \`\`\`code\`\`\` or \`\`\`code\`\`\`language.
    - If the user question requires code examples, you must provide code examples.

    Context:
    ${context}

    User Question:
    ${message}
    
    Answer:
    `;

    const { modelResponse } = await queryLlm(prompt, "llama3:latest");
    const grouppedProjects = results.reduce((acc, r) => {
      if (!acc[r.projectName]) {
        acc[r.projectName] = {
          id: r.projectId,
          name: r.projectName,
          relatedFiles: [
            {
              name: r.fileName,
              path: r.filePath,
              absolutePath: r.absolutePath,
            },
          ],
        };
      } else {
        acc[r.projectName].relatedFiles.push({
          name: r.fileName,
          path: r.filePath,
          absolutePath: r.absolutePath,
        });
      }
      return acc;
    }, {} as Record<string, RelatedProject>);
    const relatedProjects = Object.values(grouppedProjects);

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
