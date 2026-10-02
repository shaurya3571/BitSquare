import { useEffect, useState } from "react"
import QRCode from "qrcode"
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
  History,
  X,
  Menu,
  Link,
  RotateCcw,
  AlertTriangle,
  Plus,
  Heart,
} from "lucide-react"
const initial = {
  type: "URL",
  value: "https://bitsquare.design",
  subject: "",
  body: "",
  password: "",
  security: "WPA",
  size: 1024,
  foreground: "#233d57",
  background: "#ffffff",
  correction: "M",
  margin: 4,
}
const types = [
  { name: "URL", icon: Globe },
  { name: "Text", icon: Type },
  { name: "Email", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "Wi-Fi", icon: Wifi },
]
const presets = [
  { name: "Classic", fg: "#233d57", bg: "#ffffff" },
  { name: "Midnight", fg: "#292c49", bg: "#eaeaf5" },
  { name: "Minimal", fg: "#555d61", bg: "#f5f5f2" },
  { name: "Soft", fg: "#526c64", bg: "#edf5ef" },
  { name: "High Contrast", fg: "#111111", bg: "#ffffff" },
]
const examples = [
  { ...initial, value: "https://example.com" },
  {
    ...initial,
    type: "Wi-Fi",
    value: "Studio guest",
    password: "welcome123",
    foreground: "#576653",
    background: "#eff4e9",
  },
  {
    ...initial,
    type: "Text",
    value: "A little hello goes a long way.",
    foreground: "#77564b",
    background: "#fff0e8",
  },
]
function payload(c) {
  const escape = (s) => s.replace(/([\\;,:"])/g, "\\$1")
  if (c.type === "Email")
    return `mailto:${c.value}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.body)}`
  if (c.type === "Phone") return `tel:${c.value}`
  if (c.type === "Wi-Fi")
    return `WIFI:T:${c.security};S:${escape(c.value)};P:${
      c.security === "nopass" ? "" : escape(c.password)
    };;`
  return c.value
}
function contrast(a, b) {
  const luminance = (s) => {
    const rgb = s
      .match(/[a-f\d]{2}/gi)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
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
  )
}
function QRImage({ config, className = "" }) {
  const [image, setImage] = useState("")
  useEffect(() => {
    let active = true
    QRCode.toDataURL(payload(config) || "BitSquare", {
      width: 360,
      margin: config.margin,
      errorCorrectionLevel: config.correction,
      color: { dark: config.foreground, light: config.background },
    })
      .then((url) => {
        if (active) setImage(url)
      })
      .catch(() => setImage(""))
    return () => {
      active = false
    }
  }, [config])
  return image ? (
    <img className={className} src={image} alt={`${config.type} QR code`} />
  ) : (
    <div className={`qr-placeholder ${className}`}>
      <ScanLine />
    </div>
  )
}
export default function App() {
  const [config, setConfig] = useState(initial)
  const [image, setImage] = useState("")
  const [error, setError] = useState("")
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bitsquare-recent") || "[]")
        .filter((item) => item.config && item.image && item.created)
        .slice(0, 6)
    } catch {
      return []
    }
  })
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState("")
  const [downloading, setDownloading] = useState(false)
  const update = (key, value) => setConfig((c) => ({ ...c, [key]: value }))
  useEffect(() => {
    let active = true
    if (!config.value.trim()) {
      setImage("")
      setError("Add your content to create a QR code.")
      return
    }
    QRCode.toDataURL(payload(config), {
      width: 420,
      margin: config.margin,
      errorCorrectionLevel: config.correction,
      color: { dark: config.foreground, light: config.background },
    })
      .then((url) => {
        if (active) {
          setImage(url)
          setError("")
        }
      })
      .catch(() => {
        if (active) {
          setImage("")
          setError("That’s a little too much content. Try shortening it.")
        }
      })
    return () => {
      active = false
    }
  }, [config])
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])
  const poorContrast = contrast(config.foreground, config.background) < 4.5
  const inverted =
    parseInt(config.foreground.slice(1), 16) >
    parseInt(config.background.slice(1), 16)
  const warning = poorContrast
    ? "Low contrast. Try a darker foreground for easier scanning."
    : inverted
      ? "Dark backgrounds can be harder to scan. Test before sharing."
      : config.margin < 4
        ? "A margin of at least 4 modules is recommended for reliable scanning."
        : ""
  const download = async () => {
    setDownloading(true)
    try {
      const png = await QRCode.toDataURL(payload(config), {
        width: config.size,
        margin: config.margin,
        errorCorrectionLevel: config.correction,
        color: { dark: config.foreground, light: config.background },
      })
      const anchor = document.createElement("a")
      anchor.href = png
      anchor.download = `bitsquare-${config.type.toLowerCase().replace(" ", "-")}.png`
      anchor.click()
      const saved = {
        id: crypto.randomUUID(),
        config: { ...config },
        image: png,
        created: Date.now(),
      }
      const next = [
        saved,
        ...recent.filter(
          (item) => JSON.stringify(item.config) !== JSON.stringify(config),
        ),
      ].slice(0, 6)
      setRecent(next)
      try {
        localStorage.setItem("bitsquare-recent", JSON.stringify(next))
      } catch {
        setToast(
          "PNG downloaded. Browser storage is full, so this code couldn’t be saved.",
        )
        return
      }
      setToast("Your QR code is ready. Saved to your recent codes, too!")
    } catch {
      setToast("Unable to download. Try shorter content or a smaller size.")
    } finally {
      setDownloading(false)
    }
  }
  const selectType = (type) =>
    setConfig((c) => ({
      ...c,
      type,
      value: type === "URL" ? "https://bitsquare.design" : "",
      subject: "",
      body: "",
      password: "",
    }))
  const reuse = (c) => {
    setConfig({ ...c })
    document
      .getElementById("generator")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
    setToast("Loaded into the editor. Make it yours!")
  }
  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Logo />
          <nav className={menu ? "nav-links open" : "nav-links"}>
            <a href="#generator" onClick={() => setMenu(false)}>
              QR Generator
            </a>
            <a href="#features" onClick={() => setMenu(false)}>
              Features
            </a>
            <a href="#recent" onClick={() => setMenu(false)}>
              Recent Codes
            </a>
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
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="little-spark">
                  <Sparkles size={13} />
                </span>{" "}
                SMALL SQUARES. BIG POSSIBILITIES.
              </div>
              <h1>
                Create QR Codes
                <br />
                That Look{" "}
                <span className="amazing">
                  Amazing
                  <svg
                    viewBox="0 0 360 18"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M3 13Q160 -4 355 9" />
                  </svg>
                </span>
                <span className="headline-dot">.</span>
              </h1>
              <p>
                Your links, your style. Turn everyday information into
                <br className="desktop-break" /> beautiful, scannable QR
                codes—in just a few clicks.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="#generator">
                  Create QR Code <ArrowUpRight size={18} />
                </a>
                <a className="button secondary" href="#features">
                  Explore Features <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-trust">
                <span>
                  <Check size={14} /> Free. Always.
                </span>
                <span>
                  <Check size={14} /> No sign-up
                </span>
                <span>
                  <Check size={14} /> Made to be yours
                </span>
              </div>
            </div>
            <div
              className="hero-art"
              aria-label="A beautifully customized QR code"
            >
              <div className="art-circle" />
              <span className="art-spark spark-one">✦</span>
              <span className="art-spark spark-two">✦</span>
              <div className="floating-label label-live">
                <span /> LIVE PREVIEW
              </div>
              <div className="hero-qr-card">
                <div className="hero-card-top">
                  <span className="mini-logo">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span>Good things start with a scan.</span>
                  <ArrowUpRight size={16} />
                </div>
                <QRImage config={initial} className="hero-qr" />
                <div className="hero-card-bottom">
                  A little square.<span>A whole lot of possibility.</span>
                </div>
              </div>
              <div className="floating-label label-types">
                <ScanLine size={16} /> 5 QR TYPES
              </div>
              <div className="floating-label label-png">
                <Download size={15} /> PNG READY <Check size={13} />
              </div>
              <span className="art-caption">
                go on, give it a scan{" "}
                <svg viewBox="0 0 80 50" aria-hidden="true">
                  <path d="M2 42Q75 58 67 4m-8 9 8-9 8 10" />
                </svg>
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
        <section className="generator-section section-wrap" id="generator">
          <div className="section-heading">
            <div className="eyebrow">THE QR STUDIO</div>
            <h2>
              A little square. <em>A lot of you.</em>
            </h2>
            <p>
              Pick your content, add your personality, and let’s make something
              scannable.
            </p>
          </div>
          <div className="generator-card">
            <div className="configuration">
              <div className="panel-heading">
                <span>
                  <SlidersHorizontal size={18} /> Make it yours
                </span>
                <button
                  className="reset-button"
                  onClick={() => {
                    setConfig({ ...initial })
                    setToast("Back to a fresh start.")
                  }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
              <div
                className="type-tabs"
                role="tablist"
                aria-label="QR code type"
              >
                {types.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    role="tab"
                    aria-selected={config.type === name}
                    className={config.type === name ? "active" : ""}
                    onClick={() => selectType(name)}
                  >
                    <Icon size={16} />
                    {name === "Text" ? "Plain text" : name}
                  </button>
                ))}
              </div>
              <div className="content-fields">
                <label htmlFor="qr-content">
                  {config.type === "URL"
                    ? "Your website URL"
                    : config.type === "Text"
                      ? "Your message"
                      : config.type === "Email"
                        ? "Email address"
                        : config.type === "Phone"
                          ? "Phone number"
                          : "Network name (SSID)"}
                </label>
                <div className="content-input">
                  {config.type === "URL" && <Link size={17} />}
                  {config.type === "Text" ? (
                    <textarea
                      id="qr-content"
                      maxLength={2000}
                      value={config.value}
                      onChange={(e) => update("value", e.target.value)}
                      placeholder="A message worth sharing…"
                    />
                  ) : (
                    <input
                      id="qr-content"
                      type={
                        config.type === "Email"
                          ? "email"
                          : config.type === "Phone"
                            ? "tel"
                            : "text"
                      }
                      value={config.value}
                      onChange={(e) => update("value", e.target.value)}
                      placeholder={
                        config.type === "URL"
                          ? "https://your-website.com"
                          : config.type === "Email"
                            ? "hello@example.com"
                            : config.type === "Phone"
                              ? "+1 555 123 4567"
                              : "Your Wi-Fi network"
                      }
                      maxLength={2000}
                    />
                  )}
                  {config.value && (
                    <button
                      aria-label="Clear content"
                      onClick={() => update("value", "")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <p className="field-hint">
                  {config.type === "URL"
                    ? "Where should your QR code take people?"
                    : config.type === "Text"
                      ? "A note, a quote, or something lovely."
                      : config.type === "Email"
                        ? "Open a ready-to-send email with one scan."
                        : config.type === "Phone"
                          ? "Include the country code for easy calling."
                          : "Connect your guests without typing a password."}
                </p>
                {config.type === "Email" && (
                  <div className="extra-fields">
                    <label>
                      Subject
                      <input
                        value={config.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        placeholder="Say hello"
                      />
                    </label>
                    <label>
                      Message
                      <textarea
                        value={config.body}
                        onChange={(e) => update("body", e.target.value)}
                        placeholder="Your email message"
                      />
                    </label>
                  </div>
                )}
                {config.type === "Wi-Fi" && (
                  <div className="extra-fields two-columns">
                    <label>
                      Security
                      <select
                        value={config.security}
                        onChange={(e) => update("security", e.target.value)}
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No password</option>
                      </select>
                    </label>
                    {config.security !== "nopass" && (
                      <label>
                        Password
                        <input
                          type="password"
                          value={config.password}
                          onChange={(e) => update("password", e.target.value)}
                          placeholder="Network password"
                        />
                      </label>
                    )}
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
                      value={config.foreground}
                      onChange={(e) => update("foreground", e.target.value)}
                    />
                    <span>{config.foreground.toUpperCase()}</span>
                    <ChevronDown size={13} />
                  </div>
                </label>
                <label>
                  Background color
                  <div className="color-field">
                    <input
                      aria-label="Background color"
                      type="color"
                      value={config.background}
                      onChange={(e) => update("background", e.target.value)}
                    />
                    <span>{config.background.toUpperCase()}</span>
                    <ChevronDown size={13} />
                  </div>
                </label>
                <label>
                  Image size
                  <select
                    value={config.size}
                    onChange={(e) => update("size", Number(e.target.value))}
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
                    value={config.correction}
                    onChange={(e) => update("correction", e.target.value)}
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
                    value={config.margin}
                    onChange={(e) => update("margin", Number(e.target.value))}
                  />
                  <output>{config.margin} modules</output>
                </div>
              </div>
              <div className="preset-heading">
                <span>A head start? Try a preset.</span>
                <span>Then make it your own.</span>
              </div>
              <div className="presets">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() =>
                      setConfig((c) => ({
                        ...c,
                        foreground: p.fg,
                        background: p.bg,
                      }))
                    }
                    aria-pressed={
                      config.foreground === p.fg && config.background === p.bg
                    }
                  >
                    <span
                      className={`preset-swatch ${
                        config.foreground === p.fg && config.background === p.bg
                          ? "selected"
                          : ""
                      }`}
                      style={{ background: p.bg, color: p.fg }}
                    >
                      <span className="swatch-pattern">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="preview-panel">
              <div className="preview-top">
                <span>
                  <span className="status-dot" /> LIVE PREVIEW
                </span>
                <span>Made by you.</span>
              </div>
              <div className="preview-art">
                <span className="preview-orbit orbit-one" />
                <span className="preview-orbit orbit-two" />
                <div className="qr-preview">
                  {image ? (
                    <img src={image} alt="Your live QR code preview" />
                  ) : (
                    <div className="empty-qr">
                      <ScanLine size={48} />
                      <p>
                        Your next great QR code
                        <br />
                        starts with a little content.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`readability ${warning || error ? "warning" : ""}`}
                role="status"
              >
                {warning || error ? (
                  <AlertTriangle size={15} />
                ) : (
                  <ShieldCheck size={15} />
                )}
                <span>
                  {error || warning || "Looking good! Ready to scan."}
                </span>
              </div>
              <button
                className="button download-button"
                onClick={download}
                disabled={!image || downloading}
              >
                <Download size={18} />
                {downloading ? "Preparing your PNG…" : "Download PNG"}
                <ArrowDownDecoration />
              </button>
              <div className="download-details">
                {config.size} × {config.size} px <span>·</span> High-quality PNG{" "}
                <span>·</span> All yours
              </div>
              <div className="preview-note">
                <Heart size={14} />
                <span>Made to share. Designed to stand out.</span>
              </div>
            </div>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={14} /> Your content stays in your browser. No
            uploads, no tracking, just QR codes.
          </div>
        </section>
        <section className="recent-section section-wrap" id="recent">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">GOOD IDEAS, KEPT CLOSE</span>
              <h2>
                Your recent <em>creations.</em>
              </h2>
            </div>
            <span className="local-badge">
              <History size={14} /> Saved in this browser
            </span>
          </div>
          <p className="section-subtitle">
            {recent.length
              ? "Ready for another round? Pick up right where you left off."
              : "A few ideas to get you going. Your downloaded codes will appear here."}
          </p>
          <div className="recent-grid">
            {(recent.length
              ? recent
              : examples.map((c, i) => ({
                  id: String(i),
                  config: c,
                  image: "",
                  created: 0,
                  name: [
                    "Your next big thing",
                    "A warmer welcome",
                    "A little hello",
                  ][i],
                }))
            ).map((item) => (
              <div className="recent-card" key={item.id}>
                <div
                  className="recent-qr"
                  style={{ background: item.config.background }}
                >
                  {item.image ? (
                    <img src={item.image} alt={`${item.config.type} QR code`} />
                  ) : (
                    <QRImage config={item.config} />
                  )}
                </div>
                <div className="recent-info">
                  <span
                    className={`type-badge badge-${item.config.type.replace("-", "").toLowerCase()}`}
                  >
                    {types.find((t) => t.name === item.config.type)?.icon &&
                      (() => {
                        const Icon = types.find(
                          (t) => t.name === item.config.type,
                        ).icon
                        return <Icon size={11} />
                      })()}
                    {item.config.type === "Text"
                      ? "Plain text"
                      : item.config.type}
                  </span>
                  <h3 title={item.config.value}>
                    {item.name || item.config.value}
                  </h3>
                  <span className="timestamp">
                    {item.created
                      ? new Date(item.created).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "A little inspiration"}
                  </span>
                </div>
                <button
                  className="reuse-button"
                  onClick={() => reuse(item.config)}
                  aria-label={`Reuse ${item.name || item.config.value}`}
                >
                  <RotateCcw size={13} /> Reuse
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="features-section" id="features">
          <div className="section-wrap">
            <div className="section-heading">
              <div className="eyebrow">THOUGHTFULLY SIMPLE</div>
              <h2>
                Everything you need.
                <br />
                <em>Nothing you don’t.</em>
              </h2>
              <p>
                A small but mighty toolkit for turning “scan me” into “wow.”
              </p>
            </div>
            <div className="features-grid">
              {[
                {
                  title: "From idea to QR. Instantly.",
                  text: "No waiting, no complicated steps. Add your content and your code is ready.",
                  color: "blue",
                  number: "01",
                },
                {
                  title: "Five ways to connect.",
                  text: "Links, messages, emails, calls, and Wi-Fi. One little square, endless possibilities.",
                  color: "peach",
                  number: "02",
                },
                {
                  title: "Unmistakably yours.",
                  text: "Play with colors, sizes, and presets. Create a QR code that feels like your brand.",
                  color: "lavender",
                  number: "03",
                },
                {
                  title: "See the magic happen.",
                  text: "Every little change, right before your eyes. What you see is what you download.",
                  color: "yellow",
                  number: "04",
                },
                {
                  title: "Pretty. And practical.",
                  text: "Smart contrast checks and error correction help your codes scan beautifully.",
                  color: "mint",
                  number: "05",
                },
                {
                  title: "Good things, remembered.",
                  text: "Your recent codes stay right here. Reuse, remix, and make something new.",
                  color: "pink",
                  number: "06",
                },
              ].map(({ title, text, color, number }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-top">
                    <span className={`feature-icon ${color}`}>
                      <BitSquareFeatureVisual variant={number} />
                    </span>
                    <span>{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="qr-explainer section-wrap"
          aria-labelledby="qr-explainer-title"
        >
          <div className="qr-explainer-visual">
            <div className="qr-explainer-card">
              <QRImage config={initial} className="qr-explainer-image" />
              <span>One scan. A new connection.</span>
            </div>
            <span className="qr-explainer-label">
              <ScanLine size={14} aria-hidden="true" /> SCAN & DISCOVER
            </span>
          </div>
          <div className="qr-explainer-copy">
            <div className="eyebrow">A LITTLE INTRODUCTION</div>
            <h2 id="qr-explainer-title">
              What is a <em>QR Code?</em>
            </h2>
            <p>
              A QR code is a small pattern of squares that stores
              information—like a website link, a message, or Wi-Fi details.
            </p>
            <p>
              Just point your phone’s camera at it to open what’s inside. No
              typing, just a quick scan.
            </p>
            <span className="qr-explainer-note">
              <Sparkles size={14} aria-hidden="true" /> QR stands for “Quick
              Response.” Simple, right?
            </span>
          </div>
        </section>
        <section
          className="qr-steps section-wrap"
          aria-labelledby="qr-steps-title"
        >
          <div className="section-heading">
            <div className="eyebrow">FROM FIRST CLICK TO FIRST SCAN</div>
            <h2 id="qr-steps-title">
              Create Your QR Code in <em>4 Simple Steps</em>
            </h2>
            <p>A few little steps. Something wonderful to share.</p>
          </div>
          <ol className="qr-steps-grid">
            {[
              {
                number: "01",
                icon: ScanLine,
                color: "blue",
                title: "Choose a QR Type",
                text: "Select URL, Plain Text, Email, Phone or Wi-Fi.",
              },
              {
                number: "02",
                icon: Type,
                color: "peach",
                title: "Add Your Information",
                text: "Enter the content you want to encode into your QR code.",
              },
              {
                number: "03",
                icon: SlidersHorizontal,
                color: "lavender",
                title: "Customize & Preview",
                text: "Choose your colors, size and other settings, then see the QR code update instantly.",
              },
              {
                number: "04",
                icon: Download,
                color: "mint",
                title: "Download & Use",
                text: "Download your QR code as a PNG and use it wherever you need.",
              },
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
                {number !== "04" && (
                  <span className="qr-step-connector" aria-hidden="true">
                    <ArrowRight size={13} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
        <section className="closing section-wrap">
          <span className="closing-spark">✦</span>
          <div>
            <h2>
              Big ideas deserve <em>beautiful little squares.</em>
            </h2>
            <p>Make something worth scanning.</p>
          </div>
          <a href="#generator" className="button primary">
            Let’s create yours <ArrowUpRight size={17} />
          </a>
          <span className="closing-qr" aria-hidden="true">
            QR
          </span>
        </section>
      </main>
      <footer className="site-footer section-wrap">
        <Logo small />
        <span>Small squares. Meaningful connections.</span>
        <span>
          © {new Date().getFullYear()} BitSquare{" "}
          <span className="footer-dot">·</span> Made with a little love.
        </span>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  )
}
function ArrowDownDecoration() {
  return <span className="download-format">.PNG</span>
}
function BitSquareFeatureVisual({ variant }) {
  return (
    <svg
      width={21}
      height={21}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {variant === "01" && (
        <g>
          <rect x="2" y="4" width="3" height="3" rx=".4" opacity=".45" />
          <rect
            x="3"
            y="12"
            width="3"
            height="3"
            rx=".4"
            fill="currentColor"
            fillOpacity=".18"
          />
          <path d="M6 5.5h3v5h3" opacity=".55" />
          <path d="M6 13.5h3v4h3" opacity=".55" />
          <rect x="13" y="3" width="8" height="8" rx=".7" />
          <rect
            x="15.5"
            y="5.5"
            width="3"
            height="3"
            rx=".3"
            fill="currentColor"
            stroke="none"
          />
          <path
            d="M13 14h3v3h-3zM18 14h3v7h-3zM13 19h3v2h-3z"
            fill="currentColor"
            fillOpacity=".4"
            stroke="none"
          />
        </g>
      )}
      {variant === "02" && (
        <g>
          <path d="m6 6 6 6 6-6M6 18l6-6 6 6" opacity=".45" />
          {[
            [2, 2],
            [17, 2],
            [9.5, 9.5],
            [2, 17],
            [17, 17],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect
                x={x}
                y={y}
                width="5"
                height="5"
                rx=".65"
                fill="currentColor"
                fillOpacity=".1"
              />
              <rect
                x={x + 1.75}
                y={y + 1.75}
                width="1.5"
                height="1.5"
                rx=".2"
                fill="currentColor"
                stroke="none"
              />
            </g>
          ))}
        </g>
      )}
      {variant === "03" && (
        <g>
          <rect x="2.5" y="3" width="8" height="8" rx=".65" />
          <rect
            x="5"
            y="5.5"
            width="3"
            height="3"
            rx=".3"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="18"
            cy="6.5"
            r="3.5"
            fill="currentColor"
            fillOpacity=".18"
          />
          <path d="M14.5 13.5h7M18 13.5v3M3 15h3v6H3z" />
          <rect
            x="9"
            y="16"
            width="5"
            height="5"
            rx=".65"
            fill="currentColor"
            fillOpacity=".25"
            transform="rotate(-12 11.5 18.5)"
          />
          <rect
            x="17"
            y="18"
            width="4"
            height="4"
            rx=".4"
            fill="currentColor"
            stroke="none"
          />
        </g>
      )}
      {variant === "04" && (
        <g>
          <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" opacity=".4" />
          <rect
            x="1.5"
            y="1.5"
            width="4"
            height="4"
            rx=".6"
            fill="currentColor"
            fillOpacity=".15"
          />
          <rect
            x="18.5"
            y="1.5"
            width="4"
            height="4"
            rx=".6"
            fill="currentColor"
            fillOpacity=".15"
          />
          <rect
            x="1.5"
            y="18.5"
            width="4"
            height="4"
            rx=".6"
            fill="currentColor"
            fillOpacity=".15"
          />
          <rect
            x="18.5"
            y="18.5"
            width="4"
            height="4"
            rx=".6"
            fill="currentColor"
            fillOpacity=".15"
          />
          <path
            d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z"
            fill="currentColor"
            fillOpacity=".65"
            stroke="none"
          />
        </g>
      )}
      {variant === "05" && (
        <g>
          <rect x="3" y="3" width="6" height="6" rx=".65" opacity=".45" />
          <rect
            x="5"
            y="5"
            width="2"
            height="2"
            rx=".2"
            fill="currentColor"
            stroke="none"
            opacity=".45"
          />
          {[
            [2.5, 12],
            [6, 15.5],
            [9.5, 19],
            [13, 15.5],
            [16.5, 12],
            [20, 8.5],
          ].map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="3"
              height="3"
              rx=".4"
              fill="currentColor"
              fillOpacity=".3"
            />
          ))}
        </g>
      )}
      {variant === "06" && (
        <g>
          <path
            d="M5 15.5H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h10.5a1 1 0 0 1 1 1v2"
            opacity=".35"
          />
          <path
            d="M8.5 19H6.5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1v2"
            opacity=".65"
          />
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="1.25"
            fill="currentColor"
            fillOpacity=".08"
          />
          <rect x="12" y="12" width="4" height="4" rx=".4" />
          <path
            d="M18 12h1v4h-1zM12 18h4v1h-4zM18 18h1v1h-1z"
            fill="currentColor"
          />
        </g>
      )}
    </svg>
  )
}
