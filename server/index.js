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
  dateLabel: "Di hari istimewamu, semua doa baik mengarah padamu.",
  sub: "Untuk Zahwa Rahma Nisa, rumah bagi banyak bahagiaku dan alasan sederhana di balik senyumku.",
  portrait: "",
  homeMsg: "Zahwa, semoga kamu tahu betapa berharganya dirimu. Kehadiranmu membuat hari-hari biasa terasa lebih hangat, dan dunia yang ramai terasa lebih tenang. Hari ini adalah tentangmu—tentang senyummu, hatimu yang indah, dan semua kebahagiaan yang pantas kamu terima. Selamat ulang tahun, sayang.",
  music: "",
  memories: [
    { src: "", cap: "Di dekatmu, momen sederhana selalu terasa istimewa.", date: "" },
    { src: "", cap: "Senyummu adalah bagian favoritku dari hari yang panjang.", date: "" },
    { src: "", cap: "Kalau waktu bisa berhenti, aku ingin menyimpan lebih banyak momen seperti ini.", date: "" },
    { src: "", cap: "Bersamamu, hal kecil pun berubah menjadi kenangan yang ingin kuulang.", date: "" },
    { src: "", cap: "Ada tenang yang selalu kutemukan setiap kali mengingatmu.", date: "" },
    { src: "", cap: "Semoga masih banyak cerita indah yang akan kita kenang bersama.", date: "" },
  ],
  reasons: [
    "Senyummu yang selalu berhasil membuat hariku terasa lebih baik.",
    "Caramu membuat momen sederhana terasa begitu istimewa.",
    "Hatimu yang lembut dan penuh perhatian.",
    "Caramu mendengarkan, bahkan saat aku belum tahu bagaimana menjelaskan perasaanku.",
    "Tawamu yang selalu ingin kudengar sekali lagi.",
    "Caramu menjadi dirimu sendiri—indah tanpa perlu berpura-pura.",
    "Semangatmu untuk terus melangkah dan tumbuh.",
    "Kebaikan kecil yang kamu berikan dengan tulus.",
    "Caramu membawa kehangatan ke mana pun kamu berada.",
    "Tatapanmu yang bisa membuat dunia terasa lebih tenang.",
    "Keberanianmu menghadapi hari-hari yang tidak selalu mudah.",
    "Caramu menghargai hal-hal kecil di sekitarmu.",
    "Pikiran dan cerita-ceritamu yang selalu ingin kudengar.",
    "Caramu membuatku ingin menjadi pribadi yang lebih baik.",
    "Kehadiranmu yang membuat jarak terasa lebih dekat.",
    "Sisi manis dan lucumu yang selalu membuatku tersenyum.",
    "Caramu peduli, bahkan lewat hal-hal sederhana.",
    "Mimpi-mimpi indah yang terus kamu perjuangkan.",
    "Ketenangan yang hadir hanya dengan mengetahui kamu ada.",
    "Setiap kenangan yang menjadi lebih berarti karena ada kamu di dalamnya.",
    "Karena kamu adalah Zahwa—seseorang yang kusyukuri telah hadir di hidupku.",
  ],
  letter: [
    "Untuk Zahwa Rahma Nisa, seseorang yang namanya selalu terasa hangat di hatiku. Di hari ulang tahunmu ini, aku ingin mengingatkanmu bahwa kamu sangat berharga—bukan hanya karena hal-hal indah yang kamu lakukan, tetapi karena dirimu sendiri. Cara kamu tersenyum, bercerita, peduli, dan menjalani hari dengan caramu yang khas membuat hidupku terasa lebih berwarna. Aku bersyukur setiap kali semesta mempertemukan langkahku denganmu.",
    "Terima kasih sudah menjadi dirimu: kuat saat keadaan menantang, lembut kepada orang-orang yang kamu sayangi, dan tetap punya cahaya bahkan di hari yang melelahkan. Semoga kamu selalu dikelilingi hal-hal yang membuat hatimu lega. Saat kamu meragukan diri sendiri, ingatlah bahwa ada seseorang yang melihat begitu banyak kebaikan dan keindahan dalam dirimu. Aku ingin terus belajar memahami, menghargai, dan menyayangimu dengan tulus.",
    "Selamat ulang tahun ke-21, sayang. Semoga babak baru ini membawa kesehatan, ketenangan, kesempatan baik, dan mimpi-mimpi yang perlahan menjadi nyata. Tak perlu terburu-buru menjadi siapa-siapa; berjalanlah dengan waktumu sendiri, dan jangan lupa menikmati setiap langkah. Semoga hari ini membuatmu merasa dicintai sebesar cintamu yang kamu berikan kepada dunia. Jika aku boleh memilih lagi, aku tetap ingin mengenalmu dan merayakan banyak hari bahagia bersamamu. Dengan seluruh sayangku, selalu.",
  ],
  signature: "Dengan seluruh sayangku",
  gift: { title: "Sebuah hadiah kecil untuk Zahwa", msg: "Hadiah ini mungkin sederhana, tetapi kuberikan dengan sepenuh hati. Semoga setiap kali melihatnya, kamu ingat bahwa ada seseorang yang selalu ingin melihatmu bahagia. Selamat ulang tahun, Zahwa sayang.", photo: "", links: [] },
  wishes: [
    { t: "Kebahagiaan yang selalu menemukanmu", m: "Semoga kebahagiaan datang kepadamu bukan hanya pada hari istimewa, tetapi juga dalam hal-hal kecil: pagi yang terasa ringan, kabar baik yang tak terduga, tawa bersama orang tersayang, dan malam yang membuatmu tidur dengan hati tenang. Kamu pantas mendapatkan bahagia yang lembut, tulus, dan berulang kali." },
    { t: "Mimpi-mimpi yang menjadi nyata", m: "Semoga setiap mimpi yang kamu rawat menemukan jalannya. Saat perjalanan terasa panjang, semoga kamu tetap percaya pada kemampuanmu dan tidak lupa beristirahat. Aku akan selalu bangga melihatmu berusaha, dan bahagia menyaksikan satu demi satu hal baik datang menghampirimu." },
    { t: "Dirimu yang terus bertumbuh", m: "Semoga di usia yang baru ini kamu makin mengenal dirimu, makin berani memilih hal yang membuatmu damai, dan makin lembut kepada diri sendiri. Kamu tidak harus sempurna untuk dicintai. Kamu sudah cukup, tepat sebagai dirimu hari ini, sambil tetap bertumbuh dengan indah." },
    { t: "Hari-hari indah yang menantimu", m: "Semoga jalan di depanmu dipenuhi kesempatan baik, orang-orang yang tulus, pengalaman yang membuka hati, dan keberanian untuk mencoba hal baru. Bila ada hari yang berat, semoga kamu selalu menemukan alasan untuk bertahan dan seseorang yang siap menemanimu melewatinya." },
    { t: "Cerita-cerita yang akan kita kenang", m: "Semoga kita masih diberi banyak kesempatan untuk berbagi cerita, tertawa karena hal sederhana, saling menguatkan, dan mengumpulkan kenangan yang kelak membuat kita tersenyum. Aku tak sabar menyambut bab-bab indah berikutnya, satu hari dan satu momen pada satu waktu." },
  ],
  hugMsg: "Peluk jauh yang paling hangat untukmu, Zahwa. Terima kasih sudah hadir dan membuat hidupku lebih indah. Semoga kamu selalu ingat: kamu dicintai, kamu berharga, dan aku selalu mendoakan yang terbaik untukmu. Selamat ulang tahun, sayangku.",
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
