import { createClient } from '@/lib/supabase/server';
import {
  getClassGradePercentage,
  getScorePercentage,
} from '@/lib/ai/school-percentages';

export async function getBoundedSchoolData(
  userId: string,
  accessToken?: string
) {
  const supabase = await createClient(accessToken);
  const [classesResult, homeworkResult, testsResult] = await Promise.all([
    supabase
      .from('classes')
      .select('id,name,grade,grade_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(12),
    supabase
      .from('homework')
      .select('title,class_id,due_date,completed,priority')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .limit(20),
    supabase
      .from('tests')
      .select('title,class_id,test_date,test_type,status,score,max_score,grade')
      .eq('user_id', userId)
      .order('test_date', { ascending: true })
      .limit(10),
  ]);

  if (classesResult.error || homeworkResult.error || testsResult.error) {
    throw new Error('School data could not be retrieved.');
  }

  const classes = classesResult.data || [];
  const classNames = new Map(classes.map((item) => [item.id, item.name]));
  const homework = (homeworkResult.data || []).map((item) => ({
    title: item.title.slice(0, 200),
    className: classNames.get(item.class_id) || 'Unknown class',
    dueDate: item.due_date,
    completed: Boolean(item.completed),
    priority: item.priority,
  }));
  const tests = (testsResult.data || []).map((item) => ({
    title: item.title.slice(0, 200),
    className: classNames.get(item.class_id) || 'Unknown class',
    date: item.test_date,
    type: item.test_type,
    status: item.status,
    grade: item.grade || undefined,
    scorePercentage: getScorePercentage(item.score, item.max_score),
  }));

  return JSON.stringify({
    asOf: new Date().toISOString(),
    classes: classes.map((item) => ({
      name: item.name.slice(0, 100),
      gradePercentage: getClassGradePercentage(item.grade, item.grade_data),
    })),
    homework,
    tests,
  });
}
