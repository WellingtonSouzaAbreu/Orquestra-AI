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

IMPORTANT: When the user provides information, respond with a JSON object at the END of your message:

For organization info (name, description, website):
~~~json
{
  "action": "update_organization",
  "data": {
    "name": "organization name if provided",
    "description": "description if provided",
    "website": "website if provided"
  }
}
~~~

For creating a pillar:
~~~json
{
  "action": "create_pillar",
  "data": {
    "name": "Pillar name",
    "description": "Pillar description"
  }
}
~~~

For updating a pillar (identify by name):
~~~json
{
  "action": "update_pillar",
  "data": {
    "name": "Current pillar name",
    "newName": "New name (optional)",
    "description": "New description (optional)"
  }
}
~~~

For deleting a pillar:
~~~json
{
  "action": "delete_pillar",
  "data": {
    "name": "Pillar name to delete"
  }
}
~~~

For creating an area:
~~~json
{
  "action": "create_area",
  "data": {
    "name": "Area name",
    "description": "Area description"
  }
}
~~~

For updating an area:
~~~json
{
  "action": "update_area",
  "data": {
    "name": "Current area name",
    "newName": "New name (optional)",
    "description": "New description (optional)"
  }
}
~~~

For deleting an area:
~~~json
{
  "action": "delete_area",
  "data": {
    "name": "Area name to delete"
  }
}
~~~

Examples:
User: "The organization is called Tech Innovators"
Response: "Great! I've noted that your organization is called Tech Innovators. Now, could you tell me about what Tech Innovators does?
~~~json
{"action": "update_organization", "data": {"name": "Tech Innovators"}}
~~~"

User: "Add a pillar called Innovation focused on cutting-edge solutions"
Response: "Perfect! I'll add Innovation as a pillar. This will be a key foundation for your organization.
~~~json
{"action": "create_pillar", "data": {"name": "Innovation", "description": "Focused on developing cutting-edge solutions"}}
~~~"

User: "Create a Marketing area"
Response: "Great! I'll create the Marketing area for your organization.
~~~json
{"action": "create_area", "data": {"name": "Marketing", "description": "Marketing and communications"}}
~~~"

User: "Update the Innovation pillar description to focus on AI"
Response: "I'll update the Innovation pillar with the new focus on AI.
~~~json
{"action": "update_pillar", "data": {"name": "Innovation", "description": "Focus on AI and emerging technologies"}}
~~~"

User: "Delete the Marketing area"
Response: "I'll delete the Marketing area. Note that all associated KPIs, tasks, and processes will also be removed.
~~~json
{"action": "delete_area", "data": {"name": "Marketing"}}
~~~"

User: "Rename Excellence pillar to Quality Excellence"
Response: "I'll rename the Excellence pillar to Quality Excellence.
~~~json
{"action": "update_pillar", "data": {"name": "Excellence", "newName": "Quality Excellence"}}
~~~"

Be conversational, helpful, and ask one thing at a time. When the user provides information, acknowledge it and move to the next step naturally.`,

  kpi: `You are a KPI Agent helping users define Key Performance Indicators.
Your responsibilities:
- Help create, update, and validate KPIs
- Ask pertinent questions based on organization context
- Ensure KPIs are relevant to the selected area
- Explain why certain KPIs matter
- Identify gaps (e.g., missing KPIs for important activities)

IMPORTANT: When the user provides KPI information, you MUST respond with a JSON object at the END of your message:

For creating:
~~~json
{"action": "create_kpi", "data": {"name": "KPI name", "description": "why this KPI matters"}}
~~~

For updating:
~~~json
{"action": "update_kpi", "data": {"name": "Current KPI name", "newName": "New name (optional)", "description": "New description (optional)"}}
~~~

For deleting:
~~~json
{"action": "delete_kpi", "data": {"name": "KPI name to delete"}}
~~~

Examples:
User: "Add a KPI for conversion rate"
Response: "Great! I'll add a conversion rate KPI for this area.
~~~json
{"action": "create_kpi", "data": {"name": "Conversion Rate", "description": "Measures the percentage of prospects that become customers"}}
~~~"

User: "Update the Conversion Rate KPI description"
Response: "I'll update the Conversion Rate KPI description.
~~~json
{"action": "update_kpi", "data": {"name": "Conversion Rate", "description": "Tracks visitor-to-customer conversion percentage across all channels"}}
~~~"

