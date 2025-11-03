import { AgentType } from '@/lib/types';
import { organizationPrompt } from './organizationPrompt/organization';
import { kpiPrompt } from './organizationPrompt/kpi';
import { taskPrompt } from './organizationPrompt/task';
import { processPrompt } from './organizationPrompt/process';
import { generalPrompt } from './organizationPrompt/general';

/**
 * Registry of all agent prompts by type
 */
const PROMPT_REGISTRY: Record<AgentType, string> = {
  organization: organizationPrompt,
  kpi: kpiPrompt,
  task: taskPrompt,
  process: processPrompt,
  general: generalPrompt,
};

/**
 * Get the system prompt for a specific agent type
 */
export function getAgentPrompt(agentType: AgentType): string {
  const prompt = PROMPT_REGISTRY[agentType];

  if (!prompt) {
    throw new Error(`No prompt found for agent type: ${agentType}`);
  }

  return prompt;
}

/**
 * Build a complete prompt with system prompt, context, and user message
 */
export interface PromptBuilderOptions {
  agentType: AgentType;
  contextInfo: string;
  userMessage: string;
}

export function buildFullPrompt(options: PromptBuilderOptions): string {
  const { agentType, contextInfo, userMessage } = options;

  const systemPrompt = getAgentPrompt(agentType);

  return `${systemPrompt}

Current Context:
${contextInfo}

User Message: ${userMessage}

Respond naturally and helpfully. If you can help the user create or update data, provide a clear response and optionally suggest specific actions.`;
}

/**
 * Validate that an agent type exists
 */
export function isValidAgentType(type: string): type is AgentType {
  return type in PROMPT_REGISTRY;
}

/**
 * Get all available agent types
 */
export function getAvailableAgentTypes(): AgentType[] {
  return Object.keys(PROMPT_REGISTRY) as AgentType[];
}
