const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^\+?[0-9\s().-]{7,20}$/;

const URL_PATTERN =
  /^https?:\/\/([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export function validateUrl(value) {
  const url = value.trim();

  if (!url) {
    return 'Please enter a website address.';
  }

  if (!URL_PATTERN.test(url)) {
    return 'Please enter a valid website URL, such as https://example.com.';
  }

  try {
    const parsedUrl = new URL(url);

    if (!parsedUrl.hostname.includes('.')) {
      return 'Please enter a valid website URL, such as https://example.com.';
    }

    return '';
  } catch {
    return 'Please enter a valid website URL, such as https://example.com.';
  }
}

export function validateText(value) {
  if (!value.trim()) {
    return 'Please enter some text.';
  }

  return '';
}

export function validateEmail(data) {
  const address = data.address.trim();

  if (!address) {
    return 'Please enter an email address.';
  }

  if (!EMAIL_PATTERN.test(address)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export function validatePhone(data) {
  const number = data.number.trim();

  if (!number) {
    return 'Please enter a phone number.';
  }

  if (!PHONE_PATTERN.test(number)) {
    return 'Please enter a valid phone number.';
  }

  return '';
}

export function validateWifi(data) {
  const ssid = data.ssid.trim();

  if (!ssid) {
    return 'Please enter the Wi-Fi network name.';
  }

  if (
    data.security !== 'WPA' &&
    data.security !== 'WEP' &&
    data.security !== 'nopass'
  ) {
    return 'Please select a valid Wi-Fi security type.';
  }

  if (
    data.security !== 'nopass' &&
    !data.password
  ) {
    return 'Please enter the Wi-Fi password.';
  }

  return '';
}

export function validateQrData(type, data) {
  switch (type) {
    case 'url':
      return validateUrl(data.url);

    case 'text':
      return validateText(data.text);

    case 'email':
      return validateEmail(data);

    case 'phone':
      return validatePhone(data);

    case 'wifi':
      return validateWifi(data);

    default:
      return 'Please select a valid QR type.';
  }
}

export async function verifyWebsiteDomain(value) {
  const url = value.trim();

  if (!url) {
    return {
      valid: false,
      message: '',
    };
  }

  try {
    const hostname = new URL(url).hostname;

    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(
        hostname,
      )}&type=A`,
      {
        headers: {
          Accept: 'application/dns-json',
        },
      },
    );

    if (!response.ok) {
      return {
        valid: false,
        message:
          'This website address could not be verified.',
      };
    }

    const result = await response.json();

    const hasAddress =
      result.Answer?.some(
        (answer) =>
          answer.type === 1 ||
          answer.type === 5,
      ) ?? false;

    if (!hasAddress) {
      return {
        valid: false,
        message:
          'This website address could not be verified.',
      };
    }

    return {
      valid: true,
      message: '',
    };
  } catch {
    return {
      valid: false,
      message:
        'This website address could not be verified.',
    };
  }
}