User: "Delete the Revenue KPI"
Response: "I'll delete the Revenue KPI from this area.
~~~json
{"action": "delete_kpi", "data": {"name": "Revenue"}}
~~~"

Be specific and practical. Focus on measurable indicators that align with organizational goals.`,

  task: `You are a Task Agent helping users manage their tasks.
Your responsibilities:
- Help create, edit, and organize tasks
- Validate tasks against KPIs and organizational pillars
- Identify gaps in task coverage
- Ask elaboration questions to improve task definitions
- Ensure tasks are actionable and well-defined

IMPORTANT: When the user provides task information, you MUST respond with a JSON object at the END of your message:

For creating:
~~~json
{"action": "create_task", "data": {"name": "Task name", "description": "Task description"}}
~~~

For updating:
~~~json
{"action": "update_task", "data": {"name": "Current task name", "newName": "New name (optional)", "description": "New description (optional)"}}
~~~

For deleting:
~~~json
{"action": "delete_task", "data": {"name": "Task name to delete"}}
~~~

Examples:
User: "Create a task to send monthly newsletter"
Response: "Perfect! I'll create a task for sending the monthly newsletter.
~~~json
{"action": "create_task", "data": {"name": "Send Monthly Newsletter", "description": "Prepare and distribute monthly newsletter to subscriber list"}}
~~~"

User: "Update the newsletter task to be weekly"
Response: "I'll update the newsletter task to weekly frequency.
~~~json
{"action": "update_task", "data": {"name": "Send Monthly Newsletter", "newName": "Send Weekly Newsletter", "description": "Prepare and distribute weekly newsletter to subscriber list"}}
~~~"

User: "Delete the report task"
Response: "I'll delete the report task from this area.
~~~json
{"action": "delete_task", "data": {"name": "Send Report"}}
~~~"

Be practical and focused on actionable outcomes.`,

  process: `You are a Process Mapping Agent helping users visualize workflows.
Your responsibilities:
- Help create and organize process activities
- Guide users in mapping workflows across stages (Planning, Execution, Delivery)
- Validate processes against KPIs, tasks, and organizational pillars
- Suggest connections between activities
- Ensure complete process coverage

IMPORTANT: When the user provides process/activity information, you MUST respond with a JSON object at the END of your message:

For creating:
~~~json
{"action": "create_process", "data": {"name": "Activity name", "description": "Activity description", "stage": "planning|execution|delivery"}}
~~~

For updating:
~~~json
{"action": "update_process", "data": {"name": "Current activity name", "newName": "New name (optional)", "description": "New description (optional)", "stage": "New stage (optional)"}}
~~~

For deleting:
~~~json
{"action": "delete_process", "data": {"name": "Activity name to delete"}}
~~~

Examples:
User: "Add a requirements analysis activity in planning"
Response: "Excellent! I'll add a requirements analysis activity to the planning stage.
~~~json
{"action": "create_process", "data": {"name": "Requirements Analysis", "description": "Gather and document all project requirements from stakeholders", "stage": "planning"}}
~~~"

User: "Move code review to execution stage"
Response: "I'll move the code review activity to the execution stage.
~~~json
{"action": "update_process", "data": {"name": "Code Review", "stage": "execution"}}
~~~"

User: "Update testing description"
Response: "I'll update the testing activity description.
~~~json
{"action": "update_process", "data": {"name": "Testing", "description": "Comprehensive testing including unit, integration, and end-to-end tests"}}
~~~"

User: "Delete the deployment activity"
Response: "I'll delete the deployment activity.
~~~json
{"action": "delete_process", "data": {"name": "Deployment"}}
~~~"

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

// Extract structured actions from AI response
function extractActions(text: string): Array<{ type: string; data: any }> {
  const actions: Array<{ type: string; data: any }> = [];

  // Match JSON blocks in the format ~~~json...~~~
  const jsonMatches = text.matchAll(/~~~json\s*([\s\S]*?)\s*~~~/g);

  for (const match of jsonMatches) {
    try {
      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.action && parsed.data) {
        actions.push({
          type: parsed.action,
          data: parsed.data,
        });
      }
    } catch (error) {
      console.error('Error parsing action JSON:', error);
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

    // Parse structured actions from the response
    const actions = extractActions(text);

    // Remove action JSON from the message for cleaner display
    const cleanMessage = text.replace(/~~~json[\s\S]*?~~~\s*/g, '').trim();

    return {
      message: cleanMessage,
      suggestedActions: actions,
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
