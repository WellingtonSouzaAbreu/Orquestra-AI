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
  getUser(): User | null;
  setUser(user: User): void;

  // Organization operations
  getOrganization(): Organization | null;
  setOrganization(org: Organization): void;
  updateOrganization(updates: Partial<Organization>): void;

  // Area operations
  getAreas(): Area[];
  getArea(id: string): Area | null;
  createArea(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Area;
  updateArea(id: string, updates: Partial<Area>): void;
  deleteArea(id: string): void;

  // KPI operations
  getKPIs(areaId?: string): KPI[];
  getKPI(id: string): KPI | null;
  createKPI(kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): KPI;
  updateKPI(id: string, updates: Partial<KPI>): void;
  deleteKPI(id: string): void;

  // Task operations
  getTasks(areaId?: string): Task[];
  getTask(id: string): Task | null;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task;
  updateTask(id: string, updates: Partial<Task>): void;
  deleteTask(id: string): void;

  // Process operations
  getProcesses(areaId?: string): Process[];
  getProcess(id: string): Process | null;
  createProcess(process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>): Process;
  updateProcess(id: string, updates: Partial<Process>): void;
  deleteProcess(id: string): void;

  // Chat operations
  getChatHistory(page?: string): ChatMessage[];
  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void;
  clearChatHistory(page?: string): void;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
