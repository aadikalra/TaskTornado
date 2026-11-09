'use client';

import { useId, useRef, useState } from 'react';
import { Check, ChevronDown, ListChecks, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { type HomeworkSubtask, MAX_SUBTASKS, MAX_SUBTASK_TITLE_LENGTH, parseSubtasks } from '@/lib/homework-subtasks';

export function SubtaskProgress({ subtasks, className = '' }: { subtasks: unknown; className?: string }) {
  const items = parseSubtasks(subtasks);
  if (!items.length) return null;
  const done = items.filter(item => item.completed).length;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${className}`} aria-label={`${done} of ${items.length} subtasks completed`}>
      <ListChecks size={13} aria-hidden="true" />
      <span>{done}/{items.length} subtasks</span>
    </span>
  );
}

export function SubtaskChecklist({ value = [], onChange, live = false, disabled = false, compact = false, allowEditing = true }: {
  value?: HomeworkSubtask[];
  onChange: (items: HomeworkSubtask[]) => void | Promise<void>;
  live?: boolean;
  disabled?: boolean;
  compact?: boolean;
  allowEditing?: boolean;
}) {
  const sectionId = useId();
  const [expanded, setExpanded] = useState(value.length > 0 || live);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [removed, setRemoved] = useState<{ item: HomeworkSubtask; index: number } | null>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const busy = disabled || saving;
  const done = value.filter(item => item.completed).length;

  async function change(items: HomeworkSubtask[]) {
    if (disabled || savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await onChange(items);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t save your subtasks. Please try again.');
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function add() {
    const title = newTitle.trim();
    if (!title || value.length >= MAX_SUBTASKS) return;
    if (await change([...value, { id: crypto.randomUUID(), title, completed: false }])) {
      setNewTitle('');
      requestAnimationFrame(() => addInput.current?.focus());
    }
  }

  async function rename(id: string) {
    const title = editTitle.trim();
    if (!title) { setError('Give this subtask a name, or remove it with the trash button.'); return; }
    if (await change(value.map(item => item.id === id ? { ...item, title } : item))) setEditingId(null);
  }

  return (
    <section className="rounded-2xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/20 overflow-hidden" aria-label="Subtasks" aria-busy={saving}>
      {!compact && <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={sectionId}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sky-800 dark:text-sky-200 hover:bg-sky-50/70 dark:hover:bg-gray-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400">
        <ListChecks size={16} className="text-sky-500 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold">{!value.length && !expanded ? 'Add subtasks' : 'Subtasks'}</span>
        {saving && <Loader2 size={14} className="animate-spin" aria-label="Saving subtasks" />}
        {value.length > 0 && <span className="text-xs tabular-nums text-sky-600 dark:text-sky-400">{done}/{value.length}</span>}
        <ChevronDown size={14} className={`shrink-0 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>}
      {(compact || expanded) && <div id={sectionId} className={compact ? "p-2" : "px-3 pb-3"}>
        {!compact && <p className="px-1 pb-3 text-xs leading-relaxed text-sky-700/75 dark:text-sky-300/70">
          {value.length === 0 ? 'Break it into small steps, like photos, captions, and layout.' : live && done === value.length ? 'All steps done. Finish the homework when you’re ready.' : 'Small steps, one at a time. Finish the homework separately.'}
        </p>}
        {value.length > 0 && <>
          <div role="progressbar" aria-label="Subtask progress" aria-valuemin={0} aria-valuemax={value.length} aria-valuenow={done} className="mx-1 mb-3 h-1 overflow-hidden rounded-full bg-sky-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-sky-500 transition-[width] motion-reduce:transition-none" style={{ width: `${done / value.length * 100}%` }} />
          </div>
          <ul className="space-y-1 mb-2">
            {value.map(item => <li key={item.id} className="group flex items-center gap-1 rounded-xl px-1 py-0.5 hover:bg-white/80 dark:hover:bg-gray-800/50">
              <button type="button" role="checkbox" aria-checked={item.completed} aria-label={`Complete subtask: ${item.title}`} disabled={busy}
                onClick={() => change(value.map(step => step.id === item.id ? { ...step, completed: !step.completed } : step))}
                className="grid size-9 shrink-0 place-items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50">
                <span className={`grid size-[18px] place-items-center rounded-md border transition-colors ${item.completed ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-600'}`}>
                  {item.completed && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                </span>
              </button>
              {editingId === item.id ? <div className="flex flex-1 min-w-0 items-center gap-1">
                <input autoFocus aria-label="Subtask name" value={editTitle} maxLength={MAX_SUBTASK_TITLE_LENGTH} disabled={busy}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); rename(item.id); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditingId(null); setError(''); } }}
                  className="w-full min-w-0 rounded-lg border border-sky-200 bg-white dark:bg-gray-900 dark:border-gray-600 px-2 py-1.5 text-sm text-sky-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-300" />
                <button type="button" aria-label="Save subtask name" disabled={busy || !editTitle.trim()} onClick={() => rename(item.id)} className="grid size-9 shrink-0 place-items-center rounded-lg text-sky-600 hover:bg-sky-100 disabled:opacity-40"><Check size={15} /></button>
                <button type="button" aria-label="Cancel rename" disabled={busy} onClick={() => { setEditingId(null); setError(''); }} className="grid size-9 shrink-0 place-items-center rounded-lg text-sky-500 hover:bg-sky-100"><X size={15} /></button>
              </div> : <>
                <span className={`min-w-0 flex-1 break-words text-sm ${item.completed ? 'line-through text-sky-700/55 dark:text-sky-300/50' : 'text-sky-900 dark:text-sky-100'}`}>{item.title}</span>
                {allowEditing && <button type="button" aria-label={`Rename ${item.title}`} disabled={busy} onClick={() => { setEditingId(item.id); setEditTitle(item.title); }} className="grid size-9 shrink-0 place-items-center rounded-lg text-sky-500 hover:bg-sky-100 dark:hover:bg-gray-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-40"><Pencil size={13} /></button>}
              </>}
              {allowEditing && <button type="button" aria-label={`Remove ${item.title}`} disabled={busy} onClick={async () => {
                if (await change(value.filter(step => step.id !== item.id))) { setRemoved({ item, index: value.findIndex(step => step.id === item.id) }); if (editingId === item.id) setEditingId(null); }
              }} className="grid size-9 shrink-0 place-items-center rounded-lg text-sky-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-40"><Trash2 size={14} /></button>}
            </li>)}
          </ul>
        </>}
        {allowEditing && (value.length < MAX_SUBTASKS ? <div className="flex items-center gap-2 rounded-xl border border-dashed border-sky-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 pl-3 pr-1 focus-within:ring-2 focus-within:ring-sky-300 dark:focus-within:ring-sky-700">
          <Plus size={14} className="text-sky-400 shrink-0" aria-hidden="true" />
          <input ref={addInput} value={newTitle} maxLength={MAX_SUBTASK_TITLE_LENGTH} onChange={e => setNewTitle(e.target.value)} disabled={busy}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="Add a subtask…" aria-label="New subtask" className="w-full min-w-0 bg-transparent py-2.5 text-sm text-sky-900 dark:text-white placeholder:text-sky-500/65 outline-none disabled:opacity-50" />
          <button type="button" onClick={add} disabled={busy || !newTitle.trim()} aria-label="Add subtask" className="h-9 shrink-0 rounded-lg px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-sky-400">Add</button>
        </div> : <p className="px-1 text-xs text-sky-600 dark:text-sky-400">You’ve reached {MAX_SUBTASKS} subtasks.</p>)}
        {allowEditing && removed && <div className="mt-2 flex items-center gap-2 px-1 text-xs text-sky-700 dark:text-sky-300" role="status">
          <span className="min-w-0 flex-1 truncate">Subtask removed</span>
          <button type="button" disabled={busy || value.length >= MAX_SUBTASKS} className="rounded px-2 py-1 font-semibold underline underline-offset-2 disabled:opacity-40" onClick={async () => {
            const items = [...value]; items.splice(Math.min(removed.index, items.length), 0, removed.item);
            if (await change(items)) setRemoved(null);
          }}>Undo</button>
          <button type="button" aria-label="Dismiss undo" className="p-1" onClick={() => setRemoved(null)}><X size={13} /></button>
        </div>}
        {error && <p role="alert" className="mt-2 px-1 text-xs leading-relaxed text-red-600 dark:text-red-400">{error}</p>}
        {live && <p className="mt-2 px-1 text-[11px] text-sky-600/75 dark:text-sky-400/70" role="status">{saving ? 'Saving…' : 'Changes save automatically'}</p>}
      </div>}
    </section>
  );
}

