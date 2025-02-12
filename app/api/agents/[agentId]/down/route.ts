import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { agentId } = params

    // Log the agent down notification (for demonstration purposes)
    console.log(`Received down notification from agent: ${agentId}`)

    // In a real implementation, you would:
    // 1. Update the agent's status in the database
    // 2. Potentially trigger alerts or notifications
    // 3. Log the event for auditing purposes

    // Return a 200 OK response
    return NextResponse.json({ message: "Agent down notification received successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing agent down notification:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

