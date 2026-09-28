export const QR_TYPES = [
  { id: 'url', label: 'Website URL', icon: '↗', preview: 'WEBSITE' },
  { id: 'text', label: 'Plain text', icon: 'T', preview: 'TEXT' },
  { id: 'email', label: 'Email', icon: '✉', preview: 'EMAIL' },
  { id: 'phone', label: 'Phone', icon: '⌕', preview: 'PHONE' },
  { id: 'wifi', label: 'Wi-Fi', icon: '⌁', preview: 'WI-FI' },
];

export const INITIAL_QR_DATA = {
  url: { url: 'https://qrforge.app' },
  text: { text: '' },
  email: { address: '', subject: '', message: '' },
  phone: { number: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
};

function escapeWifiValue(value) {
  return String(value).replace(/[\\;,:"]/g, '\\$&');
}

function buildEmailPayload({ address = '', subject = '', message = '' }) {
  const email = address.trim();
  if (!email) return '';

  const query = [];
  if (subject.trim()) query.push(`subject=${encodeURIComponent(subject.trim())}`);
  if (message.trim()) query.push(`body=${encodeURIComponent(message.trim())}`);

  return `mailto:${email}${query.length ? `?${query.join('&')}` : ''}`;
}

function buildPhonePayload({ number = '' }) {
  const trimmed = number.trim();
  if (!trimmed) return '';

  const normalized = trimmed.replace(/[\s().-]/g, '');
  return `tel:${normalized}`;
}

function buildWifiPayload({ ssid = '', password = '', security = 'WPA', hidden = false }) {
  const network = ssid.trim();
  if (!network) return '';

  const isOpen = security === 'nopass';
  if (!isOpen && !password) return '';
  const fields = [
    `T:${isOpen ? 'nopass' : security}`,
    `S:${escapeWifiValue(network)}`,
  ];
  if (!isOpen && password) fields.push(`P:${escapeWifiValue(password)}`);
  if (hidden) fields.push('H:true');

  return `WIFI:${fields.join(';')};;`;
}

export function buildQrPayload(type, data = {}) {
  switch (type) {
    case 'url': {
      const url = (data.url || '').trim();
      if (!url || url === 'https://') return '';
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }
    case 'text':
      return (data.text || '').trim() ? data.text : '';
    case 'email':
      return buildEmailPayload(data);
    case 'phone':
      return buildPhonePayload(data);
    case 'wifi':
      return buildWifiPayload(data);
    default:
      return '';
  }
}
