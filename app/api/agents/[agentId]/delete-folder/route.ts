import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const { projectName, filePath } = await request.json();

    console.log(`Received delete-folder request from agent: ${agentId}`, {
      projectName,
      filePath,
    });

    await prisma!.codeEmbedding.deleteMany({
      where: {
        projectName: projectName,
        filePath: filePath,
      },
    });

    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing delete-folder request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
