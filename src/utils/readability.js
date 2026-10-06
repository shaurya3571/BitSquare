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
export const getReadabilityWarnings = (
  foreground,
  background,
  margin
) => {
  const warnings = [];
  const contrastRatio = getContrastRatio(foreground, background);

  if (contrastRatio < 4.5) {
    warnings.push(
      'Foreground and background colors have low contrast and may be difficult to scan.'
    );
  }

  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  if (foregroundLuminance > 0.7) {
    warnings.push(
      'The foreground color is very light and may reduce QR readability.'
    );
  }

  if (backgroundLuminance < 0.15) {
    warnings.push(
      'The background is very dark. A light background is generally more reliable for scanning.'
    );
  }

  if (margin < 4) {
    warnings.push(
      'A small QR margin may reduce scanning reliability. Consider using at least 4 modules.'
    );
  }

  return {
    contrastRatio,
    warnings,
    hasWarnings: warnings.length > 0,
  };
};