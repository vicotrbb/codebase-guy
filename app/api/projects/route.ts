import { NextResponse } from "next/server"

// Define the Project type
type Project = {
  name: string
  status: "SYNC" | "SYNCING" | "UNSYNC"
  agent: {
    agentId: string
  }
}

// Mock data for projects
const mockProjects: Project[] = [
  {
    name: "User Authentication Service",
    status: "SYNC",
    agent: {
      agentId: "AUTH-001",
    },
  },
  {
    name: "Payment Processing System",
    status: "SYNCING",
    agent: {
      agentId: "PAY-002",
    },
  },
  {
    name: "Inventory Management",
    status: "UNSYNC",
    agent: {
      agentId: "INV-003",
    },
  },
  {
    name: "Customer Support Bot",
    status: "SYNC",
    agent: {
      agentId: "SUP-004",
    },
  },
  {
    name: "Data Analytics Pipeline",
    status: "SYNCING",
    agent: {
      agentId: "DAT-005",
    },
  },
]

export async function GET() {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return the mock projects data
  return NextResponse.json(mockProjects)
}

