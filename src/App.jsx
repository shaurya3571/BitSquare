import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import './App.css';

function App() {
  const [contentType, setContentType] = useState('url');
  const [value, setValue] = useState('https://qrforge.app');
  const [qrImage, setQrImage] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    let active = true;

    const trimmedValue = value.trim();

    if (!trimmedValue || trimmedValue === 'https://') {
      setQrImage('');
      setQrError('');

      return () => {
        active = false;
      };
    }

    let qrValue = trimmedValue;

    if (
      contentType === 'url' &&
      !/^https?:\/\//i.test(qrValue)
    ) {
      qrValue = 'https://' + qrValue;
    }

    QRCode.toDataURL(qrValue, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((image) => {
        if (!active) return;

        setQrImage(image);
        setQrError('');
      })
      .catch(() => {
        if (!active) return;

        setQrImage('');
        setQrError(
          'This content is too long to encode as a QR code.'
        );
      });

    return () => {
      active = false;
    };
  }, [value, contentType]);

  const handleTypeChange = (type) => {
    setContentType(type);
    setQrError('');
    setQrImage('');

    if (type === 'url') {
      setValue('https://');
    } else {
      setValue('');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <a
          className="logo"
          href="#create"
          aria-label="QRForge home"
        >
          <span className="logo-mark">Q</span>
          <span>QRForge</span>
        </a>

        <nav className="nav" aria-label="Main navigation">
          <a href="#create">Create</a>
          <a href="#recent">My QR Codes</a>
          <a href="#templates">Templates</a>
        </nav>

        <div className="header-status">
          <span className="status">
            <span className="status-dot" />
            Ready to create
          </span>

          <span className="profile">
            <span className="avatar">Q</span>
            Browser-based
          </span>
        </div>
      </header>

      <main>
        <section className="hero" id="create">
          <span className="badge">✦ CREATE YOUR QR</span>

          <h1>
            Make a QR code
            <span>your way.</span>
          </h1>

          <p>
            Generate, customize and download beautiful QR codes
            <br />
            without complicated tools.
          </p>

          <a className="primary-button" href="#qr-content">
            Start Creating <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          className="foundation"
          id="qr-content"
          aria-labelledby="content-heading"
        >
          <div className="section-title">
            <span>01</span>
            <strong>QR Content</strong>
          </div>

          <div className="cards">
            <section className="card input-card">
              <div className="card-heading">
                <div>
                  <p className="eyebrow">GET STARTED</p>

                  <h2 id="content-heading">
                    What should your QR contain?
                  </h2>
                </div>

                <span className="step-count">1 / 2</span>
              </div>

              <div
                className="type-switch"
                role="group"
                aria-label="QR content type"
              >
                <button
                  className={
                    contentType === 'url'
                      ? 'type-button active'
                      : 'type-button'
                  }
                  type="button"
                  onClick={() => handleTypeChange('url')}
                  aria-pressed={contentType === 'url'}
                >
                  <span aria-hidden="true">↗</span>
                  Website URL
                </button>

                <button
                  className={
                    contentType === 'text'
                      ? 'type-button active'
                      : 'type-button'
                  }
                  type="button"
                  onClick={() => handleTypeChange('text')}
                  aria-pressed={contentType === 'text'}
                >
                  <span aria-hidden="true">T</span>
                  Plain text
                </button>
              </div>

              <label
                className="field-label"
                htmlFor="qr-value"
              >
                {contentType === 'url'
                  ? 'Website address'
                  : 'Your text'}
              </label>

              {contentType === 'url' ? (
                <div className="url-input-wrap">
                  <input
                    id="qr-value"
                    type="text"
                    value={value}
                    onChange={(event) =>
                      setValue(event.target.value)
                    }
                    placeholder="https://yourwebsite.com"
                    autoComplete="url"
                    spellCheck="false"
                  />
                </div>
              ) : (
                <textarea
                  id="qr-value"
                  value={value}
                  onChange={(event) =>
                    setValue(event.target.value)
                  }
                  placeholder="Type a message to encode in your QR code..."
                  rows={4}
                  maxLength={1800}
                />
              )}

              <div className="input-meta">
                <span>
                  {contentType === 'url'
                    ? 'Enter the page you want people to visit.'
                    : 'Keep it short for a simpler, faster scan.'}
                </span>

                {contentType === 'text' && (
                  <span>{value.length} / 1800</span>
                )}
              </div>

              {contentType === 'url' &&
                value.trim() &&
                value.trim() !== 'https://' &&
                !/^https?:\/\//i.test(value.trim()) && (
                  <p className="inline-hint">
                    We&apos;ll add https:// when encoding this
                    address.
                  </p>
                )}
            </section>

            <section
              className="card preview"
              aria-live="polite"
              aria-labelledby="preview-heading"
            >
              <div className="preview-topline">
                <span className="live-indicator">
                  <i />
                  LIVE PREVIEW
                </span>

                <span className="preview-size">
                  240 × 240
                </span>
              </div>

              <div className="preview-title-row">
                <h2 id="preview-heading">Your QR code</h2>

                <span className="preview-type">
                  {contentType === 'url' ? 'WEBSITE' : 'TEXT'}
                </span>
              </div>

              <div className="qr-stage">
                {qrImage ? (
                  <img
                    className="qr-image"
                    src={qrImage}
                    alt="Generated QR code"
                  />
                ) : (
                  <div className="qr-empty">
                    <span aria-hidden="true">▦</span>

                    <p>
                      Enter content to see
                      <br />
                      your QR code
                    </p>
                  </div>
                )}
              </div>

              {qrError ? (
                <p
                  className="preview-message"
                  role="status"
                >
                  {qrError}
                </p>
              ) : value.trim() &&
                value.trim() !== 'https://' ? (
                <p className="preview-caption">
                  Scan to preview your content
                </p>
              ) : (
                <p className="preview-caption">
                  Add content to get started
                </p>
              )}

              <div className="preview-footer">
                <span
                  className="secure-icon"
                  aria-hidden="true"
                >
                  ⌑
                </span>

                <span>
                  Generated securely on your device. Privacy is
                  protected.
                </span>

                <span className="device-dot" />
              </div>
            </section>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>QRForge</span>
        <span>Build it. Scan it. Share it.</span>
      </footer>
    </div>
  );
}

export default App;