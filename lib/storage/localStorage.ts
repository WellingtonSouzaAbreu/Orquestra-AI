import {
  User,
  Organization,
  Area,
  KPI,
  Task,
  Process,
  ChatMessage,
} from '../types';
import { IDatabase, generateId, getCurrentTimestamp } from './database';

class LocalStorageDatabase implements IDatabase {
  private getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // User operations
  getUser(): User | null {
    return this.getItem<User>('user');
  }

  setUser(user: User): void {
    this.setItem('user', user);
  }

  // Organization operations
  getOrganization(): Organization | null {
    return this.getItem<Organization>('organization');
  }

  setOrganization(org: Organization): void {
    this.setItem('organization', org);
  }

  updateOrganization(updates: Partial<Organization>): void {
    const org = this.getOrganization();
    if (org) {
      this.setOrganization({ ...org, ...updates, updatedAt: getCurrentTimestamp() });
    }
  }

  // Area operations
  getAreas(): Area[] {
    return this.getItem<Area[]>('areas') || [];
  }

  getArea(id: string): Area | null {
    const areas = this.getAreas();
    return areas.find(area => area.id === id) || null;
  }

  createArea(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Area {
    const newArea: Area = {
      ...area,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const areas = this.getAreas();
    this.setItem('areas', [...areas, newArea]);
    return newArea;
  }

  updateArea(id: string, updates: Partial<Area>): void {
    const areas = this.getAreas();
    const index = areas.findIndex(area => area.id === id);
    if (index !== -1) {
      areas[index] = { ...areas[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('areas', areas);
    }
  }

  deleteArea(id: string): void {
    const areas = this.getAreas();
    this.setItem('areas', areas.filter(area => area.id !== id));
  }

  // KPI operations
  getKPIs(areaId?: string): KPI[] {
    const kpis = this.getItem<KPI[]>('kpis') || [];
    return areaId ? kpis.filter(kpi => kpi.areaId === areaId) : kpis;
  }

  getKPI(id: string): KPI | null {
    const kpis = this.getKPIs();
    return kpis.find(kpi => kpi.id === id) || null;
  }

  createKPI(kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): KPI {
    const newKPI: KPI = {
      ...kpi,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const kpis = this.getKPIs();
    this.setItem('kpis', [...kpis, newKPI]);
    return newKPI;
  }

  updateKPI(id: string, updates: Partial<KPI>): void {
    const kpis = this.getKPIs();
    const index = kpis.findIndex(kpi => kpi.id === id);
    if (index !== -1) {
      kpis[index] = { ...kpis[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('kpis', kpis);
    }
  }

  deleteKPI(id: string): void {
    const kpis = this.getKPIs();
    this.setItem('kpis', kpis.filter(kpi => kpi.id !== id));
  }

  // Task operations
  getTasks(areaId?: string): Task[] {
    const tasks = this.getItem<Task[]>('tasks') || [];
    return areaId ? tasks.filter(task => task.areaId === areaId) : tasks;
  }

  getTask(id: string): Task | null {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const tasks = this.getTasks();
    this.setItem('tasks', [...tasks, newTask]);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('tasks', tasks);
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks();
    this.setItem('tasks', tasks.filter(task => task.id !== id));
  }

  // Process operations
  getProcesses(areaId?: string): Process[] {
    const processes = this.getItem<Process[]>('processes') || [];
    return areaId ? processes.filter(process => process.areaId === areaId) : processes;
  }

  getProcess(id: string): Process | null {
    const processes = this.getProcesses();
    return processes.find(process => process.id === id) || null;
  }

  createProcess(process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>): Process {
    const newProcess: Process = {
      ...process,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const processes = this.getProcesses();
    this.setItem('processes', [...processes, newProcess]);
    return newProcess;
  }

  updateProcess(id: string, updates: Partial<Process>): void {
    const processes = this.getProcesses();
    const index = processes.findIndex(process => process.id === id);
    if (index !== -1) {
      processes[index] = { ...processes[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('processes', processes);
    }
  }

  deleteProcess(id: string): void {
    const processes = this.getProcesses();
    this.setItem('processes', processes.filter(process => process.id !== id));
  }

  // Chat operations
  getChatHistory(page?: string): ChatMessage[] {
    const key = page ? `chat-${page}` : 'chat-general';
    return this.getItem<ChatMessage[]>(key) || [];
  }

  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const key = 'chat-general';
    const messages = this.getChatHistory();
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: getCurrentTimestamp(),
    };
    this.setItem(key, [...messages, newMessage]);
  }

  clearChatHistory(page?: string): void {
    const key = page ? `chat-${page}` : 'chat-general';
    this.setItem(key, []);
  }
}

// Export singleton instance
export const db = new LocalStorageDatabase();
