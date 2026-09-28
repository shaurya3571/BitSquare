import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { buildQrPayload, INITIAL_QR_DATA, QR_TYPES } from './utils/qrPayload.js';
import { buildQrOptions, DEFAULT_QR_SETTINGS } from './utils/qrOptions.js';
import './App.css';

function App() {
  const [contentType, setContentType] = useState('url');
  const [qrData, setQrData] = useState(INITIAL_QR_DATA);
  const [settings, setSettings] = useState(DEFAULT_QR_SETTINGS);
  const [qrResult, setQrResult] = useState(null);
  const [qrError, setQrError] = useState(null);
  const payload = buildQrPayload(contentType, qrData[contentType]);
  const qrOptions = useMemo(() => buildQrOptions(settings), [settings]);
  const settingsKey = JSON.stringify(qrOptions);
  const selectedType = QR_TYPES.find(({ id }) => id === contentType);

  useEffect(() => {
    let active = true;

    if (!payload) {
      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(payload, qrOptions)
      .then((image) => {
        if (!active) return;
        setQrResult({ payload, settingsKey, image });
        setQrError(null);
      })
      .catch(() => {
        if (!active) return;
        setQrResult(null);
        setQrError({ payload, settingsKey, message: 'This content could not be encoded with the selected settings.' });
      });

    return () => {
      active = false;
    };
  }, [payload, qrOptions, settingsKey]);

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setQrData((current) => ({
      ...current,
      [contentType]: { ...current[contentType], [name]: nextValue },
    }));
  };

  const updateSetting = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'size' || name === 'margin' ? Number(value) : value;
    setSettings((current) => ({ ...current, [name]: nextValue }));
  };

  const renderFields = () => {
    switch (contentType) {
      case 'url':
        return (
          <>
            <label className="field-label" htmlFor="qr-url">Website address</label>
            <div className="url-input-wrap">
              <input id="qr-url" name="url" type="url" value={qrData.url.url} onChange={updateField} placeholder="https://yourwebsite.com" autoComplete="url" spellCheck="false" />
            </div>
            <div className="input-meta"><span>Enter the page you want people to visit.</span></div>
            {qrData.url.url.trim() && !/^https?:\/\//i.test(qrData.url.url.trim()) && (
              <p className="inline-hint">We’ll add https:// when encoding this address.</p>
            )}
          </>
        );
      case 'text':
        return (
          <>
            <label className="field-label" htmlFor="qr-text">Your text</label>
            <textarea id="qr-text" name="text" value={qrData.text.text} onChange={updateField} placeholder="Type a message to encode in your QR code..." rows={4} maxLength={1800} />
            <div className="input-meta"><span>Keep it short for a simpler, faster scan.</span><span>{qrData.text.text.length} / 1800</span></div>
          </>
        );
      case 'email':
        return (
          <>
            <label className="field-label" htmlFor="qr-email">Email address</label>
            <input className="text-input" id="qr-email" name="address" type="email" value={qrData.email.address} onChange={updateField} placeholder="hello@example.com" autoComplete="email" />
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="qr-email-subject">Subject <span>(optional)</span></label>
                <input className="text-input" id="qr-email-subject" name="subject" value={qrData.email.subject} onChange={updateField} placeholder="What’s this about?" />
              </div>
            </div>
            <label className="field-label spaced-label" htmlFor="qr-email-message">Message <span>(optional)</span></label>
            <textarea id="qr-email-message" name="message" value={qrData.email.message} onChange={updateField} placeholder="Add a message..." rows={3} />
            <div className="input-meta"><span>Opens a pre-filled email in the scanner’s mail app.</span></div>
          </>
        );
      case 'phone':
        return (
          <>
            <label className="field-label" htmlFor="qr-phone">Phone number</label>
            <input className="text-input" id="qr-phone" name="number" type="tel" value={qrData.phone.number} onChange={updateField} placeholder="+1 555 123 4567" autoComplete="tel" />
            <div className="input-meta"><span>Include your country code for international callers.</span></div>
          </>
        );
      case 'wifi':
        return (
          <>
            <label className="field-label" htmlFor="qr-wifi-ssid">Network name (SSID)</label>
            <input className="text-input" id="qr-wifi-ssid" name="ssid" value={qrData.wifi.ssid} onChange={updateField} placeholder="Your Wi-Fi network" autoComplete="off" />
            <div className="field-row wifi-fields">
              <div className="field-group">
                <label className="field-label" htmlFor="qr-wifi-security">Security</label>
                <select className="text-input" id="qr-wifi-security" name="security" value={qrData.wifi.security} onChange={updateField}>
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open network</option>
                </select>
              </div>
              {qrData.wifi.security !== 'nopass' && (
                <div className="field-group">
                  <label className="field-label" htmlFor="qr-wifi-password">Password</label>
                  <input className="text-input" id="qr-wifi-password" name="password" type="password" value={qrData.wifi.password} onChange={updateField} placeholder="Network password" autoComplete="new-password" />
                </div>
              )}
            </div>
            <label className="checkbox-field" htmlFor="qr-wifi-hidden">
              <input id="qr-wifi-hidden" name="hidden" type="checkbox" checked={qrData.wifi.hidden} onChange={updateField} />
              <span>Hidden network</span>
            </label>
            <div className="input-meta"><span>Wi-Fi details stay on this device.</span></div>
          </>
        );
      default:
        return null;
    }
  };

  const showCurrentQr = qrResult?.payload === payload && qrResult.settingsKey === settingsKey;
  const currentError = qrError?.payload === payload && qrError.settingsKey === settingsKey ? qrError.message : '';

  return (
    <div className="app">
      <header className="header">
        <a className="logo" href="#create" aria-label="QRForge home"><span className="logo-mark">Q</span><span>QRForge</span></a>
        <nav className="nav" aria-label="Main navigation"><a href="#create">Create</a><a href="#recent">My QR Codes</a><a href="#templates">Templates</a></nav>
        <div className="header-status"><span className="status"><span className="status-dot" />Ready to create</span><span className="profile"><span className="avatar">Q</span>Browser-based</span></div>
      </header>

      <main>
        <section className="hero" id="create">
          <span className="badge">✦ CREATE YOUR QR</span>
          <h1>Make a QR code<span>your way.</span></h1>
          <p>Generate, customize and download beautiful QR codes<br />without complicated tools.</p>
          <a className="primary-button" href="#qr-content">Start Creating <span aria-hidden="true">→</span></a>
        </section>

        <section className="foundation" id="qr-content" aria-labelledby="content-heading">
          <div className="section-title"><span>01</span><strong>QR Content</strong></div>
          <div className="cards">
            <section className="card input-card">
              <div className="card-heading">
                <div><p className="eyebrow">GET STARTED</p><h2 id="content-heading">What should your QR contain?</h2></div>
                <span className="step-count">1 / 2</span>
              </div>

              <div className="type-switch" role="group" aria-label="QR content type">
                {QR_TYPES.map(({ id, label, icon }) => (
                  <button key={id} className={contentType === id ? 'type-button active' : 'type-button'} type="button" onClick={() => setContentType(id)} aria-pressed={contentType === id}>
                    <span aria-hidden="true">{icon}</span>{label}
                  </button>
                ))}
              </div>

              <div className={`qr-fields qr-fields-${contentType}`} key={contentType}>{renderFields()}</div>
              <div className="next-step-note"><span className="note-icon" aria-hidden="true">✦</span><span><strong>Looking good?</strong> Your code updates as you type. Fine-tune its appearance below.</span></div>
            </section>

            <section className="card preview" aria-live="polite" aria-labelledby="preview-heading">
              <div className="preview-topline"><span className="live-indicator"><i />LIVE PREVIEW</span><span className="preview-size">{settings.size} × {settings.size}</span></div>
              <div className="preview-title-row"><h2 id="preview-heading">Your QR code</h2><span className="preview-type">{selectedType.preview}</span></div>
              <div className="qr-stage">
                {showCurrentQr ? <img className="qr-image" src={qrResult.image} alt={`QR code for ${selectedType.label.toLowerCase()}`} /> : <div className="qr-empty"><span aria-hidden="true">▦</span><p>{currentError ? 'Could not generate this code' : 'Enter content to see your QR code'}</p></div>}
              </div>
              {currentError ? <p className="preview-message" role="status">{currentError}</p> : payload ? <p className="preview-caption">Scan to preview your content</p> : <p className="preview-caption">Add the required details to get started</p>}
              <div className="preview-footer"><span className="secure-icon" aria-hidden="true">⌑</span><span>Generated securely on your device. Privacy is protected.</span><span className="device-dot" /></div>
            </section>
          </div>

          <section className="card customizer" aria-labelledby="customizer-heading">
            <div className="customizer-heading">
              <div><p className="eyebrow">02 · APPEARANCE</p><h2 id="customizer-heading">Make it yours</h2><p className="customizer-description">Customize your QR code.</p></div>
              <button className="reset-button" type="button" onClick={() => setSettings(DEFAULT_QR_SETTINGS)} disabled={settingsKey === JSON.stringify(buildQrOptions(DEFAULT_QR_SETTINGS))}>Reset</button>
            </div>

            <div className="customizer-grid">
              <div className="setting-control setting-range setting-size">
                <div className="setting-label-row"><label className="field-label" htmlFor="qr-size">Size</label><output htmlFor="qr-size">{settings.size} px</output></div>
                <input id="qr-size" name="size" type="range" min="128" max="512" step="16" value={settings.size} onChange={updateSetting} />
                <div className="range-limits"><span>128 px</span><span>512 px</span></div>
              </div>

              <section className="setting-control colors-setting" aria-labelledby="colors-heading">
                <h3 id="colors-heading" className="field-label">Colors</h3>
                <div className="color-pair">
                  <label className="color-setting" htmlFor="qr-foreground">
                    <span>Foreground</span>
                    <span className="color-input-wrap"><input id="qr-foreground" name="foreground" type="color" value={settings.foreground} onChange={updateSetting} /><span>{settings.foreground.toUpperCase()}</span></span>
                  </label>
                  <label className="color-setting" htmlFor="qr-background">
                    <span>Background</span>
                    <span className="color-input-wrap"><input id="qr-background" name="background" type="color" value={settings.background} onChange={updateSetting} /><span>{settings.background.toUpperCase()}</span></span>
                  </label>
                </div>
              </section>

            </div>

            <details className="advanced-settings">
              <summary>Advanced settings</summary>
              <div className="advanced-content">
                <label className="setting-control" htmlFor="qr-error-correction">
                  <span className="field-label">Scan reliability</span>
                  <select className="text-input" id="qr-error-correction" name="errorCorrection" value={settings.errorCorrection} onChange={updateSetting}>
                    <option value="L">Low — Smaller QR, less damage protection</option>
                    <option value="M">Standard — Recommended for most uses</option>
                    <option value="Q">High — Better if the QR may get damaged</option>
                    <option value="H">Maximum — Best for logos and print</option>
                  </select>
                  <span className="setting-help">Standard uses the QR specification’s M error-correction level.</span>
                </label>
                <label className="setting-control" htmlFor="qr-margin">
                  <span className="field-label">Quiet zone</span>
                  <select className="text-input" id="qr-margin" name="margin" value={settings.margin} onChange={updateSetting}>
                    <option value="2">2 modules — Default</option>
                    <option value="4">4 modules — Recommended</option>
                    <option value="6">6 modules</option>
                    <option value="8">8 modules</option>
                  </select>
                  <span className="setting-help">Keeps a clear border around the code for reliable scanning.</span>
                </label>
              </div>
            </details>
          </section>
        </section>
      </main>

      <footer className="footer"><span>QRForge</span><span>Build it. Scan it. Share it.</span></footer>
    </div>
  );
}

export default App;
