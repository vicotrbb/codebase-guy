import { PrismaClient } from "@prisma/client";

export type AvailableModels = "llama3:latest" | "llama3:8b" | "llama3.2:3b";

declare global {
  var prisma: PrismaClient;
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
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
  syncState: number;
}

export interface UserChatMessage {
  message: string;
  references?: Array<string>;
}

export interface RelatedFile {
  name: string;
  path: string;
  absolutePath: string;
}

export interface RelatedProject {
  id: string;
  name: string;
  relatedFiles: RelatedFile[];
}

export interface SystemChatMessage {
  message: string;
  relatedProjects: RelatedProject[];
}

export {};
