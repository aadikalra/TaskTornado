import { createClient } from '@/lib/supabase/server';
import {
  getClassGradePercentage,
  getScorePercentage,
} from '@/lib/ai/school-percentages';

export async function getBoundedSchoolData(
  userId: string,
  accessToken?: string,
  homeworkSearch?: string
) {
  const supabase = await createClient(accessToken);
  let homeworkQuery = supabase
    .from('homework')
    .select('id,title,description,class_id,due_date,completed,priority')
    .eq('user_id', userId);
  if (homeworkSearch) {
    const literalSearch = homeworkSearch.replace(/[\\%_]/g, '\\$&');
    homeworkQuery = homeworkQuery.ilike('title', `%${literalSearch}%`);
  }
  const [classesResult, homeworkResult, testsResult] = await Promise.all([
    supabase
      .from('classes')
      // Grade fields are optional across existing database versions. Read the
      // bounded rows, then expose only the class projection below to Aurora.
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(12),
    homeworkQuery
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
    for (const [resource, error] of [
      ['classes', classesResult.error], ['homework', homeworkResult.error], ['tests', testsResult.error],
    ] as const) {
      if (error) console.warn('Aurora school-data lookup failed', { resource, code: error.code, message: error.message.slice(0, 200) });
    }
    throw new Error('School data could not be retrieved.');
  }

  const classes = classesResult.data || [];
  const classNames = new Map(classes.map((item) => [item.id, item.name]));
  const homework = (homeworkResult.data || []).map((item) => ({
    id: item.id,
    title: item.title.slice(0, 200),
    description: item.description?.slice(0, 1000) || '',
    classId: item.class_id,
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
      id: item.id,
      name: item.name.slice(0, 100),
      gradePercentage: getClassGradePercentage(item.grade, item.grade_data),
    })),
    homework,
    tests,
  });
}
