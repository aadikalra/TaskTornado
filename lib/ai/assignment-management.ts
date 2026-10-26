import { z } from 'zod';

import type { GroqTool } from './groq';

const assignmentUpdatesSchema = z.strictObject({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(10_000).optional(),
  dueDate: z.iso.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
  classId: z.uuid().optional(),
}).refine((updates) => Object.keys(updates).length > 0, 'Provide at least one field to edit.');

export const assignmentManagementSchema = z.strictObject({
  operations: z.array(z.discriminatedUnion('action', [
    z.strictObject({
      action: z.literal('edit'),
      homeworkId: z.uuid(),
      updates: assignmentUpdatesSchema,
    }),
    z.strictObject({
      action: z.literal('delete'),
      homeworkId: z.uuid(),
    }),
  ])).min(1).max(20),
}).refine(
  ({ operations }) => new Set(operations.map((operation) => operation.homeworkId)).size === operations.length,
  'Include each assignment only once per call.'
);

export const assignmentManagementTool: GroqTool = {
  type: 'function',
  function: {
    name: 'manage_assignments',
    description: 'Edit or delete existing homework assignments, singly or in bulk, when the student requests it. First use get_school_data to find the exact homeworkId and, when moving an assignment, classId. Never invent IDs or select an ambiguous match. Edit only the requested fields; omitted fields remain unchanged. Deleting removes only the specified assignment, not its recurring series. Changes are saved by the app after this call; do not claim they have already succeeded.',
    parameters: {
      type: 'object',
      properties: {
        operations: {
          type: 'array',
          minItems: 1,
          maxItems: 20,
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['edit', 'delete'] },
              homeworkId: { type: 'string', description: 'Exact assignment ID returned by get_school_data.' },
              updates: {
                type: 'object',
                description: 'Required for edit; omit for delete. Include only fields the student wants changed.',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 200 },
                  description: { type: 'string', maxLength: 10000 },
                  dueDate: { type: 'string', description: 'New due date as YYYY-MM-DD.' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  completed: { type: 'boolean', description: 'True to mark complete; false to reopen.' },
                  classId: { type: 'string', description: 'Exact enrolled class ID returned by get_school_data.' },
                },
                additionalProperties: false,
              },
            },
            required: ['action', 'homeworkId'],
            additionalProperties: false,
          },
        },
      },
      required: ['operations'],
      additionalProperties: false,
    },
  },
};

export type AssignmentManagementResult = {
  homeworkId: string;
  action: 'edit' | 'delete';
  title: string;
  status: 'success' | 'error';
  error?: string;
};

type AssignmentManagementDependencies = {
  userId: string;
  homeworks: ReadonlyArray<{ id: string; title: string; user_id: string }>;
  classIds: ReadonlyArray<string>;
  updateHomework: (id: string, updates: z.infer<typeof assignmentUpdatesSchema>) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
};

export async function executeAssignmentManagement(
  input: unknown,
  dependencies: AssignmentManagementDependencies
): Promise<AssignmentManagementResult[]> {
  // Validate the entire batch before writing anything, including real calendar dates.
  const { operations } = assignmentManagementSchema.parse(input);
  const results: AssignmentManagementResult[] = [];

  for (const operation of operations) {
    const homework = dependencies.homeworks.find((item) =>
      item.id === operation.homeworkId && item.user_id === dependencies.userId
    );
    const result: AssignmentManagementResult = {
      homeworkId: operation.homeworkId,
      action: operation.action,
      title: homework?.title || 'Unknown assignment',
      status: 'error',
    };

    try {
      if (!homework) throw new Error('This assignment is no longer available. Ask Aurora to look it up again.');
      if (operation.action === 'delete') {
        await dependencies.deleteHomework(homework.id);
      } else {
        const updates = { ...operation.updates };
        if (updates.classId && !dependencies.classIds.includes(updates.classId)) {
          throw new Error('The destination class is not one of your enrolled classes.');
        }
        if (updates.dueDate) {
          // Match assignment creation: a calendar date at noon in the student's timezone.
          updates.dueDate = new Date(`${updates.dueDate}T12:00:00`).toISOString();
        }
        await dependencies.updateHomework(homework.id, updates);
      }
      result.status = 'success';
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'The assignment could not be saved. Please try again.';
    }
    results.push(result);
  }
  return results;
}

export function summarizeAssignmentManagement(results: AssignmentManagementResult[]): string {
  return results.map((result) => {
    const verb = result.action === 'edit' ? 'Updated' : 'Deleted';
    return result.status === 'success'
      ? `${verb} “${result.title}”.`
      : `Couldn’t ${result.action} “${result.title}”: ${result.error}`;
  }).join('\n\n');
}
