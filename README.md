# BitSquare

### Beautiful QR codes. Built your way.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES202x-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Privacy First](https://img.shields.io/badge/Privacy-Local--First-111111?style=flat-square)](#-privacy-first)
[![License](https://img.shields.io/badge/License-MIT-111111?style=flat-square)](#-license)

> **Small squares. Meaningful connections.**

BitSquare is a modern, browser-based QR Code Generator & Designer that turns URLs, messages, emails, phone numbers, and Wi-Fi credentials into customizable, high-quality QR codes.

No account. No uploads. No unnecessary complexity.

**Just create → customize → download.**

**[Live Demo](https://bit-square.vercel.app/)** · **[View Source](https://github.com/shaurya3571/BitSquare)**

---

## ✦ Why BitSquare?

Most QR generators make QR codes functional.

BitSquare makes them **functional and beautiful**.

The experience is designed around three ideas:

- **Simple** — generate a QR code in seconds.
- **Personal** — customize colors, size, margins and error correction.
- **Private** — QR generation happens directly in your browser.

---

## ⚡ Features

### 01 · Five QR Types

Generate QR codes for:

| Type | Use Case |
| --- | --- |
| 🌐 **URL** | Websites, landing pages & links |
| ✦ **Text** | Notes, messages & plain text |
| ✉️ **Email** | Email address, subject & message |
| ☎️ **Phone** | Direct phone numbers |
| 📶 **Wi-Fi** | Network name, password & security |

---

### 02 · Live Preview

Every change is reflected instantly.

Change your content, colors, size or QR settings and see the result before downloading.

**What you see is what you download.**

---

### 03 · Custom Styling

Make your QR code fit your visual identity.

- Foreground color
- Background color
- Image size
- Error correction level
- Quiet-zone / margin control
- Built-in design presets

Choose from **256×256 up to 2048×2048 px** for exported PNGs.

---

### 04 · Smart Readability Checks

BitSquare doesn't just generate a QR code and leave you guessing.

It checks things that can affect scan reliability, including:

- Foreground/background contrast
- Dark-background configurations
- QR margin
- Input validity
- Website URL validity

If something looks risky, BitSquare tells you before you download.

---

### 05 · High-Quality PNG Export

Download your generated QR code as a PNG directly from the browser.

```text
bitsquare-url.png
bitsquare-text.png
bitsquare-email.png
bitsquare-phone.png
bitsquare-wifi.png
```

No server-side processing required.

---

### 06 · Privacy First

Your QR content stays in your browser.

> **No uploads. No tracking. Just QR codes.**

BitSquare generates QR codes client-side, meaning your content doesn't need to be sent to a backend server.

---

## 🎨 Design Philosophy

BitSquare isn't meant to feel like another utility website.

The interface focuses on:

- Minimal visual noise
- Clear typography
- Editorial-style layouts
- Micro-interactions
- Responsive design
- Live feedback
- Accessible controls
- A playful but professional visual identity

The goal:

> **Turn a utility into an experience.**

---

## 🧠 How It Works

```text
             ┌─────────────────┐
             │  Choose QR Type │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │  Enter Content  │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │ Validate Input  │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │ Customize QR    │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │  Live Preview   │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │  Download PNG   │
             └─────────────────┘
```

The application builds a QR payload based on the selected content type, validates it, generates the QR image using the `qrcode` package, and renders the result directly in the browser.

---

## 🛠 Tech Stack

### Frontend

- **React 19**
- **JavaScript**
- **HTML / JSX**
- **CSS**

### Tooling

- **Vite**
- **ESLint**

### Core Library

- **qrcode**

The current project uses React 19, Vite 8 and `qrcode` as its primary QR-generation dependency.

---

## 📁 Project Structure

```text
BitSquare/
│
├── public/
│
├── src/
│   ├── utils/
│   │   ├── qrOptions.js
│   │   ├── qrPayload.js
│   │   ├── validation.js
│   │   └── presets.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── icons.jsx
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

The application logic is primarily organized around `App.jsx` and small utility modules responsible for payload creation, QR configuration, presets and validation.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm

### 1. Clone

```bash
git clone https://github.com/shaurya3571/BitSquare.git
```

### 2. Enter the project

```bash
cd BitSquare
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start development server

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

---

## 📦 Available Scripts

```bash
npm run dev
```

Start the development server.

```bash
npm run build
```

Create a production build.

```bash
npm run preview
```

Preview the production build locally.

```bash
npm run lint
```

Run ESLint across the project.

These scripts are defined in the project's current `package.json`.

---

## 🔐 Privacy First

BitSquare follows a **local-first** approach.

QR generation happens inside the user's browser rather than requiring a backend to process QR content.

That means sensitive inputs such as:

- Wi-Fi passwords
- Email information
- Personal phone numbers
- Private messages

don't need to be uploaded to a server for QR generation.

The application also provides client-side validation and readability warnings before export.

---

## 🧩 Architecture

BitSquare keeps the QR-generation flow relatively lightweight:

```text
React UI
   │
   ├── Content Type
   │      ├── URL
   │      ├── Text
   │      ├── Email
   │      ├── Phone
   │      └── Wi-Fi
   │
   ├── Validation
   │
   ├── Payload Builder
   │
   ├── QR Configuration
   │
   └── QR Renderer
          │
          ↓
      PNG Export
```

This separation keeps content formatting, validation and QR configuration outside the main rendering logic.

---

## 🧪 What I Built

BitSquare was built as a frontend-focused project to explore how a simple browser utility can be turned into a polished product experience.

The project focuses on:

- React state management
- Dynamic form rendering
- Client-side validation
- Browser-based QR generation
- Real-time UI updates
- Responsive interface design
- Downloadable generated assets
- Accessibility-conscious interactions
- Privacy-first architecture

---

## 🗺️ Roadmap

Potential future improvements:

- [ ] SVG export
- [ ] Logo embedding
- [ ] Rounded/custom QR styles
- [ ] More advanced templates
- [ ] Batch QR generation
- [ ] vCard/contact QR codes
- [ ] Event/calendar QR codes
- [ ] Custom filename support
- [ ] Dark mode
- [ ] Shareable QR presets
- [ ] Automated testing

---

## 🤝 Contributing

Ideas, improvements and bug reports are welcome.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature

# Make your changes
git add .
git commit -m "feat: add your feature"

# Push your branch
git push origin feature/your-feature
```

Then open a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

See [`LICENSE`](./LICENSE) for details.

---

## 👨‍💻 Author

### Shaurya Agrawal

Developer focused on **DevSecOps, full-stack development, cloud and building things that people actually use.**

[![GitHub](https://img.shields.io/badge/GitHub-shaurya3571-181717?style=flat-square&logo=github)](https://github.com/shaurya3571)

---

<div align="center">

### Scan less. Share more.

**BitSquare — Small squares. Meaningful connections.**

</div>
