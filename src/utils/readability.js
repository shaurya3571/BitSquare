const hexToRgb = (hex) => {
  const value = hex.replace('#', '');

  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;

  const number = parseInt(normalized, 16);

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
};

const getRelativeLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);

  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
};

export const getContrastRatio = (foreground, background) => {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  const lighter = Math.max(
    foregroundLuminance,
    backgroundLuminance
  );

  const darker = Math.min(
    foregroundLuminance,
    backgroundLuminance
  );

  return (lighter + 0.05) / (darker + 0.05);
};