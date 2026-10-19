const dashboardIconColors = ['#DC2626', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0D9488', '#475569'];
const darkDashboardIconColors = ['#F87171', '#60A5FA', '#FBBF24', '#34D399', '#C084FC', '#F472B6', '#2DD4BF', '#CBD5E1'];
const newHomeFallbackColors = ['#0284c7', '#7c3aed', '#d97706', '#16a34a', '#db2777', '#ea580c', '#4f46e5', '#0d9488'];

export function getDashboardClassIconColor(index: number, isDark: boolean): string {
  const colors = isDark ? darkDashboardIconColors : dashboardIconColors;
  return colors[index % colors.length];
}

export function getNewHomeClassColor(classItem: { color?: string | null }, index: number): string {
  return classItem.color || newHomeFallbackColors[index % newHomeFallbackColors.length];
}
