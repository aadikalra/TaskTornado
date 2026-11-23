import { PLANNER_LINKS, type PlannerPageId } from './planner-links';

type RelatedLink = { href: string; label: string };

type PlannerContent = {
    title: string;
    description: string;
    heading: string;
    intro: string;
    stepsHeading: string;
    steps: { heading: string; detail: string }[];
    example: {
        heading: string;
        intro: string;
        rows: { label: string; detail: string }[];
        image: { src: string; alt: string };
    };
    related: RelatedLink[];
};

export const PLANNER_PAGES: Record<PlannerPageId, PlannerContent> = {
    student: {
        title: 'Free Student Planner for Classes, Homework & Exams',
        description: 'Organize classes, homework, and exams in one free online student planner. See upcoming deadlines and get help making a study plan.',
        heading: 'A student planner for your whole school week',
        intro: 'See what’s due, what’s coming up, and what to work on next. TaskTornado brings your classes, assignments, tests, and study tools together in one free web app.',
        stepsHeading: 'Plan your week in one place',
        steps: [
            { heading: 'Set up your classes', detail: 'Create a class for each subject. Keep its assignments and test dates together so you can review the whole week or focus on one course.' },
            { heading: 'Add work when you get it', detail: 'Record the assignment, its due date, and its priority. For a bigger project, add subtasks for the pieces you need to finish.' },
            { heading: 'Plan around deadlines', detail: 'Review your calendar and identify what needs an early start. Use flashcards for recall practice, a timer for focused work, or Aurora for a study plan.' },
        ],
        example: {
            heading: 'A week with an essay, a lab, and a quiz',
            intro: 'Start with due dates in the calendar, then pick a first step for the work that will take more than one session.',
            image: { src: '/recording/dashboard-source.png', alt: 'TaskTornado dashboard showing color-coded classes and assignment due dates' },
            rows: [
                { label: 'English · Thursday', detail: 'Essay draft. Outline on Monday, write a rough draft on Tuesday, and revise on Wednesday.' },
                { label: 'Biology · Friday', detail: 'Lab report. Add subtasks for the data table, results, and discussion.' },
                { label: 'Algebra · Friday', detail: 'Unit quiz. Set aside two short practice sessions before the quiz.' },
            ],
        },
        related: [PLANNER_LINKS.homework, PLANNER_LINKS.assignments, PLANNER_LINKS.schedule, PLANNER_LINKS.ai, { href: '/tutorials/onboarding', label: 'Getting Started Guide' }],
    },
    homework: {
        title: 'Free Homework Planner App for Students',
        description: 'Plan homework across classes, break projects into subtasks, and set up recurring assignments with TaskTornado’s free homework planner.',
        heading: 'A homework planner for nights with more than one deadline',
        intro: 'Keep each assignment with its class, due date, and priority. Turn long projects into specific steps and set up recurring homework once for work you do every week.',
        stepsHeading: 'Make a homework plan you can follow',
        steps: [
            { heading: 'Capture the next assignment', detail: 'Record the title and class when it’s assigned. Add the actual due date and enough detail to remember what you need to turn in.' },
            { heading: 'Break down long work', detail: 'Add subtasks to keep research, drafting, and revision visible under the same assignment. Give yourself a first step you can finish in one session.' },
            { heading: 'Repeat routine assignments', detail: 'Use recurring homework for a weekly reading log or a regular practice set. Save priority markers for tasks that actually need attention early.' },
        ],
        example: {
            heading: 'When the same week has three deadlines',
            intro: 'A sample plan for a Wednesday reading log, a Thursday problem set, and a Friday presentation.',
            image: { src: '/progressCard.png', alt: '' },
            rows: [
                { label: 'Monday', detail: 'Set the reading log to recur. Gather the presentation sources and create a slide outline.' },
                { label: 'Tuesday', detail: 'Finish the reading log. Start the problem set and mark any questions you need help with.' },
                { label: 'Wednesday and Thursday', detail: 'Turn in the log and problem set on time, then finish the slides and rehearse before Friday.' },
            ],
        },
        related: [PLANNER_LINKS.student, PLANNER_LINKS.assignments, { href: '/tutorials/recurring-homeworks', label: 'Set Up Recurring Homework' }],
    },
    assignments: {
        title: 'Free Assignment Tracker for Students',
        description: 'Track school assignments by class, due date, and priority. Use completion checkboxes and subtasks to see what still needs work.',
        heading: 'An assignment tracker that shows what’s still open',
        intro: 'Keep a clear list of the work you owe for each class. Give assignments due dates and priorities, pin what you want to keep in view, and mark work complete as you finish it.',
        stepsHeading: 'See what’s due and what’s done',
        steps: [
            { heading: 'Give each item a useful name', detail: 'Use a deliverable such as “Submit lab worksheet” instead of “Biology.” Assign the class so you can find it later.' },
            { heading: 'Review due dates and priorities', detail: 'Use the due date to see what’s time-sensitive and the priority to flag effort or importance. An essay due Friday may need a start before a quick task due Thursday.' },
            { heading: 'Track completion at the right level', detail: 'Check off research or drafting inside the assignment. Mark the full assignment complete after the final step, including submission.' },
        ],
        example: {
            heading: 'Triage a short assignment list',
            intro: 'A quick review can show both the next deadline and which projects need a head start.',
            image: { src: '/progressCard.png', alt: '' },
            rows: [
                { label: 'Due today', detail: 'Geometry problems 12–24. Finish the remaining questions, then submit the set.' },
                { label: 'Due Thursday · High priority', detail: 'History source analysis. Pin the assignment and start outlining after geometry.' },
                { label: 'Due Friday · Draft finished', detail: 'Chemistry lab report. Keep it open until you check the calculations and submit it.' },
            ],
        },
        related: [PLANNER_LINKS.homework, PLANNER_LINKS.schedule, { href: '/tutorials/starring-homeworks', label: 'Pin Important Assignments' }],
    },
    ai: {
        title: 'AI Study Planner for Homework and Exams',
        description: 'Use Aurora in TaskTornado to split homework and test prep into study sessions around your available time and upcoming deadlines.',
        heading: 'Make a study plan with Aurora AI',
        intro: 'Tell Aurora what you’re studying and how much time you have. It can suggest what to start with, break an exam into review sessions, and use relevant assignments or tests from your planner to help prioritize.',
        stepsHeading: 'Build a study plan with Aurora',
        steps: [
            { heading: 'Start with a real constraint', detail: 'Give Aurora a goal, the time you have, and the topic you’re least confident about. Ask for a short schedule you can actually follow.' },
            { heading: 'Turn the plan into practice', detail: 'Ask for hints, a concept explanation, or practice questions. You can follow up to shorten or rearrange the plan as your week changes.' },
            { heading: 'Check the plan against your week', detail: 'Review every deadline and use your calendar to decide when to do each session. Aurora can help you plan the work and practice the material.' },
        ],
        example: {
            heading: 'Example prompt and study plan',
            intro: '“I have a biology quiz Friday, a history outline due Thursday, and 45 minutes tonight. I’m stuck on cell division. What should I do first?”',
            image: { src: '/aiCard.png', alt: '' },
            rows: [
                { label: '15 minutes', detail: 'Draft the history outline and list the evidence you need so Thursday’s assignment has a clear next step.' },
                { label: '20 minutes', detail: 'Draw the stages of mitosis from memory, then compare the drawing with your class notes.' },
                { label: '10 minutes', detail: 'Answer three practice questions without looking, and note the stages to review tomorrow.' },
            ],
        },
        related: [PLANNER_LINKS.student, { href: '/pricing', label: 'Free AI Allowances' }, { href: '/legal/privacy', label: 'How TaskTornado Handles AI Data' }],
    },
    schedule: {
        title: 'Class Schedule Planner for School Deadlines & Exams',
        description: 'Plan around classes, due dates, and exams with TaskTornado’s student calendar. See your school commitments across subjects.',
        heading: 'Plan your class schedule around real deadlines',
        intro: 'See assignments, tests, and events in one school calendar. Group work by subject, look ahead for crowded weeks, and choose when to start studying before deadlines stack up.',
        stepsHeading: 'Put classes and deadlines on one calendar',
        steps: [
            { heading: 'Create a class for each subject', detail: 'Keep each subject’s coursework together and use class colors to make your schedule easier to scan.' },
            { heading: 'Put assessments on the calendar early', detail: 'Add test dates and assignment deadlines as you learn them. Open an item to review what’s due and what you need to prepare.' },
            { heading: 'Check for collisions', detail: 'Look ahead at the full week. When several subjects have deadlines close together, choose which project to start early and which shorter tasks can wait.' },
        ],
        example: {
            heading: 'A crowded Thursday',
            intro: 'An English essay and a chemistry test on the same day need different preparation.',
            image: { src: '/calendarCard.png', alt: '' },
            rows: [
                { label: 'Monday', detail: 'Outline the essay while you have a longer stretch of time.' },
                { label: 'Tuesday', detail: 'Draft the essay and do one short chemistry problem set.' },
                { label: 'Wednesday', detail: 'Proofread the essay, then use the remaining time to practice the chemistry questions you missed.' },
            ],
        },
        related: [PLANNER_LINKS.student, PLANNER_LINKS.assignments, { href: '/blog/smart-calendar', label: 'Inside the TaskTornado Calendar' }, { href: '/tutorials/test-details', label: 'Track Tests and Study Materials' }],
    },
};
