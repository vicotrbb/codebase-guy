import {
  AgentStatus,
  CacheProvider,
  ModelProvider,
  PrismaClient,
  WebSearchProvider,
  ProjectStatus,
} from "@prisma/client";

declare global {
  var prisma: PrismaClient;
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

export interface PublicSettings {
  guyName: string;
  modelProvider: ModelProvider;
  weakModel: string;
  strongModel: string;
  reasoningModel: string;
  cacheEnabled: boolean;
  cacheProvider: CacheProvider;
  webSearchEnabled: boolean;
  webSearchProvider: WebSearchProvider;
}

export interface Settings extends PublicSettings {
  id: string;
  embeddingServiceUrl: string;
  ollamaUrl: string;
  openApiCompatibleApiUrl: string | null;
  modelApiKey: string | null;
  redisHost: string | null;
  redisPort: string | null;
  serperUrl: string | null;
  serperApiKey: string | null;
}

export {};
