import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext } from '../types';
import { db } from '../storage/localStorage';
import { buildFullPrompt } from '@/prompts/promptBuilder';
import { actionSchema, type Action, type ChatResponse } from '@/prompts/schemas';
import { ZodError } from 'zod';

// Initialize Gemini AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Re-export ChatResponse type for backward compatibility
export type { ChatResponse };

// Extract structured actions from AI response with Zod validation
function extractActions(text: string): Action[] {
  const actions: Action[] = [];

  // Match JSON blocks in the format ~~~json...~~~
  const jsonMatches = text.matchAll(/~~~json\s*([\s\S]*?)\s*~~~/g);

  for (const match of jsonMatches) {
    let parsed: any = null;
    let jsonStr = '';

    try {
      jsonStr = match[1].trim();
      parsed = JSON.parse(jsonStr);

      // Log what we received from AI for debugging
      console.log('📥 Received action from AI:', JSON.stringify(parsed, null, 2));

      // Validate with Zod schema using safeParse for better error handling
      const result = actionSchema.safeParse(parsed);

      if (result.success) {
        // Skip "no_action" as it's just conversational and doesn't perform any action
        if (result.data.action === 'no_action') {
          console.log('💬 No action needed - AI is just conversing');
        } else {
          actions.push(result.data);
          console.log('✅ Action validated successfully:', result.data.action);
        }
      } else {
        throw result.error; // Will be caught by catch block below
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Action validation failed!');
        console.error('Received data:', JSON.stringify(parsed, null, 2));
        console.error('Validation errors:', JSON.stringify(error.issues, null, 2));

        // Try to use the action anyway if it has the basic structure
        // This provides backward compatibility if AI sends slightly different format
        if (parsed && parsed.action && parsed.data) {
          console.warn('⚠️  Using unvalidated action as fallback');
          actions.push(parsed as Action);
        }
      } else if (error instanceof SyntaxError) {
        console.error('❌ JSON parsing failed:', error.message);
        console.error('Raw JSON string:', jsonStr);
      } else {
        console.error('❌ Unexpected error:', error);
      }
    }
  }

  return actions;
}

export async function sendMessage(
  message: string,
  context: AgentContext
): Promise<ChatResponse> {
  try {
    // Get the appropriate model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context information
    const contextInfo = buildContextInfo(context);

    // Build the full prompt using the new prompt builder
    const fullPrompt = buildFullPrompt({
      agentType: context.type,
      contextInfo,
      userMessage: message,
    });

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Parse structured actions from the response
    const actions = extractActions(text);

    // Remove action JSON from the message for cleaner display
    const cleanMessage = text.replace(/~~~json[\s\S]*?~~~\s*/g, '').trim();

    // Map actions to the format expected by the rest of the app (backward compatibility)
    const mappedActions = actions.map(action => ({
      type: action.action,
      data: action.data,
    }));

    return {
      message: cleanMessage,
      suggestedActions: mappedActions,
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

  // For general agent, include all data with full details
  if (context.type === 'general') {
    const allKPIs = db.getKPIs();
    const allTasks = db.getTasks();
    const allProcesses = db.getProcesses();

    if (allKPIs.length > 0) {
      info += `\nTodos os KPIs (${allKPIs.length}):\n`;
      allKPIs.forEach(kpi => {
        const area = db.getArea(kpi.areaId);
        info += `- ${kpi.name} [Área: ${area?.name || 'N/A'}]: ${kpi.description}\n`;
      });
    }

    if (allTasks.length > 0) {
      info += `\nTodas as Tarefas (${allTasks.length}):\n`;
      allTasks.forEach(task => {
        const area = db.getArea(task.areaId);
        info += `- ${task.name} [Área: ${area?.name || 'N/A'}]: ${task.description}\n`;
      });
    }

    if (allProcesses.length > 0) {
      info += `\nTodos os Processos (${allProcesses.length}):\n`;
      allProcesses.forEach(process => {
        const area = db.getArea(process.areaId);
        info += `- ${process.name} [Área: ${area?.name || 'N/A'}, Etapa: ${process.stage}]: ${process.description}\n`;
      });
    }
  }

  return info || 'No context information available yet.';
}
