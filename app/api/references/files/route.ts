import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json([]);
    }

    // Search for files in code embeddings that match the query
    const files = await prisma.codeEmbedding.findMany({
      where: {
        fileName: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        projectName: true,
      },
      distinct: ["filePath"],
      take: 10,
    });

    // Transform the results into a more usable format
    const results = files.map((file) => ({
      id: file.id,
      name: file.fileName,
      path: file.filePath,
      projectName: file.projectName,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
