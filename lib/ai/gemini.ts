import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext } from '../types';
import { db } from '../storage/localStorage';

// Initialize Gemini AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Agent system prompts
const AGENT_PROMPTS = {
  organization: `You are an Organization Agent helping users define their organization structure.
Your responsibilities:
- Collect organization information step-by-step (name, website, description)
- Help extract organizational pillars from provided information
- Identify and define organizational areas
- Analyze uploaded strategic planning documents
- Ask clarifying questions to better understand the organization

Be conversational, helpful, and ask one thing at a time. When the user provides information, acknowledge it and move to the next step naturally.`,

  kpi: `You are a KPI Agent helping users define Key Performance Indicators.
Your responsibilities:
- Help create, update, and validate KPIs
- Ask pertinent questions based on organization context
- Ensure KPIs are relevant to the selected area
- Explain why certain KPIs matter
- Identify gaps (e.g., missing KPIs for important activities)

Be specific and practical. Focus on measurable indicators that align with organizational goals.`,

  task: `You are a Task Agent helping users manage their tasks.
Your responsibilities:
- Help create, edit, and organize tasks
- Validate tasks against KPIs and organizational pillars
- Identify gaps in task coverage
- Ask elaboration questions to improve task definitions
- Ensure tasks are actionable and well-defined

Be practical and focused on actionable outcomes.`,

  process: `You are a Process Mapping Agent helping users visualize workflows.
Your responsibilities:
- Help create and organize process activities
- Guide users in mapping workflows across stages (Planning, Execution, Delivery)
- Validate processes against KPIs, tasks, and organizational pillars
- Suggest connections between activities
- Ensure complete process coverage

Focus on creating clear, logical workflows that make sense for the organization.`,

  general: `You are a General Conversational Agent with access to all organizational data.
Your responsibilities:
- Answer questions about any registered information
- Provide insights across all sections (Organization, Areas, KPIs, Tasks, Processes)
- Help users understand relationships between different elements
- Offer suggestions for improvements

Be comprehensive and helpful, drawing connections across all available data.`,
};

export interface ChatResponse {
  message: string;
  suggestedActions?: Array<{
    type: string;
    data: any;
  }>;
}

export async function sendMessage(
  message: string,
  context: AgentContext
): Promise<ChatResponse> {
  try {
    // Get the appropriate model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context information
    const contextInfo = buildContextInfo(context);

    // Get the agent prompt
    const agentPrompt = AGENT_PROMPTS[context.type];

    // Create the full prompt
    const fullPrompt = `${agentPrompt}

Current Context:
${contextInfo}

User Message: ${message}

Respond naturally and helpfully. If you can help the user create or update data, provide a clear response and optionally suggest specific actions.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      message: text,
    };
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    return {
      message: 'Sorry, I encountered an error processing your request. Please try again.',
    };
  }
}

function buildContextInfo(context: AgentContext): string {
  let info = '';

  // Add organization info
  const org = db.getOrganization();
  if (org) {
    info += `Organization: ${org.name}\n`;
    info += `Description: ${org.description}\n`;
    if (org.website) info += `Website: ${org.website}\n`;
    if (org.pillars && org.pillars.length > 0) {
      info += `Pillars: ${org.pillars.map(p => p.name).join(', ')}\n`;
    }
    info += '\n';
  }

  // Add areas
  const areas = db.getAreas();
  if (areas.length > 0) {
    info += `Areas (${areas.length}):\n`;
    areas.forEach(area => {
      info += `- ${area.name}: ${area.description}\n`;
    });
    info += '\n';
  }

  // Add context-specific information
  if (context.areaId) {
    const area = db.getArea(context.areaId);
    if (area) {
      info += `Current Area: ${area.name}\n`;
      info += `Area Description: ${area.description}\n\n`;

      // Add KPIs for this area
      const kpis = db.getKPIs(context.areaId);
      if (kpis.length > 0) {
        info += `KPIs in this area (${kpis.length}):\n`;
        kpis.forEach(kpi => {
          info += `- ${kpi.name}: ${kpi.description}\n`;
        });
        info += '\n';
      }

      // Add tasks for this area
      const tasks = db.getTasks(context.areaId);
      if (tasks.length > 0) {
        info += `Tasks in this area (${tasks.length}):\n`;
        tasks.forEach(task => {
          info += `- ${task.name}: ${task.description}\n`;
        });
        info += '\n';
      }

      // Add processes for this area
      const processes = db.getProcesses(context.areaId);
      if (processes.length > 0) {
        info += `Processes in this area (${processes.length}):\n`;
        processes.forEach(process => {
          info += `- ${process.name} (${process.stage}): ${process.description}\n`;
        });
        info += '\n';
      }
    }
  }

  // For general agent, include all data
  if (context.type === 'general') {
    const allKPIs = db.getKPIs();
    const allTasks = db.getTasks();
    const allProcesses = db.getProcesses();

    if (allKPIs.length > 0) {
      info += `Total KPIs: ${allKPIs.length}\n`;
    }
    if (allTasks.length > 0) {
      info += `Total Tasks: ${allTasks.length}\n`;
    }
    if (allProcesses.length > 0) {
      info += `Total Processes: ${allProcesses.length}\n`;
    }
  }

  return info || 'No context information available yet.';
}
