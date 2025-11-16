import { createClient } from './supabase/server';
import { getGoogleClassroomCourses, getAllGoogleClassroomCourseWork } from './services/GoogleClassroomService';
import { Database } from '@/types/database.types';
import { transformGoogleClassroomData } from './google-classroom-transformer';
import { Class, Homework, Test, Priority, HomeworkLink, TestType, TestStatus, LucideIconName } from '@/context/ClassContext';

function transformSupabaseData(
    classesData: any[],
    homeworksData: any[],
    testsData: any[]
): { classes: Class[], homeworks: Homework[], tests: Test[] } {
    const transformedClasses = classesData.map(c => ({...c, icon: c.icon as LucideIconName})) as Class[];

    const transformedHomeworks = homeworksData.map(hw => {
        let links: HomeworkLink[] = [];
        if (hw.links) {
            try {
                links = typeof hw.links === 'string' ? JSON.parse(hw.links) : hw.links;
                if (!Array.isArray(links)) links = [];
            } catch (e) {
                console.error('Error parsing links:', e);
                links = [];
            }
        }

        return {
        ...hw,
        links: links,
        priority: (hw.priority as Priority) || 'medium',
        dueDate: hw.due_date,
        classId: hw.class_id,
        pinned: hw.pinned || false,
        completed: hw.completed || false
        };
    });

    const transformedTests = testsData.map(test => ({
        ...test,
        classId: test.class_id,
        testDate: test.test_date,
        testTime: test.test_time,
        testType: test.test_type as TestType,
        maxScore: test.max_score,
        studyMaterials: test.study_materials || [],
        weight: test.weight,
        location: test.location,
        duration: test.duration,
        priority: (test.priority as Priority) || 'medium',
        status: test.status as TestStatus,
        score: test.score,
        grade: test.grade,
        notes: test.notes
    }));

    return { classes: transformedClasses, homeworks: transformedHomeworks, tests: transformedTests };
}


async function getSupabaseData(supabase: any, userId: string) {
    const [classesResult, homeworksResult, testsResult] = await Promise.all([
        supabase.from('classes').select('*').eq('user_id', userId),
        supabase.from('homework').select('*, classes(*)').eq('user_id', userId),
        supabase.from('tests').select('*, classes(*)').eq('user_id', userId)
    ]);

    if (classesResult.error) throw classesResult.error;
    if (homeworksResult.error) throw homeworksResult.error;
    if (testsResult.error) throw testsResult.error;

    return transformSupabaseData(classesResult.data, homeworksResult.data, testsResult.data);
}

async function getGoogleClassroomData(userId: string) {
    const [courses, allCourseWork] = await Promise.all([
        getGoogleClassroomCourses(),
        getAllGoogleClassroomCourseWork()
    ]);

    const { classes, homeworks } = transformGoogleClassroomData(courses, allCourseWork, userId);
    return { classes, homeworks, tests: [] };
}

export async function getDashboardData() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return { user: null, classes: [], homeworks: [], tests: [] };
    }

    const user = session.user;
    const isGoogleUser = user.app_metadata?.provider === 'google';

    let data;
    if (isGoogleUser) {
        data = await getGoogleClassroomData(user.id);
    } else {
        data = await getSupabaseData(supabase, user.id);
    }

    return { user, ...data };
}