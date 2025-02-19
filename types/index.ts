import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export enum ProjectStatus {
  SYNCING = "SYNCING",
  SYNCED = "SYNCED",
  ERROR = "ERROR",
}

export enum AgentStatus {
  STARTING = "STARTING",
  ONLINE = "ONLINE",
  STOPPED = "STOPPED",
  ERROR = "ERROR",
}

export interface Agent {
  id: string;
  projectName: string;
  status: AgentStatus;
  lastHeartBeatAt: string;
}

export interface Project {
  name: string;
  status: ProjectStatus;
  updatedAt: string;
}

export {};
