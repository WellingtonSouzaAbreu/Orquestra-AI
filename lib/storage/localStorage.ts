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
  async getUser(): Promise<User | null> {
    return Promise.resolve(this.getItem<User>('user'));
  }

  async setUser(user: User): Promise<void> {
    this.setItem('user', user);
    return Promise.resolve();
  }

  // Organization operations
  async getOrganization(): Promise<Organization | null> {
    return Promise.resolve(this.getItem<Organization>('organization'));
  }

  async setOrganization(org: Organization): Promise<void> {
    this.setItem('organization', org);
    return Promise.resolve();
  }

  async updateOrganization(updates: Partial<Organization>): Promise<void> {
    const org = await this.getOrganization();
    if (org) {
      this.setOrganization({ ...org, ...updates, updatedAt: getCurrentTimestamp() });
    }
    return Promise.resolve();
  }

  // Area operations
  async getAreas(): Promise<Area[]> {
    return Promise.resolve(this.getItem<Area[]>('areas') || []);
  }

  async getArea(id: string): Promise<Area | null> {
    const areas = await this.getAreas();
    return Promise.resolve(areas.find(area => area.id === id) || null);
  }

  async createArea(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Promise<Area> {
    const newArea: Area = {
      ...area,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const areas = await this.getAreas();
    this.setItem('areas', [...areas, newArea]);
    return Promise.resolve(newArea);
  }

  async updateArea(id: string, updates: Partial<Area>): Promise<void> {
    const areas = await this.getAreas();
    const index = areas.findIndex(area => area.id === id);
    if (index !== -1) {
      areas[index] = { ...areas[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('areas', areas);
    }
    return Promise.resolve();
  }

  async deleteArea(id: string): Promise<void> {
    const areas = await this.getAreas();
    this.setItem('areas', areas.filter(area => area.id !== id));
    return Promise.resolve();
  }

  // KPI operations
  async getKPIs(areaId?: string): Promise<KPI[]> {
    const kpis = this.getItem<KPI[]>('kpis') || [];
    return Promise.resolve(areaId ? kpis.filter(kpi => kpi.areaId === areaId) : kpis);
  }

  async getKPI(id: string): Promise<KPI | null> {
    const kpis = await this.getKPIs();
    return Promise.resolve(kpis.find(kpi => kpi.id === id) || null);
  }

  async createKPI(kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<KPI> {
    const newKPI: KPI = {
      ...kpi,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const kpis = await this.getKPIs();
    this.setItem('kpis', [...kpis, newKPI]);
    return Promise.resolve(newKPI);
  }

  async updateKPI(id: string, updates: Partial<KPI>): Promise<void> {
    const kpis = await this.getKPIs();
    const index = kpis.findIndex(kpi => kpi.id === id);
    if (index !== -1) {
      kpis[index] = { ...kpis[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('kpis', kpis);
    }
    return Promise.resolve();
  }

  async deleteKPI(id: string): Promise<void> {
    const kpis = await this.getKPIs();
    this.setItem('kpis', kpis.filter(kpi => kpi.id !== id));
    return Promise.resolve();
  }

  // Task operations
  async getTasks(areaId?: string): Promise<Task[]> {
    const tasks = this.getItem<Task[]>('tasks') || [];
    return Promise.resolve(areaId ? tasks.filter(task => task.areaId === areaId) : tasks);
  }

  async getTask(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return Promise.resolve(tasks.find(task => task.id === id) || null);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const tasks = await this.getTasks();
    this.setItem('tasks', [...tasks, newTask]);
    return Promise.resolve(newTask);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('tasks', tasks);
    }
    return Promise.resolve();
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    this.setItem('tasks', tasks.filter(task => task.id !== id));
    return Promise.resolve();
  }

  // Process operations
  async getProcesses(areaId?: string): Promise<Process[]> {
    const processes = this.getItem<Process[]>('processes') || [];
    return Promise.resolve(areaId ? processes.filter(process => process.areaId === areaId) : processes);
  }

  async getProcess(id: string): Promise<Process | null> {
    const processes = await this.getProcesses();
    return Promise.resolve(processes.find(process => process.id === id) || null);
  }

  async createProcess(process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>): Promise<Process> {
    const newProcess: Process = {
      ...process,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };
    const processes = await this.getProcesses();
    this.setItem('processes', [...processes, newProcess]);
    return Promise.resolve(newProcess);
  }

  async updateProcess(id: string, updates: Partial<Process>): Promise<void> {
    const processes = await this.getProcesses();
    const index = processes.findIndex(process => process.id === id);
    if (index !== -1) {
      processes[index] = { ...processes[index], ...updates, updatedAt: getCurrentTimestamp() };
      this.setItem('processes', processes);
    }
    return Promise.resolve();
  }

  async deleteProcess(id: string): Promise<void> {
    const processes = await this.getProcesses();
    this.setItem('processes', processes.filter(process => process.id !== id));
    return Promise.resolve();
  }

  // Chat operations
  async getChatHistory(page?: string): Promise<ChatMessage[]> {
    const key = page ? `chat-${page}` : 'chat-general';
    return Promise.resolve(this.getItem<ChatMessage[]>(key) || []);
  }

  async addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>, page?: string): Promise<void> {
    const key = page ? `chat-${page}` : 'chat-general';
    const messages = await this.getChatHistory(page);
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: getCurrentTimestamp(),
    };
    this.setItem(key, [...messages, newMessage]);
    return Promise.resolve();
  }

  async saveChatHistory(messages: ChatMessage[], page?: string): Promise<void> {
    const key = page ? `chat-${page}` : 'chat-general';
    this.setItem(key, messages);
    return Promise.resolve();
  }

  async clearChatHistory(page?: string): Promise<void> {
    const key = page ? `chat-${page}` : 'chat-general';
    this.setItem(key, []);
    return Promise.resolve();
  }

  async search(query: string, collections: string[], areaId?: string, limit?: number): Promise<any[]> {
    return Promise.resolve([]);
  }
}

// Export singleton instance
export const db = new LocalStorageDatabase();
