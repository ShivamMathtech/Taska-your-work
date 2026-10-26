# Vercel deployment

## Before you deploy

Install Node 24, extract the ZIP, and run `npm ci` followed by `npm run check` inside `taska-react`. Commit the source, `package.json`, `package-lock.json`, and `vercel.json` to a Git repository. Do not commit `node_modules`, `.env.local`, or `.vercel`.

## Import the Git repository

1. In Vercel, choose **Add New → Project** and import your repository.
2. Set **Root Directory** to the folder containing `package.json`. If you committed the contents of `taska-react` directly at the repository root, leave this at the root. If you committed the enclosing folder, select `taska-react`.
3. Select the **Vite** framework preset.
4. Use **Install command:** `npm ci`, **Build command:** `npm run build`, **Output directory:** `dist`, and **Node.js version:** `24.x`.
5. Leave environment variables empty. The app uses browser-local demo data.
6. Deploy. Open the deployment URL, create a task, and refresh the page to check local persistence.
7. Visit `/projects` and `/calendar` directly and refresh. The included SPA rewrite should serve the app on those routes.

No API endpoint needs to be reachable. A new browser starts with its own sample workspace. A visitor's data stays under that deployment's origin. Switching from a preview URL to a custom domain uses separate browser storage; use Settings → Data & backup to move a workspace.

## Optional Vercel CLI route

With the official Vercel CLI installed and signed in, run `vercel` from this project folder for a preview deployment and follow its prompts. Run `vercel --prod` when ready for production. This project does not include any credentials or create a deployment on its own.

## Configuration

`vercel.json` selects Vite, builds to `dist`, and rewrites app routes to `/index.html`. Static assets remain handled by Vercel. If you later add server routes, revisit the catch-all so your API routes are preserved before the SPA fallback.

The deployment needs no runtime environment variables. Adding an arbitrary `VITE_API_URL` will not connect a backend: implement the adapter described in the backend guide first. Anything prefixed with `VITE_` is bundled into public client code; do not put secrets there.

## Troubleshooting

| Symptom                                | Fix                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Cannot find `package.json`             | Select the correct Root Directory.                                                                         |
| Unsupported Node version               | Use Node 24.x; minimum supported is 22.12.                                                                 |
| Build reports missing modules          | Use `npm ci`; keep `package-lock.json` committed.                                                          |
| Native package / platform mismatch     | Remove a copied `node_modules` folder and reinstall with `npm ci` on the target machine.                   |
| Direct routes return 404               | Ensure `vercel.json` is in the selected project root.                                                      |
| Blank screen from a local file         | Use `npm run dev` or `npm run preview`; do not open `index.html` through `file://`.                        |
| Old sample data or your changes appear | Browser storage persists intentionally; Settings → Data & backup → Reset demo restores the examples.       |
| Different browsers show different data | Expected in demo mode. Export/import a backup, or implement a shared backend.                              |
| Data doesn't survive refresh           | Check the visible storage warning, browser site-data restrictions, and available storage; export a backup. |

Official references: [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite) and [Vite static deployment guide](https://vite.dev/guide/static-deploy).
