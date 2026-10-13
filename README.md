# Birthday site (React + TypeScript + Vite + Express)

## Run it
1. Install Node.js 18+.
2. `npm install`
3. Optionally copy `.env.example` to `.env` and set `ADMIN_PASSWORD` (8+ characters) and `SESSION_SECRET`.
   Without `.env`, development generates a temporary admin password and prints it in the server console.
   Optional: set `GUEST_CODE` so she must enter a code before anything appears.
4. Run `npm run dev`, then open http://localhost:5173
5. Open http://localhost:5173/#admin to edit everything and upload photos and music.

## Put it online
Set `ADMIN_PASSWORD` (8+ characters) and `SESSION_SECRET` in `.env` or the host environment, then run
`npm run build` and `npm start` (serves the built site and the API on PORT, default 3000).
Deploy to any host that runs Node (Render, Railway, Fly.io, a VPS). Use HTTPS and keep `.env` out of git.
Content and the activity log live in `server/data/db.json`; uploads live in `server/uploads/`.
Back up both folders. On hosts with a temporary disk, attach a persistent volume to `server/data` and `server/uploads`.

## Structure
- `server/index.js` API, admin login, uploads, activity log (only dependency: express)
- `src/views/` one file per page; `src/Admin.tsx` the editor; `src/api.ts` API client
