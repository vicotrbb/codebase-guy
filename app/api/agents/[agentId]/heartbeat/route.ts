import { AgentStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    console.log(`Received heartbeat from agent: ${agentId}`);

    const agent = await prisma?.agent.findFirst({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await prisma?.agent.update({
      where: { id: agentId },
      data: { lastHeartBeatAt: new Date(), status: AgentStatus.ONLINE },
    });

    return NextResponse.json(
      { message: "Heartbeat received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
