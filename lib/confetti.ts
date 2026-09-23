import confetti from 'canvas-confetti';

/**
 * Triggers celebratory completion confetti with color variations matching the class color,
 * exactly like the main dashboard PlayfulHomeworkList.
 */
export function triggerCompletionConfetti(baseColor?: string) {
  const fallbackColors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669'];

  if (!baseColor || typeof baseColor !== 'string') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: fallbackColors,
    });
    return;
  }

  // Convert hex to RGB safely
  let hex = baseColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  } else if (hex.length < 6) {
    hex = hex.padEnd(6, '0');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: fallbackColors,
    });
    return;
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const rgbToHex = (red: number, green: number, blue: number) => {
    const rHex = clamp(red).toString(16).padStart(2, '0');
    const gHex = clamp(green).toString(16).padStart(2, '0');
    const bHex = clamp(blue).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  };

  const colorVariations = [
    baseColor,
    rgbToHex(r + 30, g + 30, b + 30),
    rgbToHex(r + 50, g + 50, b + 50),
    rgbToHex(r - 35, g - 35, b - 35),
    rgbToHex(r - 60, g - 60, b - 60),
  ];

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: colorVariations,
  });
}
