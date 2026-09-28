import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-mark">Q</span>
          <span>QRForge</span>
        </div>

        <nav className="nav">
          <a href="#create">Create</a>
          <a href="#recent">My QR Codes</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="header-status">
          <span className="status">
            <span className="status-dot"></span>
            Ready to create
          </span>

          <button className="profile" type="button">
            <span className="avatar">A</span>
            Alex M.
          </button>
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

          <button className="primary-button" type="button">
            Start Creating →
          </button>
        </section>

        <section className="foundation">
          <div className="section-title">
            <span>01</span>
            <strong>QR Content</strong>
          </div>

          <div className="cards">
            <div className="card">
              <h2>What should your QR contain?</h2>

              <div className="placeholder">
                QR input area
              </div>
            </div>

            <div className="card preview">
              <div>
                <small>LIVE PREVIEW</small>
                <h2>Your QR code</h2>
              </div>

              <div className="qr-placeholder">
                QR
              </div>
            </div>
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