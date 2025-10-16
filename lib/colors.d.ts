// Type definitions for colors module
declare module '@/lib/colors' {
  /**
   * Generate a consistent color based on an ID string
   * @param id - The ID to generate a color for
   * @param isText - If true, returns a darker variant suitable for text
   * @returns An HSL color string
   */
  export function getClassColor(id: string, isText?: boolean): string;
}
