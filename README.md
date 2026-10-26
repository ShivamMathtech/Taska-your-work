# Taska — your work, in flow

A complete React + Vite task management demo, inspired by the supplied Taska UI reference. It runs immediately without a backend, API keys, database, or sign-in service. Projects, tasks, messages, and preferences are saved in the current browser.

## Start here

1. Extract the ZIP. Open the `taska-react` folder containing `package.json`.
2. Install Node.js 24 LTS (Node 22.12 or newer is required).
3. Open a terminal in that folder and run:

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite, normally `http://localhost:5173`.

**Windows:** double-click `setup.cmd` once, then `start.cmd`. The scripts use `npm ci` to install dependencies for your own operating system. `node_modules` is intentionally not bundled. You can also use the terminal commands above in PowerShell or Command Prompt.

Do not double-click `index.html`. This is a React app that needs the development server or a static host.

## What works

- Dashboard with live project/task statistics, recent activity, deadlines, and personal task views.
- Projects: create, edit, favorite, archive, delete, search, sort, and switch grid/list views.
- Tasks: create, edit, delete, assign, prioritize, tag, schedule, complete/reopen, filter, and export CSV.
- Kanban boards with desktop drag-and-drop and native status selectors for keyboard/touch use.
- Task checklists and local comments with persistent history.
- Monthly calendar with selected-day agenda and quick task creation.
- Demo team management and local messaging with outgoing-message deletion.
- Analytics calculated from workspace data, with a downloadable JSON report.
- Profile/workspace settings, light/dark/system themes, and compact task rows.
- Search with Ctrl/Cmd+K, activity notifications, welcome screen, and a help guide.
- JSON backup export/import with schema validation and confirmation, plus reset to sample data.
- Responsive mobile navigation and dialogs with focus trapping, Escape dismissal, and focus restoration.

The initial workspace includes 6 projects, 32 tasks, and 6 demo members. Dates are relative to the first launch. Your changes survive refreshes on the same origin/browser. Different visitors receive separate workspaces. Tabs on the same origin synchronize via storage events; simultaneous edits use last-write-wins.

## Deploy to Vercel

Push the project to a Git repository and import it into Vercel. Select the directory containing `package.json` as the Root Directory.

| Setting               | Value           |
| --------------------- | --------------- |
| Framework preset      | Vite            |
| Install command       | `npm ci`        |
| Build command         | `npm run build` |
| Output directory      | `dist`          |
| Node.js version       | 24.x            |
| Environment variables | None required   |

`vercel.json` already configures the build output, SPA route fallback, and basic response headers. The demo remains usable after deployment without a backend. See [the deployment guide](docs/VERCEL_DEPLOYMENT.md) for detailed steps and troubleshooting.

This archive is deployable source; it has not been deployed into your Vercel account.

## Build and checks

```bash
npm test             # 14 data/model tests
npm run build       # production bundle in dist/
npm run preview     # serve the production bundle locally
npm run check       # tests followed by build
```

The archive includes a generated `dist/` for convenience. Rebuild after changing source. Vercel builds from the source automatically.

## Demo scope

There is no remote API in this version. No backend configuration is required or attempted, so a missing backend cannot prevent the UI from running. The welcome/profile screen is a local demo profile, not authentication. Team members are local records; adding one sends no invitation. Messages/comments are local and are not delivered to another person. Activity notifications are in-app records, not browser push notifications.

Browser storage is not a shared database. Clearing site data removes it; export a backup first. If storage is unavailable, the app continues in memory and displays a warning. If a saved backup is corrupt, the app preserves the stored value and runs a temporary workspace until you explicitly reset or import valid data. The app does not provide service-worker offline loading; the site must load before its local interactions are available.

To add genuine authentication, shared data, and real-time messaging, see [backend integration](docs/BACKEND_INTEGRATION.md). No backend service is included or silently simulated as an online service.

## Source map

| File                       | Responsibility                                             |
| -------------------------- | ---------------------------------------------------------- |
| `src/App.jsx`              | Layout, navigation, routes, dialogs, search, notifications |
| `src/WorkPages.jsx`        | Dashboard, projects, boards, tasks, calendar               |
| `src/WorkspacePages.jsx`   | Team, messaging, analytics, settings, welcome              |
| `src/Dialogs.jsx`          | Project/task/member editors and help                       |
| `src/UI.jsx`               | Reusable accessible UI components and download helper      |
| `src/Workspace.jsx`        | React state, browser persistence, theme, toasts            |
| `src/model.mjs`            | Reducer, validation, filtering, CSV, dates, IDs            |
| `src/seed.mjs`             | Demo workspace data                                        |
| `src/styles.css`           | Responsive design, local font, themes                      |
| `tests/workspace.test.mjs` | Meaningful data integrity/regression tests                 |

No external image/font service is required at runtime. The included artwork is made with CSS; Inter is bundled locally. See [third-party notices](docs/THIRD_PARTY_NOTICES.md) and [verification notes](docs/TESTING.md).