/** Class-card subtasks use the same row treatment as their parent homework. */
export function SubtaskDisclosure({ title, value = [], onChange, disabled = false, accentColor = '#0ea5e9', variant = 'class-card' }: {
  title: string;
  value?: HomeworkSubtask[];
  onChange: (items: HomeworkSubtask[]) => void | Promise<void>;
  disabled?: boolean;
  accentColor?: string;
  variant?: 'class-card' | 'legacy';
}) {
  const [expanded, setExpanded] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const savingRef = useRef(false);
  const panelId = useId();

  async function toggle(id: string) {
    if (disabled || savingRef.current) return;
    savingRef.current = true;
    setSavingId(id);
    setError('');
    try {
      await onChange(value.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t save this step. Please try again.');
    } finally {
      savingRef.current = false;
      setSavingId(null);
    }
  }

  if (!value.length) return null;
  return (
    <div className="min-w-0" onClick={event => event.stopPropagation()}>
      <button type="button" aria-label={`${expanded ? 'Hide' : 'Show'} subtasks for ${title}`}
        aria-expanded={expanded} aria-controls={expanded ? panelId : undefined}
        onClick={() => setExpanded(previous => !previous)}
        className="inline-flex min-h-5 items-center gap-1.5 rounded-md px-1 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100/70 dark:hover:bg-sky-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors">
        <SubtaskProgress subtasks={value} />
        <ChevronDown size={12} aria-hidden="true" className={`transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div id={panelId} className="mt-1" role="region" aria-label={`Subtasks for ${title}`} aria-busy={Boolean(savingId)}>
        <ul className="space-y-1">
          {value.map(item => <li key={item.id}
            className={`group/subtask flex items-center gap-2 rounded-xl py-1.5 transition-colors ${variant === 'class-card' ? 'px-2 hover:bg-white dark:hover:bg-gray-700/50' : 'px-0 hover:bg-sky-50/60 dark:hover:bg-sky-500/5'}`}>
            {variant === 'class-card' ? <button type="button" role="checkbox" aria-checked={item.completed}
              aria-label={`Mark subtask ${item.completed ? 'incomplete' : 'complete'}: ${item.title}`}
              onClick={() => toggle(item.id)} disabled={disabled || Boolean(savingId)}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:cursor-wait disabled:opacity-60 ${item.completed ? 'border-transparent text-white' : 'border-[#cbdceb] dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-500'}`}
              style={item.completed ? { backgroundColor: accentColor } : undefined}>
              {savingId === item.id ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : item.completed && <HugeIcon name="CheckmarkCircle01" size={13} className="h-3.5 w-3.5 text-white" />}
            </button> : <Checkbox checked={item.completed}
              aria-label={`Mark subtask ${item.completed ? 'incomplete' : 'complete'}: ${item.title}`}
              onCheckedChange={() => toggle(item.id)} disabled={disabled || Boolean(savingId)}
              className={item.completed ? '' : 'border-2 border-sky-200 dark:border-sky-800/40 bg-white dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-sky-500/10'}
              style={item.completed ? { backgroundColor: accentColor } : undefined} />}
            <span className={`min-w-0 flex-1 break-words font-medium ${variant === 'class-card'
              ? `text-xs ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#2a2d37] dark:text-gray-100 group-hover/subtask:text-[#275085] dark:group-hover/subtask:text-sky-300'}`
              : `text-sm ${item.completed ? 'text-sky-900/30 dark:text-sky-400/50' : 'text-sky-900 dark:text-sky-100'}`}`}>
              {item.title}
            </span>
          </li>)}
        </ul>
        <span role="status" className="sr-only">{savingId ? 'Saving subtask…' : ''}</span>
        {error && <p role="alert" className="mt-1 px-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>}
    </div>
  );
}
