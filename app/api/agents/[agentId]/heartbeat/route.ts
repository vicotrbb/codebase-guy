import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { agentId } = params

    // Log the heartbeat (for demonstration purposes)
    console.log(`Received heartbeat from agent: ${agentId}`)

    // In a real implementation, you would update the agent's last heartbeat timestamp in the database

    // Return a 200 OK response
    return NextResponse.json({ message: "Heartbeat received successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing heartbeat:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

