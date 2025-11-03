import { z } from 'zod';

// ========================================
// Organization Action Schemas
// ========================================

export const updateOrganizationSchema = z.object({
  action: z.literal('update_organization'),
  data: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    website: z.string().optional(),
  }),
});

export const createPillarSchema = z.object({
  action: z.literal('create_pillar'),
  data: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const updatePillarSchema = z.object({
  action: z.literal('update_pillar'),
  data: z.object({
    name: z.string(),
    newName: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const deletePillarSchema = z.object({
  action: z.literal('delete_pillar'),
  data: z.object({
    name: z.string(),
  }),
});

export const createAreaSchema = z.object({
  action: z.literal('create_area'),
  data: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const updateAreaSchema = z.object({
  action: z.literal('update_area'),
  data: z.object({
    name: z.string(),
    newName: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const deleteAreaSchema = z.object({
  action: z.literal('delete_area'),
  data: z.object({
    name: z.string(),
  }),
});

// ========================================
// KPI Action Schemas
// ========================================

export const createKpiSchema = z.object({
  action: z.literal('create_kpi'),
  data: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const updateKpiSchema = z.object({
  action: z.literal('update_kpi'),
  data: z.object({
    name: z.string(),
    newName: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const deleteKpiSchema = z.object({
  action: z.literal('delete_kpi'),
  data: z.object({
    name: z.string(),
  }),
});

// ========================================
// Task Action Schemas
// ========================================

export const createTaskSchema = z.object({
  action: z.literal('create_task'),
  data: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const updateTaskSchema = z.object({
  action: z.literal('update_task'),
  data: z.object({
    name: z.string(),
    newName: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const deleteTaskSchema = z.object({
  action: z.literal('delete_task'),
  data: z.object({
    name: z.string(),
  }),
});

// ========================================
// Process Action Schemas
// ========================================

export const createProcessSchema = z.object({
  action: z.literal('create_process'),
  data: z.object({
    name: z.string(),
    description: z.string(),
    stage: z.enum(['planning', 'execution', 'delivery']),
  }),
});

export const updateProcessSchema = z.object({
  action: z.literal('update_process'),
  data: z.object({
    name: z.string(),
    newName: z.string().optional(),
    description: z.string().optional(),
    stage: z.enum(['planning', 'execution', 'delivery']).optional(),
  }),
});

export const deleteProcessSchema = z.object({
  action: z.literal('delete_process'),
  data: z.object({
    name: z.string(),
  }),
});

// ========================================
// Special action schemas
// ========================================

// No action - when AI is just conversing without performing an action
export const noActionSchema = z.object({
  action: z.literal('no_action'),
  data: z.optional(z.any()),
});

// ========================================
// Union of all action schemas
// ========================================

export const actionSchema = z.discriminatedUnion('action', [
  noActionSchema,
  updateOrganizationSchema,
  createPillarSchema,
  updatePillarSchema,
  deletePillarSchema,
  createAreaSchema,
  updateAreaSchema,
  deleteAreaSchema,
  createKpiSchema,
  updateKpiSchema,
  deleteKpiSchema,
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  createProcessSchema,
  updateProcessSchema,
  deleteProcessSchema,
]);

// ========================================
// Infer TypeScript types from schemas
// ========================================

export type Action = z.infer<typeof actionSchema>;
export type NoAction = z.infer<typeof noActionSchema>;
export type UpdateOrganizationAction = z.infer<typeof updateOrganizationSchema>;
export type CreatePillarAction = z.infer<typeof createPillarSchema>;
export type UpdatePillarAction = z.infer<typeof updatePillarSchema>;
export type DeletePillarAction = z.infer<typeof deletePillarSchema>;
export type CreateAreaAction = z.infer<typeof createAreaSchema>;
export type UpdateAreaAction = z.infer<typeof updateAreaSchema>;
export type DeleteAreaAction = z.infer<typeof deleteAreaSchema>;
export type CreateKpiAction = z.infer<typeof createKpiSchema>;
export type UpdateKpiAction = z.infer<typeof updateKpiSchema>;
export type DeleteKpiAction = z.infer<typeof deleteKpiSchema>;
export type CreateTaskAction = z.infer<typeof createTaskSchema>;
export type UpdateTaskAction = z.infer<typeof updateTaskSchema>;
export type DeleteTaskAction = z.infer<typeof deleteTaskSchema>;
export type CreateProcessAction = z.infer<typeof createProcessSchema>;
export type UpdateProcessAction = z.infer<typeof updateProcessSchema>;
export type DeleteProcessAction = z.infer<typeof deleteProcessSchema>;

// ========================================
// Chat Response Schema
// ========================================

// Legacy action format for backward compatibility with the rest of the app
const legacyActionSchema = z.object({
  type: z.string(),
  data: z.any(),
});

export const chatResponseSchema = z.object({
  message: z.string(),
  suggestedActions: z.array(legacyActionSchema).optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
