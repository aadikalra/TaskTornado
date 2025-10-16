/**
 * Generate a consistent color based on an ID string
 * @param id - The ID to generate a color for
 * @param isText - If true, returns a darker variant suitable for text
 * @returns An HSL color string
 */
export function getClassColor(id: string, isText = false): string {
  // Simple hash function to generate a consistent color for each class ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate a pastel color using HSL
  const hue = Math.abs(hash) % 360;
  const saturation = 80; // High saturation for pastel
  const lightness = isText ? 40 : 90; // Darker for text, lighter for background
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
