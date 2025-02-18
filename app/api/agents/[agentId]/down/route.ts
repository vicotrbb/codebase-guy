import { AgentStatus } from "@/types";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    console.log(`Received down notification from agent: ${agentId}`);

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
      data: { lastHeartBeatAt: new Date(), status: AgentStatus.ERROR },
    });

    return NextResponse.json(
      { message: "Agent down notification received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing agent down notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
