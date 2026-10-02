import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Globe,
  Type,
  Mail,
  Phone,
  Wifi,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  ScanLine,
  X,
  Menu,
  Link,
  RotateCcw,
  AlertTriangle,
  Heart,
} from './icons.jsx';
import {
  validateQrData,
  verifyWebsiteDomain,
} from './utils/validation.js';
import { buildQrPayload, INITIAL_QR_DATA, QR_TYPES } from './utils/qrPayload.js';
import { buildQrOptions, DEFAULT_QR_SETTINGS } from './utils/qrOptions.js';
import { getPresetForSettings, QR_PRESETS } from './utils/presets.js';

import './App.css';

function Logo({ small = false }) {
  return (
    <a
      href="#"
      className={`brand ${small ? "small" : ""}`}
      aria-label="BitSquare home"
    >
      <span className="brand-symbol">
        <i />
        <i />
        <i />
        <i />
      </span>
      bit<span className="brand-light">square</span>
      <span className="brand-dot">.</span>
    </a>
  );
}

function QRImage({ payloadData, config, className = "" }) {
  const [image, setImage] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payloadData || "BitSquare", {
      width: 360,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrection,
      color: { dark: config.foreground, light: config.background },
    })
      .then((url) => {
        if (active) setImage(url);
      })
      .catch(() => setImage(""));
    return () => {
      active = false;
    };
  }, [payloadData, config]);
  
  return image ? (
    <img className={className} src={image} alt="QR code" />
  ) : (
    <div className={`qr-placeholder ${className}`}>
      <ScanLine />
    </div>
  );
}

function ArrowDownDecoration() {
  return <span className="download-format">.PNG</span>;
}

// Removed BitSquareFeatureVisual

