import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { config as dotenvConfig } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try loading .env from parent dir (for Render Secret Files mounted at repo root)
const parentEnv = join(__dirname, "..", ".env");
if (existsSync(parentEnv)) {
  const parsed = dotenvConfig({ path: parentEnv });
  if (parsed?.parsed) Object.assign(process.env, parsed.parsed);
}
const DB_PATH = join(__dirname, "bookings.json");
const REVIEWS_DB_PATH = join(__dirname, "reviews.json");
const UPLOADS_DIR = join(__dirname, "uploads");
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "";

// ─── HTML escape ─────────────────────────────────────────

function esc(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ─── Input validation ────────────────────────────────────

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function sanitizeStr(v, maxLen = 200) {
  if (typeof v !== "string") return "";
  return v.replace(/<[^>]*>/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim().slice(0, maxLen);
}

// ─── DB helpers ──────────────────────────────────────────

function readDB() {
  if (!existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── Reviews DB helpers ──────────────────────────────────

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const reviewStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `rev_${randomUUID()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPEG, PNG, WebP, GIF, and AVIF images are allowed."));
}

const upload = multer({
  storage: reviewStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

function readReviewsDB() {
  if (!existsSync(REVIEWS_DB_PATH)) return [];
  try {
    return JSON.parse(readFileSync(REVIEWS_DB_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeReviewsDB(data) {
  writeFileSync(REVIEWS_DB_PATH, JSON.stringify(data, null, 2));
}

// ─── SMTP transporter ────────────────────────────────────

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    process.env.SMTP_USER = testAccount.user;
    process.env.SMTP_PASS = testAccount.pass;
    console.log("Ethereal test account created:");
    console.log(`  User: ${testAccount.user}`);
    console.log(`  Pass: ${testAccount.pass}`);
    console.log("  Web:  https://ethereal.email/login\n");
  }

  const host = process.env.SMTP_HOST || "smtp.ethereal.email";
  const port = parseInt(process.env.SMTP_PORT || "587");

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });

  return transporter;
}

// ─── Email templates (all user input is HTML-escaped) ────

function buildConfirmationEmail(booking) {
  const zoneLabel = booking.zone === "quiet" ? "Quiet Purr Zone" : "Main Lounge";
  return {
    subject: `Purrfect Cups — Reservation Confirmed for ${booking.date}`,
    html: `
      <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#faf6f0;border-radius:20px;padding:32px;border:1px solid #e6d5c0;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:24px;margin:6px 0 0;color:#2d211a;">Purrfect Cups</h1>
          <p style="color:#8d6f56;font-size:13px;margin:0;">Cat Caf&eacute; &amp; Lounge &mdash; Veszpr&eacute;m</p>
        </div>
        <div style="background:#fffcf7;border-radius:16px;padding:24px;border:1px solid #ecdcc8;">
          <h2 style="font-size:18px;margin:0 0 12px;color:#2d211a;">Your reservation is confirmed!</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3f3028;">
            <tr><td style="padding:6px 8px 6px 0;width:100px;color:#8d6f56;">Guest</td><td style="padding:6px 0;"><b>${esc(booking.name)}</b></td></tr>
            <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Date</td><td style="padding:6px 0;"><b>${esc(booking.date)}</b></td></tr>
            <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Time</td><td style="padding:6px 0;"><b>${esc(booking.time)}</b></td></tr>
            <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Guests</td><td style="padding:6px 0;"><b>${esc(booking.guests)}</b></td></tr>
            <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Zone</td><td style="padding:6px 0;"><b>${esc(zoneLabel)}</b></td></tr>
            ${booking.note ? `<tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Note</td><td style="padding:6px 0;">${esc(booking.note)}</td></tr>` : ""}
          </table>
        </div>
        <div style="margin-top:20px;padding:16px 20px;background:#f4ede5;border-radius:12px;font-size:13px;color:#5a4336;">
          <b>Important:</b> Please arrive on time. Your slot is 90 minutes.
          Need to cancel? Let us know at least 3 hours in advance.
        </div>
        <p style="text-align:center;margin-top:24px;font-size:12px;color:#a38367;">
          8200 Veszpr&eacute;m, Csik&aacute;sz Imre utca 2/B.<br/>
          See you soon! &mdash; The Purrfect Cups Team
        </p>
      </div>
    `,
  };
}

function buildStaffNotificationEmail(booking) {
  const zoneLabel = booking.zone === "quiet" ? "Quiet Purr Zone" : "Main Lounge";
  return {
    subject: `New Booking: ${esc(booking.name)} — ${booking.date} ${booking.time}`,
    html: `
      <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#faf6f0;border-radius:20px;padding:32px;border:1px solid #e6d5c0;">
        <h2 style="font-size:18px;margin:0 0 12px;color:#2d211a;">New reservation received</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#3f3028;">
          <tr><td style="padding:6px 8px 6px 0;width:100px;color:#8d6f56;">Guest</td><td style="padding:6px 0;"><b>${esc(booking.name)}</b></td></tr>
          <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Email</td><td style="padding:6px 0;"><b>${esc(booking.email)}</b></td></tr>
          <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Date</td><td style="padding:6px 0;"><b>${esc(booking.date)}</b></td></tr>
          <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Time</td><td style="padding:6px 0;"><b>${esc(booking.time)}</b></td></tr>
          <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Guests</td><td style="padding:6px 0;"><b>${esc(booking.guests)}</b></td></tr>
          <tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Zone</td><td style="padding:6px 0;"><b>${esc(zoneLabel)}</b></td></tr>
          ${booking.note ? `<tr><td style="padding:6px 8px 6px 0;color:#8d6f56;">Note</td><td style="padding:6px 0;">${esc(booking.note)}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;font-size:12px;color:#a38367;"><i>ID: ${esc(booking.id)}</i></p>
      </div>
    `,
  };
}

// ─── Express app ─────────────────────────────────────────

const app = express();

// Trust proxy for rate limiter behind reverse proxy
app.set("trust proxy", 1);

// CORS
app.use(cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again later." },
});

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reviews — try again later." },
});

