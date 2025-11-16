## Diagnosis
- Client-only data fetch blocks rendering and shows spinner (`app/dashboard/page.tsx:22`).
- Heavy client bundle: Google Classroom service imported into client (`context/ClassContext.tsx:9`) pulls `googleapis` (`lib/services/GoogleClassroomService.ts:3`), plus a very large `MainApp` with many icon imports and animations (`components/MainApp.tsx`).
- Global `ClassProvider` fetches on mount for dashboard (`app/layout.tsx:61` + `context/ClassContext.tsx:166`), so initial content waits 4–5s.

## Goals
- First meaningful content within ~1s.
- Full data visible within ~2s on typical network.
- Avoid bundling server-only libraries into client.

## Phase 1: Server Preload & Hydration
- Convert `app/dashboard/page.tsx` to a server component (remove `use client`).
- Server-fetch initial data concurrently:
  - If Supabase user: use server supabase client to run `getClasses`, `getHomework`, `getTests` parallelized.
  - If Google user: call `getGoogleClassroomCourses` + `getAllGoogleClassroomCourseWork` on server and transform to minimal `Class`/`Homework`.
- Render a lightweight server UI that immediately shows a skeleton dashboard.
- Pass initial data into a client wrapper (`app/dashboard/DashboardClient.tsx`) and update `ClassProvider` to accept `initialClasses`, `initialHomeworks`, `initialTests`; initialize state from props and mark `hasLoaded` so it skips the first client fetch.
- Keep realtime subscriptions, but initialize them after hydration to avoid delaying first paint.

## Phase 2: Bundle & UI Optimization
- Code-split `MainApp` via `next/dynamic` with a small skeleton while it loads.
- Defer animations (`Snowfall`, `ReindeerAnimation`) until idle/after first paint.
- Replace massive icon imports with only the icons actually used (tree-shakeable imports) to reduce JS size.

## Phase 3: Data & Network Efficiency
- Trim Supabase selections to required columns (avoid `classes(*)` joins in list fetches if not used).
- Ensure indexes on `user_id`, `due_date`, `test_date` in Supabase (validation-only here).
- Add a 1–5 minute server cache for Google Classroom results (Next `revalidate` or in-memory per user) to avoid repeated multi-call aggregation.
- Add client boot cache: hydrate from `localStorage` immediately when visiting `/dashboard`, then background-refresh.

## Phase 4: Resilience & UX
- Use Suspense boundaries to stream above-the-fold UI while data hydrates.
- Keep spinner fallback only for truly blocking auth states (`app/dashboard/page.tsx`), not for data.

## Changes (Files)
- `app/dashboard/page.tsx`: make server component, fetch initial data, render skeleton, load `DashboardClient`.
- `app/dashboard/DashboardClient.tsx`: ensure it wraps `ClassProvider` and passes initial props.
- `context/ClassContext.tsx`: add optional `initialClasses`, `initialHomeworks`, `initialTests` props; initialize state from props and skip initial fetch when provided; move any server-only imports out of client.
- `components/MainApp.tsx`: dynamic import and defer animations; reduce icon import set.
- (Optional) `app/api/google/dashboard/route.ts`: server endpoint to aggregate Google data with caching.

## Validation
- Measure time-to-first-content and time-to-data using `performance.mark` around provider initialization and `MainApp` mount.
- Test Google and Supabase user flows; confirm no duplicate fetches and subscriptions attach post-hydration.
- Verify bundle size reductions via Next build output and that `/dashboard` first paint occurs within ~1s on a cold load.

## Rollout
- Implement changes behind safe defaults: provider still fetches when no initial props; dashboard uses new fast path immediately.
- Monitor and iterate on cache windows based on actual latency and freshness needs.