function contrast(a, b) {
  const luminance = (s) => {
    const rgb = s
      .match(/[a-f\d]{2}/gi)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function App() {
  const [contentType, setContentType] = useState('url');
  const [qrData, setQrData] = useState(INITIAL_QR_DATA);
  const [settings, setSettings] = useState(DEFAULT_QR_SETTINGS);
  
  const [qrResult, setQrResult] = useState(null);
  const [qrError, setQrError] = useState(null);
  
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainError, setDomainError] = useState('');
  
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [downloading, setDownloading] = useState(false);

  const validationErrorMessage = validateQrData(contentType, qrData[contentType]);
  const isBasicValid = validationErrorMessage === '';

  const payload = isBasicValid ? buildQrPayload(contentType, qrData[contentType]) : '';
  const qrOptions = useMemo(() => buildQrOptions(settings), [settings]);
  const settingsKey = JSON.stringify(qrOptions);
  
  const activePreset = getPresetForSettings(settings);

  // Domain verification effect
  useEffect(() => {
    let active = true;
    if (contentType !== 'url' || !isBasicValid || !qrData.url.url.trim()) {
      setDomainChecking(false);
      setDomainError('');
      return () => { active = false; };
    }

    setDomainChecking(true);
    setDomainError('');

    const timer = setTimeout(async () => {
      const result = await verifyWebsiteDomain(qrData.url.url);
      if (!active) return;
      setDomainChecking(false);
      if (!result.valid) setDomainError(result.message);
      else setDomainError('');
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [contentType, qrData.url.url, isBasicValid]);

  // QR Code generation effect
  useEffect(() => {
    let active = true;

    if (!payload) {
      setQrResult(null);
      setQrError(null);
      return () => { active = false; };
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

  // Toast auto-hide effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const updateField = (name, value) => {
    setQrData((current) => ({
      ...current,
      [contentType]: { ...current[contentType], [name]: value },
    }));
  };

  const updateSetting = (name, value) => {
    setSettings((current) => ({ ...current, [name]: value }));
  };

  const applyPreset = (preset) => {
    setSettings({ ...preset.settings });
  };

  const selectType = (type) => {
    setContentType(type);
  };

  const handleDownload = async () => {
    if (!qrResult?.image) return;
    setDownloading(true);
    
    try {
      // Create a fresh high-quality PNG for download
      const png = await QRCode.toDataURL(payload, {
        ...qrOptions,
        width: settings.size,
      });
      
      const link = document.createElement('a');
      link.href = png;
      link.download = `bitsquare-${contentType}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast("Your QR code is ready.");
    } catch {
      setToast("Unable to download. Try shorter content or a smaller size.");
    } finally {
      setDownloading(false);
    }
  };

  // Warnings
  const poorContrast = contrast(settings.foreground, settings.background) < 4.5;
  const inverted = parseInt(settings.foreground.slice(1), 16) > parseInt(settings.background.slice(1), 16);
  
  const readabilityWarning = poorContrast
    ? "Low contrast. Try a darker foreground for easier scanning."
    : inverted
      ? "Dark backgrounds can be harder to scan. Test before sharing."
      : settings.margin < 4
        ? "A margin of at least 4 modules is recommended for reliable scanning."
        : domainError
          ? domainError
          : "";

  const showCurrentQr = qrResult?.payload === payload && qrResult.settingsKey === settingsKey;

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-up, .animate-fade').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const renderContentFields = () => {
    switch (contentType) {
      case 'url':
        return (
          <>
            <label htmlFor="qr-content">Your website URL</label>
            <div className="content-input">
              <Link size={17} />
              <input
                id="qr-content"
                type="url"
                value={qrData.url.url}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://bitsquare.design"
                maxLength={2000}
                autoComplete="url"
                spellCheck="false"
              />
              {qrData.url.url && (
                <button aria-label="Clear content" onClick={() => updateField('url', "")}>
                  <X size={15} />
                </button>
              )}
            </div>
            <p className="field-hint">Where should your QR code take people?</p>
          </>
        );
      case 'text':
        return (
          <>
            <label htmlFor="qr-content">Your message</label>
            <div className="content-input">
              <textarea
                id="qr-content"
                maxLength={1800}
                value={qrData.text.text}
                onChange={(e) => updateField('text', e.target.value)}
                placeholder="A message worth sharing…"
              />
              {qrData.text.text && (
                <button aria-label="Clear content" onClick={() => updateField('text', "")}>
                  <X size={15} />
                </button>
              )}
            </div>
            <p className="field-hint">A note, a quote, or something lovely. ({qrData.text.text.length} / 1800)</p>
          </>
        );
      case 'email':
        return (
          <>
            <label htmlFor="qr-content">Email address</label>
            <div className="content-input">
              <input
                id="qr-content"
                type="email"
                value={qrData.email.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="hello@example.com"
                maxLength={2000}
                autoComplete="email"
              />
              {qrData.email.address && (
                <button aria-label="Clear content" onClick={() => updateField('address', "")}>
                  <X size={15} />
                </button>
              )}
            </div>
            <p className="field-hint">Open a ready-to-send email with one scan.</p>
            
            <div className="extra-fields">
              <label>
                Subject
                <input
                  value={qrData.email.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="Say hello"
                />
              </label>
              <label>
                Message
                <textarea
                  value={qrData.email.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Your email message"
                />
              </label>
            </div>
          </>
        );
      case 'phone':
        return (
          <>
            <label htmlFor="qr-content">Phone number</label>
            <div className="content-input">
              <input
                id="qr-content"
                type="tel"
                value={qrData.phone.number}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="+1 555 123 4567"
                maxLength={2000}
                autoComplete="tel"
              />
              {qrData.phone.number && (
                <button aria-label="Clear content" onClick={() => updateField('number', "")}>
                  <X size={15} />
                </button>
              )}
            </div>
            <p className="field-hint">Include the country code for easy calling.</p>
          </>
        );
      case 'wifi':
        return (
          <>
            <label htmlFor="qr-content">Network name (SSID)</label>
            <div className="content-input">
              <input
                id="qr-content"
                type="text"
                value={qrData.wifi.ssid}
                onChange={(e) => updateField('ssid', e.target.value)}
                placeholder="Your Wi-Fi network"
                maxLength={2000}
                autoComplete="off"
              />
              {qrData.wifi.ssid && (
                <button aria-label="Clear content" onClick={() => updateField('ssid', "")}>
                  <X size={15} />
                </button>
              )}
            </div>
            <p className="field-hint">Connect your guests without typing a password.</p>
            
            <div className="extra-fields two-columns">
              <label>
                Security
                <select
                  value={qrData.wifi.security}
                  onChange={(e) => updateField('security', e.target.value)}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No password</option>
                </select>
              </label>
              {qrData.wifi.security !== "nopass" && (
                <label>
                  Password
                  <input
                    type="password"
                    value={qrData.wifi.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Network password"
                    autoComplete="new-password"
                  />
                </label>
              )}
            </div>
            <label className="checkbox-field" htmlFor="qr-wifi-hidden">
              <input
                id="qr-wifi-hidden"
                type="checkbox"
                checked={qrData.wifi.hidden}
                onChange={(e) => updateField('hidden', e.target.checked)}
              />
              <span>Hidden network</span>
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Logo />
          <nav className={menu ? "nav-links open" : "nav-links"}>
            <a href="#generator" onClick={() => setMenu(false)}>QR Generator</a>
            <a href="#features" onClick={() => setMenu(false)}>Features</a>
          </nav>
          <a className="nav-cta" href="#generator">
            Let’s make a QR <ArrowUpRight size={16} />
          </a>
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy animate-up" style={{ animationDelay: '0.1s' }}>
              <div className="eyebrow">
                <span className="little-spark"><Sparkles size={13} /></span> SMALL SQUARES. BIG POSSIBILITIES.
              </div>
              <h1>
                Create QR Codes<br />That Look <span className="amazing">Amazing
                  <svg viewBox="0 0 360 18" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 13Q160 -4 355 9" />
                  </svg>
                </span>
                <span className="headline-dot">.</span>
              </h1>
              <p>
                Your links, your style. Turn everyday information into<br className="desktop-break" /> beautiful, scannable QR codes—in just a few clicks.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="#generator">Create QR Code <ArrowUpRight size={18} /></a>
                <a className="button secondary" href="#features">Explore Features <ArrowRight size={17} /></a>
              </div>
              <div className="hero-trust">
                <span><Check size={14} /> Free. Always.</span>
                <span><Check size={14} /> No sign-up</span>
                <span><Check size={14} /> Made to be yours</span>
              </div>
            </div>
            <div className="hero-art animate-fade" style={{ animationDelay: '0.3s' }} aria-label="A beautifully customized QR code">
              <div className="art-circle" />
              <div className="floating-label label-live"><span /> LIVE PREVIEW</div>
              <div className="hero-qr-card">
                <div className="hero-card-top">
                  <span className="mini-logo"><span /><span /><span /><span /></span>
                  <span>Good things start with a scan.</span>
                  <ArrowUpRight size={16} />
                </div>
                <QRImage payloadData="https://bitsquare.design" config={DEFAULT_QR_SETTINGS} className="hero-qr" />
                <div className="hero-card-bottom">
                  A little square.<span>A whole lot of possibility.</span>
                </div>
              </div>
              <div className="floating-label label-types"><ScanLine size={16} /> 5 QR TYPES</div>
              <div className="floating-label label-png"><Download size={15} /> PNG READY <Check size={13} /></div>
              <span className="art-caption">
                go on, give it a scan{" "}
                <svg viewBox="0 0 80 50" aria-hidden="true"><path d="M2 42Q75 58 67 4m-8 9 8-9 8 10" /></svg>
              </span>
              <span className="art-dot dot-one" />
              <span className="art-dot dot-two" />
            </div>
          </div>
          <div className="hero-bottom">
            <span>ONE LITTLE CODE. SO MANY CONNECTIONS.</span>
            <div>
              <Globe size={15} /> Websites <span className="separator">/</span>
              <Type size={15} /> Messages <span className="separator">/</span>
              <Mail size={15} /> Emails <span className="separator">/</span>
              <Phone size={15} /> Calls <span className="separator">/</span>
              <Wifi size={15} /> Wi-Fi
            </div>
          </div>
        </section>

        <section className="generator-section section-wrap animate-up" id="generator">
          <div className="section-heading">
            <div className="eyebrow">THE QR STUDIO</div>
            <h2>A little square. <em>A lot of you.</em></h2>
            <h3>Pick your content, add your personality, and let’s make something scannable.</h3>
          </div>
          <div className="generator-card">
            <div className="configuration">
              <div className="panel-heading">
                <span><SlidersHorizontal size={18} /> Make it yours</span>
                <button
                  className="reset-button"
                  onClick={() => {
                    setSettings(DEFAULT_QR_SETTINGS);
                    setToast("Appearance reset back to default.");
                  }}
                  disabled={settingsKey === JSON.stringify(buildQrOptions(DEFAULT_QR_SETTINGS))}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
              
              <div className="type-tabs" role="tablist" aria-label="QR code type">
                {QR_TYPES.map(({ id, label }) => {
                  let Icon = Globe;
                  if (id === 'text') Icon = Type;
                  if (id === 'email') Icon = Mail;
                  if (id === 'phone') Icon = Phone;
                  if (id === 'wifi') Icon = Wifi;
                  
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={contentType === id}
                      className={contentType === id ? "active" : ""}
                      onClick={() => selectType(id)}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  );
                })}
              </div>
              
              <div className="content-fields">
                {renderContentFields()}
                
                {validationErrorMessage && (
                  <div className="validation-message validation-error" role="alert">
                    <AlertTriangle size={15} />
                    <span>{validationErrorMessage}</span>
                  </div>
                )}
                {domainChecking && (
                  <div className="validation-message validation-checking" role="status">
                    <Sparkles size={15} />
                    <span>Verifying website address...</span>
                  </div>
                )}
              </div>

              <div className="customize-heading">
                <span>THE FINISHING TOUCHES</span>
                <Sparkles size={14} />
              </div>
              
              <div className="settings-grid">
                <label>
                  Foreground color
                  <div className="color-field">
                    <input
                      aria-label="Foreground color"
                      type="color"
                      value={settings.foreground}
                      onChange={(e) => updateSetting("foreground", e.target.value)}
                    />
                    <span>{settings.foreground.toUpperCase()}</span>
                    <ChevronDown size={13} />
                  </div>
                </label>
                <label>
                  Background color
                  <div className="color-field">
                    <input
                      aria-label="Background color"
                      type="color"
                      value={settings.background}
                      onChange={(e) => updateSetting("background", e.target.value)}
                    />
                    <span>{settings.background.toUpperCase()}</span>
                    <ChevronDown size={13} />
                  </div>
                </label>
                <label>
                  Image size
                  <select
                    value={settings.size}
                    onChange={(e) => updateSetting("size", Number(e.target.value))}
                  >
                    <option value={256}>256 × 256 px</option>
                    <option value={512}>512 × 512 px</option>
                    <option value={1024}>1024 × 1024 px</option>
                    <option value={2048}>2048 × 2048 px</option>
                  </select>
                </label>
                <label>
                  Error correction
                  <select
                    value={settings.errorCorrection}
                    onChange={(e) => updateSetting("errorCorrection", e.target.value)}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </label>
              </div>
              
              <div className="margin-field">
                <label htmlFor="margin">
                  Margin <span>A little breathing room</span>
                </label>
                <div>
                  <input
                    id="margin"
                    type="range"
                    min={0}
                    max={10}
                    value={settings.margin}
                    onChange={(e) => updateSetting("margin", Number(e.target.value))}
                  />
                  <output>{settings.margin} modules</output>
                </div>
              </div>
              
              <div className="preset-heading">
                <span>A head start? Try a preset.</span>
                <span>Then make it your own.</span>
              </div>
              <div className="presets">
                {QR_PRESETS.map((preset) => {
                  const isActive = preset.id === activePreset?.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`preset-swatch ${isActive ? "selected" : ""}`}
                        style={{ background: preset.settings.background, color: preset.settings.foreground }}
                      >
                        <span className="swatch-pattern"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
                      </span>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="preview-panel">
              <div className="preview-top">
                <span><span className="status-dot" /> LIVE PREVIEW</span>
                <span>Made by you.</span>
              </div>
              <div className="preview-art">
                <span className="preview-orbit orbit-one" />
                <span className="preview-orbit orbit-two" />
                <div className="qr-preview">
                  {showCurrentQr ? (
                    <img src={qrResult.image} alt="Your live QR code preview" />
                  ) : (
                    <div className="empty-qr">
                      <ScanLine size={48} />
                      <p>
                        {qrError ? "That's a little too much content." : "Your next great QR code starts here."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className={`readability ${readabilityWarning || !isBasicValid ? "warning" : ""}`} role="status">
                {readabilityWarning || !isBasicValid ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
                <span>{readabilityWarning || (!isBasicValid ? "Enter your content above." : "Looking good! Ready to scan.")}</span>
              </div>
              <button
                className="button download-button"
                onClick={handleDownload}
                disabled={!showCurrentQr || downloading}
              >
                {downloading ? <RotateCcw size={18} className="spinner-icon" /> : <Download size={18} />}
                {downloading ? "Preparing your PNG…" : "Download PNG"}
                <ArrowDownDecoration />
              </button>
              <div className="download-details">
                {settings.size} × {settings.size} px <span>·</span> High-quality PNG <span>·</span> All yours
              </div>
              <div className="preview-note">
                <h2>Made to share. Designed to stand out.</h2>
              </div>
            </div>
          </div>
          <div className="privacy-note" fontsize={40}>
            Your content stays in your browser. No uploads, no tracking, just QR codes.
          </div>
        </section>

        <section className="features-section animate-up" id="features">
          <div className="section-wrap">
            <div className="section-heading">
              <div className="eyebrow">THOUGHTFULLY SIMPLE</div>
              <h2>Everything you need.<br /><em>Nothing you don’t.</em></h2>
              <p>A small but mighty toolkit for turning “scan me” into “wow.”</p>
            </div>
            <div className="features-grid">
              {[
                { title: "From idea to QR. Instantly.", text: "No waiting, no complicated steps. Add your content and your code is ready.", number: "01" },
                { title: "Five ways to connect.", text: "Links, messages, emails, calls, and Wi-Fi. One little square, endless possibilities.", number: "02" },
                { title: "Unmistakably yours.", text: "Play with colors, sizes, and presets. Create a QR code that feels like your brand.", number: "03" },
                { title: "See the magic happen.", text: "Every little change, right before your eyes. What you see is what you download.", number: "04" },
                { title: "Pretty. And practical.", text: "Smart contrast checks and error correction help your codes scan beautifully.", number: "05" },
                { title: "Total privacy.", text: "All QR generation runs in your local browser. Your data never touches a server.", number: "06" }
              ].map(({ title, text, number }) => (
                <article className="feature-card animate-up" key={title}>
                  <div className="feature-top">
                    <span>{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="qr-explainer section-wrap animate-up" aria-labelledby="qr-explainer-title">
          <div className="qr-explainer-visual">
            <div className="qr-explainer-card">
              <QRImage payloadData="https://bitsquare.design" config={DEFAULT_QR_SETTINGS} className="qr-explainer-image" />
              <span>One scan. A new connection.</span>
            </div>
            <span className="qr-explainer-label"><ScanLine size={14} aria-hidden="true" /> SCAN & DISCOVER</span>
          </div>
          <div className="qr-explainer-copy">
            <div className="eyebrow">A LITTLE INTRODUCTION</div>
            <h2 id="qr-explainer-title">What is a <em>QR Code?</em></h2>
            <p>A QR code is a small pattern of squares that stores information—like a website link, a message, or Wi-Fi details.</p>
            <p>Just point your phone’s camera at it to open what’s inside. No typing, just a quick scan.</p>
            <span className="qr-explainer-note"><Sparkles size={14} aria-hidden="true" /> QR stands for “Quick Response.” Simple, right?</span>
          </div>
        </section>

        <section className="qr-steps section-wrap animate-up" aria-labelledby="qr-steps-title">
          <div className="section-heading">
            <div className="eyebrow">FROM FIRST CLICK TO FIRST SCAN</div>
            <h2 id="qr-steps-title">Create Your QR Code in <em>4 Simple Steps</em></h2>
            <p>A few little steps. Something wonderful to share.</p>
          </div>
          <ol className="qr-steps-grid">
            {[
              { number: "01", icon: ScanLine, color: "blue", title: "Choose a QR Type", text: "Select URL, Plain Text, Email, Phone or Wi-Fi." },
              { number: "02", icon: Type, color: "peach", title: "Add Your Information", text: "Enter the content you want to encode into your QR code." },
              { number: "03", icon: SlidersHorizontal, color: "lavender", title: "Customize & Preview", text: "Choose your colors, size and other settings, then see the QR code update instantly." },
              { number: "04", icon: Download, color: "mint", title: "Download & Use", text: "Download your QR code as a PNG and use it wherever you need." },
            ].map(({ number, icon: Icon, color, title, text }) => (
              <li className="feature-card qr-step-card" key={number}>
                <div className="qr-step-top">
                  <span className="qr-step-number">{number}</span>
                  <span className={`feature-icon ${color}`}>
                    <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="closing section-wrap animate-up">
          <div>
            <h2>Big ideas deserve <em>beautiful little squares.</em></h2>
            <p>Make something worth scanning.</p>
          </div>
          <a href="#generator" className="button primary">Let’s create yours <ArrowUpRight size={17} /></a>
          <span className="closing-qr" aria-hidden="true">QR</span>
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <Logo small />
        <span>Small squares. Meaningful connections.</span>
        <span>
          © {new Date().getFullYear()} BitSquare <span className="footer-dot">·</span> Made with a little love.
        </span>
      </footer>

      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

export default App;
