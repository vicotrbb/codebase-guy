import { generateEmbedding } from "@/lib/embedding";
import { generateContent } from "@/lib/llm";
import { getSettings } from "@/lib/settings";
import { ProjectStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const settings = await getSettings();

    const { agentId } = params;
    const {
      projectName,
      fileName,
      filePath,
      absolutePath,
      chunkText,
      chunkStart,
      chunkEnd,
      chunkStartLine,
      chunkEndLine,
      progress,
    } = await request.json();

    const { percentComplete } = progress;

    console.log(`Received process-chunk from agent: ${agentId}`, {
      projectName,
      fileName,
      filePath,
      progress,
    });

    const prompt = `Generate a short (maximum 100 words), flat text without formatting, but meaningful and concise description for the following code chunk:\n${chunkText}`;
    const description = await generateContent({
      prompt,
      model: settings.weakModel,
    });

    const code = `
    /**
     * ${description ?? "No description provided"}
     */
    ${chunkText}
    `;
    const embedding = await generateEmbedding(code);

    const codeEmbedding = await prisma!.$executeRaw`
      INSERT INTO code_embedding (
        id,
        project_name,
        file_name,
        file_path,
        absolute_path,
        chunk_text,
        chunk_start,
        chunk_end,
        chunk_start_line,
        chunk_end_line,
        embedding,
        description,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${projectName},
        ${fileName},
        ${filePath},
        ${absolutePath},
        ${chunkText},
        ${chunkStart},
        ${chunkEnd},
        ${chunkStartLine},
        ${chunkEndLine},
        ${embedding},
        ${description},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;

    if (!codeEmbedding) {
      return NextResponse.json(
        { error: "Failed to create code embedding" },
        { status: 500 }
      );
    }

    const project = await prisma?.project.findFirst({
      where: { name: projectName },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma?.project.update({
      where: { id: project.id },
      data: {
        syncState: percentComplete,
        updatedAt: new Date(),
        ...(percentComplete === 100 && { status: ProjectStatus.SYNCED }),
      },
    });

    return NextResponse.json(
      { message: "process-chunk received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing process-chunk:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
