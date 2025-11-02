// User types
export interface User {
  nickname: string;
  createdAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description: string;
  website: string;
  files: UploadedFile[];
  pillars: Pillar[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
}

export interface Pillar {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// Area types
export interface Area {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// KPI types
export interface KPI {
  id: string;
  areaId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Task types
export interface Task {
  id: string;
  areaId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Process types
export interface Process {
  id: string;
  areaId: string;
  name: string;
  description: string;
  stage: ProcessStage;
  position: number;
  connections: string[]; // Array of process IDs
  createdAt: string;
  updatedAt: string;
}

export type ProcessStage = 'planning' | 'execution' | 'delivery' | string;

// Chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Agent types
export type AgentType =
  | 'organization'
  | 'kpi'
  | 'task'
  | 'process'
  | 'general';

export interface AgentContext {
  type: AgentType;
  areaId?: string;
  currentPage?: string;
}
