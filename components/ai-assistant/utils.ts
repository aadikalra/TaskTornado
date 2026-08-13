import { AIChecklistData, InteractiveButton, Message } from './types';
import { Class, Homework, Test } from '@/context/ClassContext';
import { parseCalendarDate } from '@/lib/dateUtils';

export function parseInteractiveButtons(content: string): { content: string; buttons: InteractiveButton[] } {
  const buttonRegex = /```interactive_buttons\n([\s\S]*?)\n```/g;
  const match = buttonRegex.exec(content);

  if (!match) {
    return { content, buttons: [] };
  }

  try {
    const buttonsData = JSON.parse(match[1]);
    const cleanContent = content.replace(buttonRegex, '').trim();

    return {
      content: cleanContent,
      buttons: buttonsData.map((btn: any, index: number) => ({
        id: `btn_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        text: btn.text,
        shortcut: btn.shortcut,
        prompt: btn.prompt || '',
        style: btn.style || 'secondary',
        action: btn.action || 'send_prompt',
        payload: btn.payload
      }))
    };
  } catch (error) {
    console.error('Failed to parse interactive buttons:', error);
    return { content, buttons: [] };
  }
}

export function parseChecklist(content: string): { content: string; checklist?: AIChecklistData } {
  const checklistRegex = /```checklist\n([\s\S]*?)\n```/g;
  const match = checklistRegex.exec(content);

  if (!match) {
    return { content };
  }

  try {
    const checklistData = JSON.parse(match[1]);
    const cleanContent = content.replace(checklistRegex, '').trim();

    return {
      content: cleanContent,
      checklist: checklistData
    };
  } catch (error) {
    console.error('Error parsing checklist:', error);
    return { content };
  }
}

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/;max-age=${days * 24 * 60 * 60}`;
  document.cookie = cookieValue;
};

export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;max-age=0`;
};

export const getMessageGroups = (messages: Message[]) => {
  const groups: Array<{
    role: 'user' | 'assistant';
    messages: Message[];
  }> = [];

  if (messages.length === 0) return groups;

  let current = {
    role: messages[0].role,
    messages: [messages[0]] as Message[],
  };

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === current.role) {
      current.messages.push(messages[i]);
    } else {
      groups.push(current);
      current = {
        role: messages[i].role,
        messages: [messages[i]],
      };
    }
  }
  groups.push(current);
  return groups;
};

export const generateDataContext = (
  classes: Class[],
  homeworks: Homework[],
  tests: Test[],
  getClassById: (id: string) => Class | undefined
): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingIncomplete = homeworks
    .filter((hw) => !hw.completed && new Date(hw.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 20);

  const overdueIncomplete = homeworks
    .filter((hw) => !hw.completed && new Date(hw.dueDate) < now)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 20);

  const completed = homeworks
    .filter((hw) => hw.completed)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 10);

  const upcomingTests = tests
    .filter((test) => parseCalendarDate(test.testDate) >= now)
    .sort((a, b) => parseCalendarDate(a.testDate).getTime() - parseCalendarDate(b.testDate).getTime())
    .slice(0, 10);

  const pastTests = tests
    .filter((test) => parseCalendarDate(test.testDate) < now)
    .sort((a, b) => parseCalendarDate(b.testDate).getTime() - parseCalendarDate(a.testDate).getTime())
    .slice(0, 10);

  let context = 'SCHOOL DATA CONTEXT:\n\n';

  if (classes && classes.length > 0) {
    context += `AVAILABLE CLASSES / SUBJECTS (${classes.length} classes):\n`;
    context += classes.map((c) => `- ${c.name}`).join('\n');
    context += '\n\n';
  }

  if (
    upcomingIncomplete.length === 0 &&
    overdueIncomplete.length === 0 &&
    completed.length === 0 &&
    upcomingTests.length === 0 &&
    pastTests.length === 0
  ) {
    context += 'No active homework or tests found. The user has a clean slate!\n';
    return context;
  }

  const formatHw = (hw: Homework) => {
    const cls = getClassById(hw.classId);
    const due = new Date(hw.dueDate);
    const dueString = due.toLocaleDateString();
    let when = '';

    if (!hw.completed) {
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) when = '(Due Today)';
      else if (diffDays === 1) when = '(Due Tomorrow)';
      else if (diffDays > 1) when = `(in ${diffDays} days)`;
      else when = `(Overdue by ${Math.abs(diffDays)} days)`;
    }

    return `- ${hw.title}
  - Class: ${cls?.name ?? 'Unknown'}
  - Due: ${dueString} ${when}
  - Status: ${hw.completed ? 'Completed' : 'Incomplete'}`;
  };

  const formatTest = (test: Test) => {
    const cls = getClassById(test.classId);
    const testDate = parseCalendarDate(test.testDate);
    const dateString = testDate.toLocaleDateString();
    let when = '';

    const diffTime = testDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) when = '(Today)';
    else if (diffDays === 1) when = '(Tomorrow)';
    else if (diffDays > 1) when = `(in ${diffDays} days)`;
    else if (diffDays < 0) when = `(${Math.abs(diffDays)} days ago)`;

    return `- ${test.title}
  - Class: ${cls?.name ?? 'Unknown'}
  - Date: ${dateString} ${when}`;
  };

  if (upcomingTests.length > 0) {
    context += `UPCOMING TESTS/EXAMS (${upcomingTests.length} items):\n`;
    context += upcomingTests.map(formatTest).join('\n');
    context += '\n\n';
  }

  if (upcomingIncomplete.length > 0) {
    context += `UPCOMING INCOMPLETE HOMEWORK (${upcomingIncomplete.length} items):\n`;
    context += upcomingIncomplete.map(formatHw).join('\n');
    context += '\n\n';
  }

  if (overdueIncomplete.length > 0) {
    context += `OVERDUE INCOMPLETE HOMEWORK (${overdueIncomplete.length} items):\n`;
    context += overdueIncomplete.map(formatHw).join('\n');
    context += '\n\n';
  }

  if (completed.length > 0) {
    context += `RECENTLY COMPLETED HOMEWORK (${completed.length} most recent items):\n`;
    context += completed.map(formatHw).join('\n');
    context += '\n\n';
  }

  if (pastTests.length > 0) {
    context += `RECENT PAST TESTS/EXAMS (${pastTests.length} most recent items):\n`;
    context += pastTests.map(formatTest).join('\n');
    context += '\n\n';
  }

  context += 'Use this data context to provide relevant help, reminders, and analysis.';
  return context;
};
