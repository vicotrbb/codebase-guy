import { ProjectStatus } from "@/types";
import { NextResponse } from "next/server";

// Define the Project type
type Project = {
  name: string;
  status: ProjectStatus;
  agent: {
    agentId: string;
  };
};

// Mock data for projects
const mockProjects: Project[] = [
  {
    name: "User Authentication Service",
    status: ProjectStatus.SYNCING,
    agent: {
      agentId: "AUTH-001",
    },
  },
  {
    name: "Payment Processing System",
    status: ProjectStatus.SYNCING,
    agent: {
      agentId: "PAY-002",
    },
  },
  {
    name: "Inventory Management",
    status: ProjectStatus.ERROR,
    agent: {
      agentId: "INV-003",
    },
  },
  {
    name: "Customer Support Bot",
    status: ProjectStatus.SYNCED,
    agent: {
      agentId: "SUP-004",
    },
  },
  {
    name: "Data Analytics Pipeline",
    status: ProjectStatus.SYNCING,
    agent: {
      agentId: "DAT-005",
    },
  },
];

export async function GET() {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return the mock projects data
  return NextResponse.json(mockProjects);
}
