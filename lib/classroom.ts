import { supabase } from '@/lib/supabase/client';
import type { Class } from '@/context/ClassContext';

export type ClassroomMember = { user_id: string; name: string; is_owner: boolean };
export type ClassroomInvite = { token: string; expires_at: string };
export type InvitePreview = { id: string; name: string; color: string | null; icon: string | null; already_joined: boolean };
export const isInviteToken = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function refreshClassroomData() {
  window.dispatchEvent(new Event('classroom-refresh'));
}
export function classroomError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Couldn’t update this class. Please try again.';
}
export async function sharedClasses(): Promise<Class[]> {
  const { data, error } = await supabase.rpc('classroom_classes');
  if (error) throw error;
  return (data ?? []) as unknown as Class[];
}
export async function createClassInvite(classId: string): Promise<ClassroomInvite> {
  const { data, error } = await supabase.rpc('classroom_create_invite', { p_class_id: classId });
  if (error) throw error;
  refreshClassroomData();
  return data as unknown as ClassroomInvite;
}
export async function classroomMembers(classId: string): Promise<ClassroomMember[]> {
  const { data, error } = await supabase.rpc('classroom_members_list', { p_class_id: classId });
  if (error) throw error;
  return (data ?? []) as unknown as ClassroomMember[];
}
