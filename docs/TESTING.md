# Verification notes

Verified on 25 October 2026 in Linux with Node 24 and a Chromium browser.

## Automated tests

`npm test` runs 14 Node test-runner tests covering:

- Valid sample data and lossless JSON backup round trips.
- Secure UUID generation, including HTTP environments without `randomUUID`.
- Project CRUD and task deletion when a project is removed.
- Task CRUD, completion/reopen timestamps, and progress calculations.
- Rejection of invalid project references and unknown status changes.
- Checklist updates and preserved comments.
- Member removal, unassignment, and owner protection.
- Local messages and deletion limited to the current profile's outgoing messages.
- Combined filters and immutable sorting.
- Rejection of corrupt backups, impossible dates, duplicate IDs, and dangling references.
- CSV escaping and spreadsheet formula neutralization.
- Date transitions across months and leap days.
- Preferences and notification read state.

`npm run build` verifies the production Vite bundle. `npm run check` runs both commands.

## Browser checks performed

- Opened the populated dashboard without backend configuration.
- Created a project and high-priority task through their forms.
- Moved the task between board columns using its status selector.
- Added and completed a checklist item, added a comment, and completed the task.
- Reloaded the project URL and confirmed the task, checklist, comment count, and 100% project completion persisted.
- Saved a demo message and confirmed the local-only message and delivery label.
- Opened analytics, team, tasks, settings, and calendar pages.
- Changed between dark and light themes.
- Inspected desktop, 390px and 320px mobile, and 768px tablet layouts using a responsive iframe harness.
- Inspected the mobile task drawer and calendar. Fixed mobile hero overlap and narrow-screen horizontal overflow; measured equal document/client widths after the fix.

The QA harness and browser test records are not included in the source or initial demo seed.

## Verification limits

No deployment was made into the user's Vercel account. Windows launcher scripts are included, but native Windows execution was not available. Mobile checks used responsive browser widths, not physical iOS/Android devices. Data import/export helpers have automated tests; file-picker integration and every browser storage failure mode were not exhaustively automated. Desktop drag-and-drop is implemented; the browser workflow test used the status selector, which also works with keyboard/touch.

The demo has no external messaging delivery, authentication, database, or real-time server to test. The backend integration guide describes future implementation, not a shipped remote service.
