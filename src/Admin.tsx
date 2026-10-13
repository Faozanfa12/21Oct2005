import { useEffect, useState } from "react";
import { api } from "./api";
import type { Content } from "./types";

type Log = { events: { type: string; n?: number; at: string }[]; opened: number[] };

function Up({ value, onChange, accept }: { value: string; onChange: (v: string) => void; accept: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="ad-up">
      <input value={value} placeholder="Upload a file, or paste an https:// link" onChange={(e) => onChange(e.target.value)} />
      <label className="btn ghost sm">
        {busy ? "Uploading…" : "Upload"}
        <input type="file" hidden accept={accept} onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true); setErr("");
          try { onChange(await api.upload(f)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); e.target.value = ""; }
        }} />
      </label>
      {value && accept.startsWith("image") && <img src={value} alt="" className="ad-thumb" />}
      {err && <small className="err">{err}</small>}
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="ad-f"><span>{label}</span>{children}</label>
);

export default function Admin() {
  const [state, setState] = useState<"loading" | "login" | "edit">("loading");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [c, setC] = useState<Content | null>(null);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState<Log | null>(null);

  const loadAll = async () => {
    const r = await api.content();
    setC(r.content); setState("edit");
    api.events().then(setLog).catch(() => {});
  };
  useEffect(() => {
    api.adminMe().then((r) => (r.admin ? loadAll() : setState("login"))).catch(() => setState("login"));
  }, []);

  const login = async () => {
    try { await api.login(pw); setErr(""); setPw(""); await loadAll(); }
    catch (e) { setErr((e as Error).message); }
  };
  const save = async () => {
    if (!c) return;
    setMsg("Saving…");
    try { const r = await api.save(c); setC(r.content); setMsg("Saved."); }
    catch (e) { setMsg((e as Error).message); }
  };
  const set = <K extends keyof Content>(k: K, v: Content[K]) => setC((p) => (p ? { ...p, [k]: v } : p));
  const setAt = <T,>(list: T[], i: number, v: T) => list.map((x, j) => (j === i ? v : x));
  const drop = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);

  if (state === "loading") return <main className="ad"><p>…</p></main>;
  if (state === "login" || !c) {
    return (
      <main className="ad">
        <h1>Editor</h1>
        <Field label="Admin password">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") login(); }} />
        </Field>
        <button className="btn" onClick={login}>Sign in</button>
        {err && <p className="err" role="alert">{err}</p>}
      </main>
    );
  }

  return (
    <main className="ad">
      <div className="ad-bar">
        <h1>Editor</h1>
        <div>
          <a className="btn ghost sm" href="/" target="_blank" rel="noopener noreferrer">Preview site</a>{" "}
          <button className="btn sm" onClick={save}>Save changes</button>{" "}
          <button className="btn ghost sm" onClick={async () => { await api.logout(); setState("login"); }}>Sign out</button>
          <div className="ad-msg" role="status">{msg}</div>
        </div>
      </div>

      <h2>Basics</h2>
      <Field label="Her name or nickname"><input value={c.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Date line"><input value={c.dateLabel} onChange={(e) => set("dateLabel", e.target.value)} /></Field>
      <Field label="Opening subtitle"><input value={c.sub} onChange={(e) => set("sub", e.target.value)} /></Field>
      <Field label="Opening portrait"><Up accept="image/*" value={c.portrait} onChange={(v) => set("portrait", v)} /></Field>
      <Field label="Home message"><textarea rows={3} value={c.homeMsg} onChange={(e) => set("homeMsg", e.target.value)} /></Field>
      <Field label="Background music (MP3, M4A or OGG; leave empty for none)"><Up accept="audio/*" value={c.music} onChange={(v) => set("music", v)} /></Field>

      <h2>Our memories</h2>
      {c.memories.map((m, i) => (
        <div className="ad-card" key={i}>
          <Up accept="image/*" value={m.src} onChange={(v) => set("memories", setAt(c.memories, i, { ...m, src: v }))} />
          <input placeholder="Caption" value={m.cap} onChange={(e) => set("memories", setAt(c.memories, i, { ...m, cap: e.target.value }))} />
          <input placeholder="Date (optional)" value={m.date} onChange={(e) => set("memories", setAt(c.memories, i, { ...m, date: e.target.value }))} />
          <button className="btn ghost sm" onClick={() => set("memories", drop(c.memories, i))}>Remove</button>
        </div>
      ))}
      {c.memories.length < 24 && <button className="btn ghost sm" onClick={() => set("memories", [...c.memories, { src: "", cap: "", date: "" }])}>Add memory</button>}

      <h2>21 things I love about you</h2>
      {c.reasons.map((r, i) => (
        <Field key={i} label={`Reason ${i + 1}`}>
          <input value={r} onChange={(e) => set("reasons", setAt(c.reasons, i, e.target.value))} />
        </Field>
      ))}

      <h2>Letter (one paragraph per box)</h2>
      {c.letter.map((p, i) => (
        <div className="ad-card" key={i}>
          <textarea rows={4} value={p} onChange={(e) => set("letter", setAt(c.letter, i, e.target.value))} />
          {c.letter.length > 1 && <button className="btn ghost sm" onClick={() => set("letter", drop(c.letter, i))}>Remove</button>}
        </div>
      ))}
      {c.letter.length < 12 && <button className="btn ghost sm" onClick={() => set("letter", [...c.letter, ""])}>Add paragraph</button>}
      <Field label="Signature"><input value={c.signature} onChange={(e) => set("signature", e.target.value)} /></Field>

      <h2>Gift</h2>
      <Field label="Title"><input value={c.gift.title} onChange={(e) => set("gift", { ...c.gift, title: e.target.value })} /></Field>
      <Field label="Message"><textarea rows={3} value={c.gift.msg} onChange={(e) => set("gift", { ...c.gift, msg: e.target.value })} /></Field>
      <Field label="Photo"><Up accept="image/*" value={c.gift.photo} onChange={(v) => set("gift", { ...c.gift, photo: v })} /></Field>
      {c.gift.links.map((l, i) => (
        <div className="ad-card" key={i}>
          <input placeholder="Button label" value={l.label} onChange={(e) => set("gift", { ...c.gift, links: setAt(c.gift.links, i, { ...l, label: e.target.value }) })} />
          <input placeholder="https://…" value={l.url} onChange={(e) => set("gift", { ...c.gift, links: setAt(c.gift.links, i, { ...l, url: e.target.value }) })} />
          <button className="btn ghost sm" onClick={() => set("gift", { ...c.gift, links: drop(c.gift.links, i) })}>Remove</button>
        </div>
      ))}
      {c.gift.links.length < 5 && <button className="btn ghost sm" onClick={() => set("gift", { ...c.gift, links: [...c.gift.links, { label: "", url: "" }] })}>Add link</button>}

      <h2>Chapter 21 wishes</h2>
      {c.wishes.map((w, i) => (
        <div className="ad-card" key={i}>
          <input placeholder="Title" value={w.t} onChange={(e) => set("wishes", setAt(c.wishes, i, { ...w, t: e.target.value }))} />
          <textarea rows={3} placeholder="Longer message" value={w.m} onChange={(e) => set("wishes", setAt(c.wishes, i, { ...w, m: e.target.value }))} />
          <button className="btn ghost sm" onClick={() => set("wishes", drop(c.wishes, i))}>Remove</button>
        </div>
      ))}
      {c.wishes.length < 8 && <button className="btn ghost sm" onClick={() => set("wishes", [...c.wishes, { t: "", m: "" }])}>Add wish</button>}

      <h2>Final message</h2>
      <Field label="Shown after the hug"><textarea rows={3} value={c.hugMsg} onChange={(e) => set("hugMsg", e.target.value)} /></Field>

      <h2>Activity</h2>
      <p>Reasons opened so far: {log ? log.opened.length : "–"} of 21. Your own visits while signed in are not recorded.</p>
      <button className="btn ghost sm" onClick={() => api.events().then(setLog)}>Refresh</button>{" "}
      <button className="btn ghost sm" onClick={async () => { await api.resetProgress(); setLog(await api.events()); }}>Reset progress and log</button>
      <ul className="ad-log">
        {log?.events.map((e, i) => (
          <li key={i}>{new Date(e.at).toLocaleString()} — {e.type === "reason" ? `opened reason ${(e.n ?? 0) + 1}` : e.type.replace("_", " ")}</li>
        ))}
      </ul>
      <div className="ad-bar"><button className="btn" onClick={save}>Save changes</button><div className="ad-msg">{msg}</div></div>
    </main>
  );
}
