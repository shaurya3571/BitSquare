import { DEFAULT_QR_SETTINGS } from './qrOptions.js';

export const QR_PRESETS = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A familiar black-and-white code.',
    settings: { ...DEFAULT_QR_SETTINGS },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'A bright code on a deep navy background.',
    settings: {
      ...DEFAULT_QR_SETTINGS,
      foreground: '#f8fafc',
      background: '#111827',
      errorCorrection: 'Q',
      margin: 4,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A compact, understated starting point.',
    settings: {
      ...DEFAULT_QR_SETTINGS,
      size: 208,
      foreground: '#1f2937',
      margin: 4,
    },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Warm, gentle colors with clear contrast.',
    settings: {
      ...DEFAULT_QR_SETTINGS,
      foreground: '#4c3f72',
      background: '#fff7ed',
      errorCorrection: 'Q',
      margin: 4,
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum clarity for print and distance.',
    settings: {
      ...DEFAULT_QR_SETTINGS,
      foreground: '#000000',
      background: '#ffffff',
      errorCorrection: 'H',
      margin: 4,
    },
  },
];

export function getPresetForSettings(settings) {
  return QR_PRESETS.find((preset) => (
    Object.entries(preset.settings).every(([key, value]) => settings[key] === value)
  ));
}
