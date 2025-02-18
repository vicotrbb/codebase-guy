import { generateEmbedding } from "@/lib/embedding";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
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
    } = await request.json();

    console.log(`Received process-chunk from agent: ${agentId}`, {
      projectName,
      fileName,
      filePath,
      absolutePath,
      chunkText,
      chunkStart,
      chunkEnd,
      chunkStartLine,
      chunkEndLine,
    });

    const embedding = await generateEmbedding(chunkText);

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
