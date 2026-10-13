import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");
const DIST = path.join(__dirname, "..", "dist");
const PROD = process.env.NODE_ENV === "production" || process.argv.includes("--production");
const PORT = Number(process.env.PORT) || 3000;

// --- load .env without extra dependencies ---
const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const GUEST_CODE = process.env.GUEST_CODE || "";
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!ADMIN_PASSWORD && !PROD) {
  ADMIN_PASSWORD = crypto.randomBytes(24).toString("base64url");
  console.warn(`ADMIN_PASSWORD is unset; temporary development password: ${ADMIN_PASSWORD}`);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("Set ADMIN_PASSWORD (min 8 chars) in .env before starting.");
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// --- default content (edit in the admin page, not here) ---
const DEFAULTS = {
  name: "Zahwa Rahma Nisa",
  dateLabel: "Selamat ulang tahun ke-21, Zahwa!",
  sub: "Zahwa, hari ini giliran kamu dirayakan. Semoga harimu menyenangkan!",
  portrait: "",
  homeMsg: "Zahwa, selamat ulang tahun ya! Makasih sudah jadi bagian penting di hidupku. Aku senang bisa kenal kamu dan punya banyak momen bareng. Semoga hari ini kamu bisa istirahat, ketawa, makan enak, dan ngerasa disayang. Aku sayang kamu.",
  music: "",
  memories: [
    { src: "", cap: "Salah satu foto favoritku.", date: "" },
    { src: "", cap: "Foto ini selalu bikin aku ikut senyum.", date: "" },
    { src: "", cap: "Senang rasanya bisa punya kenangan ini bareng kamu.", date: "" },
    { src: "", cap: "Kapan-kapan kita foto bareng lagi, ya.", date: "" },
    { src: "", cap: "Satu lagi kenangan yang kusimpan baik-baik.", date: "" },
    { src: "", cap: "Semoga nanti ada banyak foto kita lagi.", date: "" },
  ],
  reasons: [
    "Senyummu. Sering bikin hariku langsung enakan.",
    "Kamu gampang diajak ketawa, bahkan soal hal receh.",
    "Kamu perhatian sama orang-orang di sekitarmu.",
    "Kamu mau dengerin ceritaku, termasuk yang muter-muter.",
    "Ketawamu yang kadang bikin aku ikut ngakak.",
    "Kamu nyaman jadi diri sendiri.",
    "Kamu tetap berusaha meski lagi capek.",
    "Hal-hal kecil yang kamu lakukan buat orang lain.",
    "Kamu selalu punya cara bikin suasana lebih seru.",
    "Ngobrol sama kamu rasanya gampang.",
    "Kamu tetap jalan terus waktu hari lagi berat.",
    "Kamu ingat hal-hal kecil yang orang lain ceritakan.",
    "Aku selalu penasaran sama cerita dan pendapatmu.",
    "Kamu sering bikin aku pengin jadi lebih baik.",
    "Walau lagi jauh, ngobrol sama kamu bikin terasa dekat.",
    "Candaanmu yang suka muncul di waktu yang nggak terduga.",
    "Kamu peduli tanpa perlu banyak omong.",
    "Aku suka dengar cerita soal hal-hal yang lagi kamu usahakan.",
    "Cukup tahu kamu ada saja sudah bikin aku lega.",
    "Banyak kenangan favoritku yang ada kamu di dalamnya.",
    "Ya karena kamu Zahwa. Sesimpel itu, dan aku sayang kamu.",
  ],
  letter: [
    "Zahwa, selamat ulang tahun yang ke-21! Aku nggak jago merangkai kata, jadi aku bilang yang sederhana saja: aku senang banget bisa kenal kamu. Makasih sudah mau berbagi cerita, waktu, dan banyak momen sama aku. Semoga kamu tahu kalau aku sayang dan peduli sama kamu.",
    "Aku suka banyak hal dari kamu, termasuk hal-hal kecil yang mungkin nggak kamu sadari. Makasih sudah jadi teman cerita dan tetap sabar menghadapi aku. Kalau ada hari yang terasa berat, semoga kamu ingat kamu nggak harus menghadapi semuanya sendirian. Aku ada, dan aku selalu dukung kamu.",
    "Semoga di umur 21 ini banyak hal baik datang, tapi semoga kamu juga tetap punya waktu buat istirahat dan menikmati hari-hari biasa. Nggak perlu buru-buru; jalanin saja satu-satu dengan caramu. Sekali lagi, selamat ulang tahun ya. Semoga hari ini menyenangkan. Aku sayang kamu.",
  ],
  signature: "Dari aku, yang sayang kamu",
  gift: { title: "Buat Zahwa", msg: "Ini ada sedikit hadiah buat kamu. Semoga kamu suka, ya. Selamat ulang tahun!", photo: "", links: [] },
  wishes: [
    { t: "Semoga banyak senangnya", m: "Semoga tahun ini ada banyak alasan buat ketawa, ketemu orang-orang baik, dan melakukan hal yang kamu suka. Semoga hari-hari biasa juga terasa menyenangkan." },
    { t: "Semoga urusanmu lancar", m: "Apa pun yang lagi kamu usahakan, semoga pelan-pelan ketemu jalannya. Kalau capek, istirahat dulu juga nggak apa-apa. Aku dukung kamu." },
    { t: "Jangan lupa jaga diri", m: "Semoga kamu nggak lupa makan, tidur cukup, dan kasih waktu buat diri sendiri. Kamu nggak harus selalu kuat atau menyenangkan semua orang." },
    { t: "Semoga dikelilingi orang baik", m: "Semoga kamu selalu punya teman cerita, orang-orang yang bikin nyaman, dan tempat buat pulang saat lagi capek." },
    { t: "Semoga kita sering ketemu", m: "Mudah-mudahan masih banyak waktu buat ngobrol, jalan, makan enak, dan bikin kenangan baru bareng. Nanti kita foto-foto lagi, ya." },
  ],
  hugMsg: "Sini, peluk dulu! Selamat ulang tahun ya, Zahwa. Makasih sudah jadi kamu dan sudah ada di hidupku. Semoga hari ini kamu senang. Aku sayang kamu!",
};

// --- validation: build content only from allowlisted, type-checked fields ---
const str = (v, max, fb = "") => (typeof v === "string" ? v.slice(0, max) : fb);
const media = (v) => {
  const s = str(v, 300);
  return s === "" || /^\/uploads\/[a-f0-9]{24}\.(jpg|png|webp|gif|mp3|m4a|ogg)$/.test(s) || /^https:\/\/[^\s"'<>]+$/.test(s) ? s : "";
};
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

function sanitizeContent(x) {
  const d = DEFAULTS;
  x = x && typeof x === "object" ? x : {};
  const reasons = arr(x.reasons, 21).map((r, i) => str(r, 400).trim() || d.reasons[i]);
  while (reasons.length < 21) reasons.push(d.reasons[reasons.length]);
  const letter = arr(x.letter, 12).map((p) => str(p, 2000)).filter(Boolean);
  const g = x.gift && typeof x.gift === "object" ? x.gift : {};
  return {
    name: str(x.name, 60, d.name) || d.name,
    dateLabel: str(x.dateLabel, 80, d.dateLabel),
    sub: str(x.sub, 200, d.sub),
    portrait: media(x.portrait),
    homeMsg: str(x.homeMsg, 600).trim() || d.homeMsg,
    music: media(x.music),
    memories: arr(x.memories, 24).map((m, i) => ({
      src: media(m?.src),
      cap: str(m?.cap, 160).trim() || d.memories[i % d.memories.length].cap,
      date: str(m?.date, 40),
    })),
    reasons,
    letter: letter.length ? letter : d.letter,
    signature: str(x.signature, 40).trim() || d.signature,
    gift: {
      title: str(g.title, 80).trim() || d.gift.title,
      msg: str(g.msg, 800).trim() || d.gift.msg,
      photo: media(g.photo),
      links: arr(g.links, 5).map((l) => ({ label: str(l?.label, 60), url: /^https:\/\/[^\s"'<>]+$/.test(str(l?.url, 500)) ? l.url : "" })).filter((l) => l.label && l.url),
    },
    wishes: arr(x.wishes, 8).map((w, i) => ({
      t: str(w?.t, 80).trim() || d.wishes[i % d.wishes.length].t,
      m: str(w?.m, 1200).trim() || d.wishes[i % d.wishes.length].m,
    })).filter((w) => w.t),
    hugMsg: str(x.hugMsg, 800).trim() || d.hugMsg,
  };
}

// --- tiny JSON store with atomic writes ---
function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { content: DEFAULTS, opened: [], events: [] }; }
}
let db = loadDb();
db.content = sanitizeContent(db.content);
db.opened = Array.isArray(db.opened) ? db.opened.filter((n) => Number.isInteger(n) && n >= 0 && n < 21) : [];
db.events = Array.isArray(db.events) ? db.events : [];
function save() {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// --- signed cookies ---
const sign = (v) => crypto.createHmac("sha256", SECRET).update(v).digest("hex");
const safeEq = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
function issue(res, role, hours) {
  const exp = Date.now() + hours * 3600e3;
  const v = `${role}.${exp}`;
  res.setHeader("Set-Cookie", `${role}=${v}.${sign(v)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${hours * 3600}${PROD ? "; Secure" : ""}`);
}
function has(req, role) {
  const m = (req.headers.cookie || "").split(/;\s*/).find((c) => c.startsWith(role + "="));
  if (!m) return false;
  const parts = m.slice(role.length + 1).split(".");
  if (parts.length !== 3 || parts[0] !== role) return false;
  return safeEq(parts[2], sign(`${parts[0]}.${parts[1]}`)) && Number(parts[1]) > Date.now();
}

// --- basic rate limit (per IP, per route group) ---
const hits = new Map();
const limit = (name, max, windowMs) => (req, res, next) => {
  const k = `${name}:${req.ip}`, now = Date.now();
  const h = (hits.get(k) || []).filter((t) => now - t < windowMs);
  if (h.length >= max) return res.status(429).json({ error: "Too many attempts. Try again later." });
  h.push(now); hits.set(k, h); next();
};

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(express.json({ limit: "200kb" }));

const requireAdmin = (req, res, next) => (has(req, "admin") ? next() : res.status(401).json({ error: "Admin login required." }));
const guestOk = (req) => !GUEST_CODE || has(req, "admin") || has(req, "guest");
const requireGuest = (req, res, next) => (guestOk(req) ? next() : res.status(401).json({ error: "locked" }));

// --- public (guest-gated) ---
app.get("/api/status", (req, res) => res.json({ locked: !guestOk(req) }));
app.post("/api/unlock", limit("unlock", 8, 10 * 60e3), (req, res) => {
  if (GUEST_CODE && safeEq(str(req.body?.code, 100), GUEST_CODE)) { issue(res, "guest", 24 * 30); return res.json({ ok: true }); }
  res.status(401).json({ error: "That code isn't right." });
});
app.get("/api/content", requireGuest, (req, res) => res.json({ content: db.content, opened: db.opened }));
app.post("/api/event", requireGuest, limit("event", 120, 60e3), (req, res) => {
  const type = str(req.body?.type, 30);
  const ok = ["visit", "reason", "letter_done", "gift_opened", "hug"];
  if (!ok.includes(type)) return res.status(400).json({ error: "Unknown event." });
  if (type === "reason") {
    const n = req.body?.n;
    if (!Number.isInteger(n) || n < 0 || n > 20) return res.status(400).json({ error: "Bad index." });
    if (!db.opened.includes(n)) db.opened.push(n);
  }
  if (!has(req, "admin")) { // your own previews are not logged
    db.events.push({ type, n: type === "reason" ? req.body.n : undefined, at: new Date().toISOString() });
    if (db.events.length > 500) db.events = db.events.slice(-500);
  }
  save();
  res.json({ ok: true });
});

// --- admin ---
app.post("/api/admin/login", limit("login", 6, 10 * 60e3), (req, res) => {
  if (safeEq(str(req.body?.password, 200), ADMIN_PASSWORD)) { issue(res, "admin", 12); return res.json({ ok: true }); }
  res.status(401).json({ error: "Wrong password." });
});
app.post("/api/admin/logout", (req, res) => {
  res.setHeader("Set-Cookie", "admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.json({ ok: true });
});
app.get("/api/admin/me", (req, res) => res.json({ admin: has(req, "admin") }));
app.put("/api/admin/content", requireAdmin, (req, res) => {
  db.content = sanitizeContent(req.body);
  save();
  res.json({ content: db.content });
});
app.post("/api/admin/reset-progress", requireAdmin, (req, res) => { db.opened = []; db.events = []; save(); res.json({ ok: true }); });
app.get("/api/admin/events", requireAdmin, (req, res) => res.json({ events: db.events.slice(-100).reverse(), opened: db.opened }));

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg" };
app.post("/api/admin/upload", requireAdmin, express.raw({ type: Object.keys(TYPES), limit: "15mb" }), (req, res) => {
  const ext = TYPES[(req.headers["content-type"] || "").split(";")[0]];
  if (!ext || !Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: "Upload a JPG, PNG, WebP, GIF, MP3, M4A or OGG file (max 15 MB)." });
  const name = crypto.randomBytes(12).toString("hex") + "." + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), req.body);
  res.json({ url: "/uploads/" + name });
});

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", index: false, dotfiles: "deny" }));

if (PROD && fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(DIST, "index.html")));
}

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.status === 413 ? "File too large." : "Something went wrong." });
});

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT} ${PROD ? "(production)" : "(dev: open http://localhost:5173)"}`));
