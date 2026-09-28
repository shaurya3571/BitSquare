export const DEFAULT_QR_SETTINGS = {
  size: 240,
  foreground: '#111827',
  background: '#ffffff',
  errorCorrection: 'M',
  margin: 2,
};

export function buildQrOptions(settings) {
  return {
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
  };
}
