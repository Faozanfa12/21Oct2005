import type { Content } from "./types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { credentials: "same-origin", ...init });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error || "Request failed"), { status: r.status });
  return body as T;
}
const json = (method: string, data: unknown): RequestInit => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
});

export const api = {
  status: () => req<{ locked: boolean }>("/api/status"),
  unlock: (code: string) => req<{ ok: true }>("/api/unlock", json("POST", { code })),
  content: () => req<{ content: Content; opened: number[] }>("/api/content"),
  event: (type: string, n?: number) => { fetch("/api/event", { ...json("POST", { type, n }), credentials: "same-origin" }).catch(() => {}); },
  adminMe: () => req<{ admin: boolean }>("/api/admin/me"),
  login: (password: string) => req<{ ok: true }>("/api/admin/login", json("POST", { password })),
  logout: () => req<{ ok: true }>("/api/admin/logout", { method: "POST" }),
  save: (c: Content) => req<{ content: Content }>("/api/admin/content", json("PUT", c)),
  events: () => req<{ events: { type: string; n?: number; at: string }[]; opened: number[] }>("/api/admin/events"),
  resetProgress: () => req<{ ok: true }>("/api/admin/reset-progress", { method: "POST" }),
  upload: async (file: File) => {
    const r = await req<{ url: string }>("/api/admin/upload", { method: "POST", headers: { "Content-Type": file.type }, body: file });
    return r.url;
  },
};
