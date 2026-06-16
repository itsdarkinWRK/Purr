# 🐱 Purrfect Cups — Cat Café & Lounge

---

> ⚠️ **DISCLAIMER:** Render explicitly blocks outbound network traffic to SMTP ports (25, 465, and 587) on all Free tier web services. This prevents Nodemailer from connecting to traditional mail servers directly from the platform. Email confirmation works **locally** with Gmail App Password but will silently fail (`emailSent: false`) on the live Render deployment — the booking itself is still saved successfully.

---

<p align="center">
  <strong>A modern full-stack web application for cat cafés — table reservations, guest reviews, and image uploads.</strong>
</p>

<p align="center">
  <a href="https://purrcups.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-%F0%9F%90%B1%20Purrfect%20Cups-blueviolet?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://github.com/itsdarkin/purrcups" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>

---

## 🌟 Key Features

### 📅 Table Reservations
Choose between two zones — **Main Lounge** (playful, social) or **Quiet Purr Zone** (calm, reading nook). Guests receive an automatic email confirmation (works locally / logged on Render).

### ⭐ Guest Reviews
Users can rate (1–5 stars) and optionally upload an image (JPEG/PNG/WebP/GIF/AVIF, max 2 MB). Reviews are paginated (4 per page, 2-column grid) with images displayed on the left side of each card.

### 🖼️ Image Upload
Powered by Multer v1 with server-side file type & size validation and secure filename generation (`crypto.randomUUID()`).

### 🔒 Security
- Rate limiting (20/min bookings, 5/min reviews)
- Input sanitization (HTML tag stripping, control character removal)
- HTML-escaping in email templates
- Admin basic auth on booking list endpoint
- Open CORS (portfolio project)
- 10 KB body size limit

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 / TypeScript / Vite / Tailwind CSS 4 / Framer Motion |
| **Backend** | Node.js / Express 4 |
| **Storage** | JSON files (server), React state (client) |
| **Email** | Nodemailer + Gmail App Password |
| **File Upload** | Multer v1 (disk storage) |
| **Hosting** | Render (single service) |

---

## 📂 Project Structure

```text
/purrcups
├── server/
│   ├── index.js          # Express API (bookings, reviews, upload, email)
│   ├── package.json      # Server dependencies
│   ├── .env.example      # SMTP & config template
│   └── uploads/          # Uploaded review images (gitignored)
│
├── src/
│   ├── App.tsx           # Main React app (Booking, Reviews, ReviewForm)
│   └── ...
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Local Development

```bash
# 1. Server
cd server
cp .env.example .env       # edit SMTP credentials if needed
npm install
npm run dev                # http://localhost:3001

# 2. Frontend (separate terminal)
cd ..
npm install
npm run dev                # http://localhost:5173
```

> In dev mode the frontend uses `VITE_API_URL=http://localhost:3001`. In production the backend serves the built frontend via `express.static`.

---

## ☁️ Deploy (Render)

| Setting | Value |
| :--- | :--- |
| **Build Command** | `cd server && npm install && cd .. && npm install && npm run build` |
| **Start Command** | `cd server && node index.js` |
| **Environment Variables** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_PASS` |

A `.env` file can be mounted at the repo root via Render Secret Files.

---

## 📬 Email Status

- **Local (localhost):** Works — Gmail App Password sends instantly
- **Render:** SMTP ports blocked → `emailSent: false` — the booking is still persisted
