# 🐱 Purrfect Cups

> Cat café & lounge — Veszprém, Hungary  
> **[purrcups.onrender.com](https://purrcups.onrender.com)**

---

## what is this

a full-stack cat café website with table reservations, email confirmations, and guest reviews with image upload. built for a friend's imaginary café in Veszprém because Budapest gets all the love.

---

## features

**📅 booking** — pick a zone (Main Lounge or Quiet Purr Zone), pick a time, get an email confirmation. works locally, on render the email silently fails because they block smtp ports.

**⭐ reviews** — guests can leave a star rating, write something nice, and attach a photo of their visit. paginated 4 per page in a 2-column grid. photos on the left side of each card.

**🖼️ image upload** — jpeg/png/webp/gif/avif only, max 2mb. validated on both client and server. stored in `server/uploads/`.

**🔒 security stuff** — rate limiting (20/min bookings, 5/min reviews), html sanitization, escaped email templates, admin auth on the booking list endpoint.

---

## stack

| thing | what |
|---|---|
| frontend | react 19, typescript, vite, tailwind 4, framer motion |
| backend | node.js, express 4 |
| email | nodemailer + gmail app password |
| uploads | multer v1 |
| hosting | render (single service) |

---

## running locally

```bash
# server
cd server
cp .env.example .env   # add your gmail app password
npm install
npm run dev            # :3001

# frontend (new terminal)
cd ..
npm install
npm run dev            # :5173
```

---

## deploy notes

render build command:

```
cd server && npm install && cd .. && npm install && npm run build
```

start command:

```
cd server && node index.js
```

env vars needed: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_PASS`

⚠️ render blocks all smtp ports (25, 465, 587) on free tier. email sending will fail there silently. bookings still save fine. if you want real email in production, switch to brevo/sendgrid http api.

---

## why

because cat cafés are nice and i wanted a portfolio project that wasn't another todo app.

---

*purrfect cups — 8200 Veszprém, Csikász Imre utca 2/B*
