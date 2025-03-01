import { RelatedProject } from "@/types";
import { getSettings } from "./settings";
import { Prisma } from "@prisma/client";

export interface CodeChunk {
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
}

export type CodeChunkQueryResult = Array<CodeChunk>;

export async function generateEmbedding(text: string): Promise<number[]> {
  const settings = await getSettings();
  const embeddingServiceUrl = settings.embeddingServiceUrl;

  if (!embeddingServiceUrl) {
    throw new Error("Embedding service URL is not configured");
  }

  const response = await fetch(`${embeddingServiceUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model: "microsoft/codebert-base",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.statusText}`);
  }

  const data = (await response.json()) as { embedding: number[] };
  return data.embedding;
}

export const getCodeChunks = async ({
  message,
  topN = 20,
}: {
  message: string;
  topN?: number;
}): Promise<CodeChunkQueryResult> => {
  const userMessageEmbedding = await generateEmbedding(message);

  const results: CodeChunkQueryResult = await prisma.$queryRaw(
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
    return [];
  }

  return results;
};

export const parseCodeChunksIntoRelatedProjects = (
  codeChunks: CodeChunkQueryResult
): RelatedProject[] => {
  const grouppedProjects = codeChunks.reduce((acc, r) => {
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

  return relatedProjects;
};
