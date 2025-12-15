'use server'

import { QdrantClient } from '@qdrant/js-client-rest';
import { IDatabase } from './database';
import { getEmbedding } from '../ai/gemini';
import { Area, KPI, Task, Process, Organization, ChatMessage, User } from '../types';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

class QdrantDatabase implements IDatabase {
  private client: QdrantClient;
  private initializationPromise: Promise<void>;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_KEY,
    });
    this.initializationPromise = this.initCollections();
  }

  private async initCollections() {
    const coll = await this.client.getCollections(); // Check connection
    console.log(coll)
    const collections = ['areas', 'kpis', 'tasks', 'processes', 'chat_history', 'metadata'];
    const { collections: existingCollections } = await this.client.getCollections();
    const existingCollectionNames = new Set(existingCollections.map(c => c.name));

    for (const collection of collections) {
      if (!existingCollectionNames.has(collection)) {
        await this.client.createCollection(collection, {
          vectors: {
            size: 768, // Vector size for text-embedding-004
            distance: 'Cosine'
          }
        });
      }
    }
  }

  async ensureInitialized() {
    return this.initializationPromise;
  }

  async getUser(): Promise<User | null> {
    const userId = uuidv5('user', uuidv5.DNS);
    const response = await this.client.retrieve('metadata', { ids: [userId], with_payload: true });
    return response[0]?.payload as unknown as User | null;
  }

  async setUser(user: User): Promise<void> {
    const userId = uuidv5('user', uuidv5.DNS);
    await this.client.upsert('metadata', {
      points: [{ id: userId, vector: await getEmbedding(user.nickname), payload: user as any }],
      wait: true
    });
  }

  async getOrganization(): Promise<Organization | null> {
    const orgId = uuidv5('organization', uuidv5.DNS);
    const response = await this.client.retrieve('metadata', { ids: [orgId], with_payload: true });
    return response[0]?.payload as unknown as Organization | null;
  }

  async setOrganization(org: Organization): Promise<void> {
    const orgId = uuidv5('organization', uuidv5.DNS);
    await this.client.upsert('metadata', {
      points: [{ id: orgId, vector: await getEmbedding(org.name), payload: JSON.parse(JSON.stringify(org)) as any }],
      wait: true
    });
  }

  async updateOrganization(updates: Partial<Organization>): Promise<void> {
    const org = await this.getOrganization();
    if (org) {
      const updatedOrg = { ...org, ...updates };
      await this.setOrganization(updatedOrg);
    }
  }

  async createArea(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Promise<Area> {
    const newArea: Area = {
      ...area,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.client.upsert('areas', {
      points: [{
        id: newArea.id,
        vector: await getEmbedding(`${newArea.name} ${newArea.description}`),
        payload: newArea as any,
      }],
      wait: true
    });
    return newArea;
  }

  async getArea(id: string): Promise<Area | null> {
    const response = await this.client.retrieve('areas', { ids: [id], with_payload: true });
    return response[0]?.payload as unknown as Area | null;
  }

  async getAreas(): Promise<Area[]> {
    const response = await this.client.scroll('areas', { limit: 100, with_payload: true });
    return response.points.map(point => point.payload as unknown as Area);
  }

  async updateArea(id: string, updates: Partial<Area>): Promise<void> {
    const area = await this.getArea(id);
    if (area) {
      const updatedArea = { ...area, ...updates, updatedAt: new Date().toISOString() };
      await this.client.upsert('areas', {
        points: [{
          id: updatedArea.id,
          vector: await getEmbedding(`${updatedArea.name} ${updatedArea.description}`),
          payload: updatedArea as any,
        }],
        wait: true
      });
    }
  }

  async deleteArea(id: string): Promise<void> {
    await this.client.delete('areas', { points: [id] });
  }

  async createKPI(kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<KPI> {
    const newKPI: KPI = {
      ...kpi,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.client.upsert('kpis', {
      points: [{
        id: newKPI.id,
        vector: await getEmbedding(`${newKPI.name} ${newKPI.description}`),
        payload: newKPI as any,
      }],
      wait: true
    });
    return newKPI;
  }

  async getKPI(id: string): Promise<KPI | null> {
    const response = await this.client.retrieve('kpis', { ids: [id], with_payload: true });
    return response[0]?.payload as unknown as KPI | null;
  }

  async getKPIs(areaId?: string): Promise<KPI[]> {
    const response = await this.client.scroll('kpis', {
      limit: 100,
      with_payload: true,
      filter: areaId ? { must: [{ key: 'areaId', match: { value: areaId } }] } : undefined,
    });
    return response.points.map(point => point.payload as unknown as KPI);
  }

  async updateKPI(id: string, updates: Partial<KPI>): Promise<void> {
    const kpi = await this.getKPI(id);
    if (kpi) {
      const updatedKPI = { ...kpi, ...updates, updatedAt: new Date().toISOString() };
      await this.client.upsert('kpis', {
        points: [{
          id: updatedKPI.id,
          vector: await getEmbedding(`${updatedKPI.name} ${updatedKPI.description}`),
          payload: updatedKPI as any,
        }],
        wait: true
      });
    }
  }

  async deleteKPI(id: string): Promise<void> {
    await this.client.delete('kpis', { points: [id] });
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.client.upsert('tasks', {
      points: [{
        id: newTask.id,
        vector: await getEmbedding(`${newTask.name} ${newTask.description}`),
        payload: newTask as any,
      }],
      wait: true
    });
    return newTask;
  }

  async getTask(id: string): Promise<Task | null> {
    const response = await this.client.retrieve('tasks', { ids: [id], with_payload: true });
    return response[0]?.payload as unknown as Task | null;
  }

  async getTasks(areaId?: string): Promise<Task[]> {
    const response = await this.client.scroll('tasks', {
      limit: 100,
      with_payload: true,
      filter: areaId ? { must: [{ key: 'areaId', match: { value: areaId } }] } : undefined,
    });
    return response.points.map(point => point.payload as unknown as Task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const task = await this.getTask(id);
    if (task) {
      const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
      await this.client.upsert('tasks', {
        points: [{
          id: updatedTask.id,
          vector: await getEmbedding(`${updatedTask.name} ${updatedTask.description}`),
          payload: updatedTask as any,
        }],
        wait: true
      });
    }
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete('tasks', { points: [id] });
  }

  async createProcess(process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>): Promise<Process> {
    const newProcess: Process = {
      ...process,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.client.upsert('processes', {
      points: [{
        id: newProcess.id,
        vector: await getEmbedding(`${newProcess.name} ${newProcess.description}`),
        payload: newProcess as any,
      }],
      wait: true
    });
    return newProcess;
  }

  async getProcess(id: string): Promise<Process | null> {
    const response = await this.client.retrieve('processes', { ids: [id], with_payload: true });
    return response[0]?.payload as unknown as Process | null;
  }

  async getProcesses(areaId?: string): Promise<Process[]> {
    const response = await this.client.scroll('processes', {
      limit: 100,
      with_payload: true,
      filter: areaId ? { must: [{ key: 'areaId', match: { value: areaId } }] } : undefined,
    });
    return response.points.map(point => point.payload as unknown as Process);
  }

  async updateProcess(id: string, updates: Partial<Process>): Promise<void> {
    const process = await this.getProcess(id);
    if (process) {
      const updatedProcess = { ...process, ...updates, updatedAt: new Date().toISOString() };
      await this.client.upsert('processes', {
        points: [{
          id: updatedProcess.id,
          vector: await getEmbedding(`${updatedProcess.name} ${updatedProcess.description}`),
          payload: updatedProcess as any,
        }],
        wait: true
      });
    }
  }

  async deleteProcess(id: string): Promise<void> {
    await this.client.delete('processes', { points: [id] });
  }

  async getChatHistory(page?: string): Promise<ChatMessage[]> {
    const response = await this.client.scroll('chat_history', {
      limit: 100,
      with_payload: true,
      filter: page ? { must: [{ key: 'page', match: { value: page } }] } : undefined
    });
    return response.points.map(point => point.payload as unknown as ChatMessage).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>, page?: string): Promise<void> {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    await this.client.upsert('chat_history', {
      points: [{
        id: newMessage.id,
        vector: await getEmbedding(newMessage.content),
        payload: { ...newMessage, page } as any,
      }],
      wait: true
    });
  }

  async saveChatHistory(messages: ChatMessage[], page?: string): Promise<void> {
    const points = await Promise.all(messages.map(async (message) => ({
      id: message.id,
      vector: await getEmbedding(message.content),
      payload: { ...message, page } as any,
    })));
    await this.client.upsert('chat_history', { points, wait: true });
  }

  async clearChatHistory(page?: string): Promise<void> {
    const chatHistory = await this.getChatHistory(page);
    if (chatHistory.length === 0) {
      return;
    }
    const points = chatHistory.map(m => m.id);
    await this.client.delete('chat_history', { points });
  }

  async search(query: string, collections: string[], areaId?: string, limit: number = 5): Promise<any[]> {
    const query_vector = await getEmbedding(query);
    const filter = areaId ? { must: [{ key: 'areaId', match: { value: areaId } }] } : undefined;
    const searchRequests = collections.map(collection_name =>
      this.client.search(collection_name, {
        vector: query_vector,
        limit,
        filter,
        with_payload: true,
      })
    );
    const results = await Promise.all(searchRequests);
    return results.flat();
  }
}

const db = new QdrantDatabase();

export const getUser = async () => {
  await db.ensureInitialized();
  return db.getUser();
};

export const setUser = async (user: User) => {
  await db.ensureInitialized();
  return db.setUser(user);
};

export const getOrganization = async () => {
  await db.ensureInitialized();
  return db.getOrganization();
};

export const setOrganization = async (org: Organization) => {
  await db.ensureInitialized();
  return db.setOrganization(org);
};

export const updateOrganization = async (updates: Partial<Organization>) => {
  await db.ensureInitialized();
  return db.updateOrganization(updates);
};

export const getAreas = async () => {
  await db.ensureInitialized();
  return db.getAreas();
};

export const getArea = async (id: string) => {
  await db.ensureInitialized();
  return db.getArea(id);
};

export const createArea = async (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>) => {
  await db.ensureInitialized();
  return db.createArea(area);
};

export const updateArea = async (id: string, updates: Partial<Area>) => {
  await db.ensureInitialized();
  return db.updateArea(id, updates);
};

export const deleteArea = async (id: string) => {
  await db.ensureInitialized();
  return db.deleteArea(id);
};

export const getKPIs = async (areaId?: string) => {
  await db.ensureInitialized();
  return db.getKPIs(areaId);
};

export const getKPI = async (id: string) => {
  await db.ensureInitialized();
  return db.getKPI(id);
};

export const createKPI = async (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => {
  await db.ensureInitialized();
  return db.createKPI(kpi);
};

export const updateKPI = async (id: string, updates: Partial<KPI>) => {
  await db.ensureInitialized();
  return db.updateKPI(id, updates);
};

export const deleteKPI = async (id: string) => {
  await db.ensureInitialized();
  return db.deleteKPI(id);
};

export const getTasks = async (areaId?: string) => {
  await db.ensureInitialized();
  return db.getTasks(areaId);
};

export const getTask = async (id: string) => {
  await db.ensureInitialized();
  return db.getTask(id);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  await db.ensureInitialized();
  return db.createTask(task);
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  await db.ensureInitialized();
  return db.updateTask(id, updates);
};

export const deleteTask = async (id: string) => {
  await db.ensureInitialized();
  return db.deleteTask(id);
};

export const getProcesses = async (areaId?: string) => {
  await db.ensureInitialized();
  return db.getProcesses(areaId);
};

export const getProcess = async (id: string) => {
  await db.ensureInitialized();
  return db.getProcess(id);
};

export const createProcess = async (process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>) => {
  await db.ensureInitialized();
  return db.createProcess(process);
};

export const updateProcess = async (id: string, updates: Partial<Process>) => {
  await db.ensureInitialized();
  return db.updateProcess(id, updates);
};

export const deleteProcess = async (id: string) => {
  await db.ensureInitialized();
  return db.deleteProcess(id);
};

export const getChatHistory = async (page?: string) => {
  await db.ensureInitialized();
  return db.getChatHistory(page);
};

export const addChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>, page?: string) => {
  await db.ensureInitialized();
  return db.addChatMessage(message, page);
};

export const saveChatHistory = async (messages: ChatMessage[], page?: string) => {
  await db.ensureInitialized();
  return db.saveChatHistory(messages, page);
};

export const clearChatHistory = async (page?: string) => {
  await db.ensureInitialized();
  return db.clearChatHistory(page);
};

export const search = async (query: string, collections: string[], areaId?: string, limit: number = 5) => {
  await db.ensureInitialized();
  return db.search(query, collections, areaId, limit);
};
