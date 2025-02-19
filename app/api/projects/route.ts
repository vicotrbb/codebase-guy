import { Project } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const foundProjects = await prisma?.project.findMany();
    const projects: Array<Project> =
      foundProjects?.map(
        (project) =>
          ({
            id: project.id,
            name: project.name,
            status: project.status,
            updatedAt: project.updatedAt.toISOString(),
          } as Project)
      ) ?? [];

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
