import {
  User,
  Organization,
  Area,
  KPI,
  Task,
  Process,
  ChatMessage,
} from '../types';

// Database interface for abstraction
export interface IDatabase {
  // User operations
  getUser(): Promise<User | null>;
  setUser(user: User): Promise<void>;

  // Organization operations
  getOrganization(): Promise<Organization | null>;
  setOrganization(org: Organization): Promise<void>;
  updateOrganization(updates: Partial<Organization>): Promise<void>;

  // Area operations
  getAreas(): Promise<Area[]>;
  getArea(id: string): Promise<Area | null>;
  createArea(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Promise<Area>;
  updateArea(id: string, updates: Partial<Area>): Promise<void>;
  deleteArea(id: string): Promise<void>;

  // KPI operations
  getKPIs(areaId?: string): Promise<KPI[]>;
  getKPI(id: string): Promise<KPI | null>;
  createKPI(kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<KPI>;
  updateKPI(id: string, updates: Partial<KPI>): Promise<void>;
  deleteKPI(id: string): Promise<void>;

  // Task operations
  getTasks(areaId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;

  // Process operations
  getProcesses(areaId?: string): Promise<Process[]>;
  getProcess(id: string): Promise<Process | null>;
  createProcess(process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>): Promise<Process>;
  updateProcess(id: string, updates: Partial<Process>): Promise<void>;
  deleteProcess(id: string): Promise<void>;

  // Chat operations
  getChatHistory(page?: string): Promise<ChatMessage[]>;
  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>, page?: string): Promise<void>;
  saveChatHistory(messages: ChatMessage[], page?: string): Promise<void>;
  clearChatHistory(page?: string): Promise<void>;
  search(query: string, collections: string[], areaId?: string, limit?: number): Promise<any[]>;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Get current timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
