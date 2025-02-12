import { NextResponse } from "next/server"

// Define the Agent type
type Agent = {
  id: string
  projectName: string
  agentId: string
  status: "STARTING" | "ONLINE" | "STOPPED" | "ERROR"
  lastHeartBeatAt: string // ISO date string
}

// Mock data for agents
const mockAgents: Agent[] = [
  {
    id: "1",
    projectName: "User Authentication Service",
    agentId: "AUTH-001",
    status: "ONLINE",
    lastHeartBeatAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
  },
  {
    id: "2",
    projectName: "Payment Processing System",
    agentId: "PAY-002",
    status: "STARTING",
    lastHeartBeatAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
  },
  {
    id: "3",
    projectName: "Inventory Management",
    agentId: "INV-003",
    status: "STOPPED",
    lastHeartBeatAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
  },
  {
    id: "4",
    projectName: "Customer Support Bot",
    agentId: "SUP-004",
    status: "ONLINE",
    lastHeartBeatAt: new Date(Date.now() - 1 * 60000).toISOString(), // 1 minute ago
  },
  {
    id: "5",
    projectName: "Data Analytics Pipeline",
    agentId: "DAT-005",
    status: "ERROR",
    lastHeartBeatAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  },
]

export async function GET() {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return the mock agents data
  return NextResponse.json(mockAgents)
}

