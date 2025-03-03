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

export enum ChatReferenceType {
  FILE = "FILE",
  PROJECT = "PROJECT",
  AGENT = "AGENT",
  WEB = "WEB",
}

export interface ChatReference {
  referenceType: ChatReferenceType;
  referenceTarget: any;
  referenceContent?: string;
}

export interface UserChatMessage {
  message: string;
  references?: Array<ChatReference>;
  chainOfThought: boolean;
  webSearch: boolean;
  agenticMode: boolean;
  ticketResolver: boolean;
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

export enum ModelType {
  STRONG = "STRONG",
  WEAK = "WEAK",
  REASONING = "REASONING",
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
  agenticModeEnabled: boolean;
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

export interface GenerationRequestParams {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export type ChatRole = "system" | "user" | "assistant" | "function";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
}

export interface LLMRequestParams {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
}

export interface WebSearchResult {
  title: string;
  link: string;
  content: string;
}

export {};