app.use("/api/bookings", apiLimiter);
app.use("/api/reviews", reviewLimiter);
app.use("/api/health", healthLimiter);

// Admin auth middleware (for GET /api/bookings)
function adminAuth(req, res, next) {
  if (!ADMIN_PASS) return next(); // no password set = allow (dev mode)

  const b64 = (req.headers.authorization || "").replace("Basic ", "");
  if (!b64) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [user, pass] = Buffer.from(b64, "base64").toString().split(":");
    if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  } catch {}

  return res.status(401).json({ error: "Unauthorized" });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { name, email, date, time, guests, zone, note } = req.body;

    const cleanName = sanitizeStr(name, 100);
    const cleanEmail = sanitizeStr(email, 200);
    const cleanNote = sanitizeStr(note || "", 500);
    const cleanDate = sanitizeStr(date, 10);
    const cleanTime = sanitizeStr(time, 5);

    if (!cleanName || !isValidEmail(cleanEmail) || !cleanDate || !cleanTime) {
      return res.status(400).json({ error: "Invalid or missing fields (name, valid email, date, time required)." });
    }

    const booking = {
      id: randomUUID().slice(0, 8),
      name: cleanName,
      email: cleanEmail,
      date: cleanDate,
      time: cleanTime,
      guests: Math.min(Math.max(parseInt(guests) || 1, 1), 12),
      zone: zone === "quiet" ? "quiet" : "main",
      note: cleanNote || undefined,
      createdAt: new Date().toISOString(),
    };

    // Persist
    const db = readDB();
    db.unshift(booking);
    writeDB(db.slice(0, 500));

    // Send emails
    let emailSent = false;
    let usedFallback = false;

    const sendViaApi = async () => {
      const apiKey = process.env.EMAIL_API_KEY;
      if (!apiKey) throw new Error("No EMAIL_API_KEY configured");

      const fromEmail = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || "darkintestmail@gmail.com";

      const sendOne = async (to, subject, html) => {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { email: fromEmail, name: "Purrfect Cups" },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Brevo API ${res.status}: ${text}`);
        }
      };

      const mail = buildConfirmationEmail(booking);
      await sendOne(booking.email, mail.subject, mail.html);

      const staffMail = process.env.STAFF_EMAIL;
      if (staffMail && staffMail !== booking.email) {
        const notice = buildStaffNotificationEmail(booking);
        await sendOne(staffMail, notice.subject, notice.html);
      }
    };

    try {
      // Try SMTP first (works locally), fallback to Brevo API (works on Render)
      const t = await getTransporter();
      const fa = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || "darkintestmail@gmail.com";
      const from = `${process.env.MAIL_FROM_NAME || "Purrfect Cups"} <${fa}>`;
      await t.sendMail({ from, to: booking.email, ...buildConfirmationEmail(booking) });
      if (process.env.STAFF_EMAIL) {
        await t.sendMail({ from, to: process.env.STAFF_EMAIL, ...buildStaffNotificationEmail(booking) });
      }
      emailSent = true;
    } catch (smtpErr) {
      console.error("SMTP failed:", smtpErr.message);
      try {
        await sendViaApi();
        emailSent = true;
        usedFallback = true;
        console.log("Email sent via Brevo API");
      } catch (apiErr) {
        console.error("API also failed:", apiErr.message);
      }
    }

    return res.json({
      ok: true,
      booking: stripSensitive(booking),
      emailSent,
      emailFallback: usedFallback,
    });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List bookings (admin only)
app.get("/api/bookings", adminAuth, (_req, res) => {
  const db = readDB();
  res.json(db.slice(0, 100).map(stripSensitive));
});

function stripSensitive(b) {
  return { id: b.id, name: b.name, date: b.date, time: b.time, guests: b.guests, zone: b.zone, note: b.note, createdAt: b.createdAt };
}

// Serve uploaded images
app.use("/uploads", express.static(UPLOADS_DIR));

// Create review
app.post("/api/reviews", (req, res, next) => {
  upload.single("image")(req, res, (uploadErr) => {
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError) {
        if (uploadErr.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Image must be under 2 MB." });
        return res.status(400).json({ error: `Upload error: ${uploadErr.message}` });
      }
      return res.status(400).json({ error: uploadErr.message });
    }
    next();
  });
}, (req, res) => {
  try {
    const { name, source, stars, text } = req.body;

    const cleanName = sanitizeStr(name, 60) || "Anonymous";
    const cleanSource = sanitizeStr(source, 60) || "Guest";
    const cleanText = sanitizeStr(text, 1000);
    const cleanStars = Math.min(Math.max(parseInt(stars) || 5, 1), 5);

    if (!cleanText) {
      return res.status(400).json({ error: "Review text is required." });
    }

    const review = {
      id: randomUUID().slice(0, 8),
      name: cleanName,
      source: cleanSource,
      stars: cleanStars,
      text: cleanText,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
      createdAt: new Date().toISOString(),
    };

    const db = readReviewsDB();
    db.unshift(review);
    writeReviewsDB(db.slice(0, 200));

    return res.json({ ok: true, review });
  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List reviews
app.get("/api/reviews", (_req, res) => {
  const db = readReviewsDB();
  res.json(db.slice(0, 100));
});

// Serve built frontend for non-API routes (production / Render)
const DIST_DIR = join(__dirname, "..", "dist");
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(join(DIST_DIR, "index.html"));
  });
}

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Purrfect Cups server running on http://localhost:${PORT}\n`);
});
