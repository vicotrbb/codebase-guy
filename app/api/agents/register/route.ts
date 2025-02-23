import { AgentStatus, ProjectStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { project, agentId } = await request.json();

    const newAgent = await prisma.agent.upsert({
      where: { id: agentId },
      create: {
        id: agentId,
        projectName: project,
        status: AgentStatus.STARTING,
        lastHeartBeatAt: new Date(),
      },
      update: {
        id: agentId,
        status: AgentStatus.STARTING,
        lastHeartBeatAt: new Date(),
      },
    });

    const newProject = await prisma.project.upsert({
      where: { id: project },
      create: {
        id: project,
        name: project,
        status: ProjectStatus.SYNCING,
      },
      update: {
        status: ProjectStatus.SYNCING,
      },
    });

    return NextResponse.json(
      {
        message: "Agent registered successfully",
        agent: newAgent,
        project: newProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in agent registration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
