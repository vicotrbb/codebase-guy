import { errorMessage, noResultsMessage } from "@/lib/defaultMessages";
import { generateEmbedding } from "@/lib/embedding";
import { queryLlm } from "@/lib/llm";
import { RelatedProject, SystemChatMessage, UserChatMessage } from "@/types";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const topN = 25;

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
}>;

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as UserChatMessage;

    console.log("Received message:", message);

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
        (r, idx) => `Chunk ${idx + 1} (File: ${r.fileName}):\n${r.chunkText}`
      )
      .join("\n\n");

    const prompt = `Here is some context from the codebase:\n\n${context}\n\nQuestion: ${message}\nAnswer:`;

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
