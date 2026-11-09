/** A checklist belongs to one assignment; completion never changes its parent. */
export type HomeworkSubtask = {
  id: string;
  title: string;
  completed: boolean;
};

export const MAX_SUBTASKS = 100;
export const MAX_SUBTASK_TITLE_LENGTH = 200;

export function parseSubtasks(value: unknown): HomeworkSubtask[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap(item => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' ||
        item.id.length < 1 || item.id.length > 64 || typeof item.title !== 'string' || typeof item.completed !== 'boolean' ||
        !item.title.trim() || ids.has(item.id)) return [];
    ids.add(item.id);
    return [{ id: item.id, title: item.title, completed: item.completed }];
  });
}

export function validateSubtasks(items: HomeworkSubtask[]): HomeworkSubtask[] {
  if (items.length > MAX_SUBTASKS) throw new Error(`You can add up to ${MAX_SUBTASKS} subtasks.`);
  const normalized = parseSubtasks(items).map(item => ({ ...item, title: item.title.trim() }));
  if (normalized.length !== items.length || normalized.some(item => item.title.length > MAX_SUBTASK_TITLE_LENGTH)) {
    throw new Error(`Give each subtask a name of 1–${MAX_SUBTASK_TITLE_LENGTH} characters.`);
  }
  return normalized;
}

export function freshSubtasks(value: unknown): HomeworkSubtask[] {
  return parseSubtasks(value).map(item => ({ ...item, id: crypto.randomUUID(), completed: false }));
}
