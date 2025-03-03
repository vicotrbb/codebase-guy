import { Agent } from "@/types";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const foundAgents = await prisma?.agent.findMany();
    const agents: Array<Agent> =
      !!foundAgents && foundAgents.length > 0
        ? foundAgents?.map(
            (agent) =>
              ({
                id: agent.id,
                projectName: agent.projectName,
                status: agent.status,
                lastHeartBeatAt: agent.lastHeartBeatAt.toISOString(),
              } as Agent)
          )
        : [];

    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
