# Birthday site (React + TypeScript + Vite + Express)

## Run it
1. Install Node.js 18+.
2. `npm install`
3. Optionally copy `.env.example` to `.env` and set `ADMIN_PASSWORD` (8+ characters) and `SESSION_SECRET`.
   Without `.env`, development generates a temporary admin password and prints it in the server console.
   Optional: set `GUEST_CODE` so she must enter a code before anything appears.
4. Run `npm run dev`, then open http://localhost:5173
5. Open http://localhost:5173/#admin to edit everything and upload photos and music.

## Deploy on GitHub Pages
The GitHub Actions workflow builds and deploys the static site whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. After the workflow completes, the site is available at `https://<owner>.github.io/21Oct2005/`.

The Pages version reads its public content from `public/content.json` and media from `public/uploads/`. It does not run the Express API, so the admin editor, guest-code gate, uploads, and activity log are unavailable. Update the JSON and media files in the repository and push to publish content changes. Anyone can access the site and its published content.

To use the admin editor and backend features, deploy the Node/Express app to a host that supports server-side applications instead of GitHub Pages.

## Structure
- `server/index.js` API, admin login, uploads, activity log (only dependency: express)
- `src/views/` one file per page; `src/Admin.tsx` the editor; `src/api.ts` API client
