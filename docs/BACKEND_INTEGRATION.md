# Connecting a backend later

The delivered application is a fully interactive browser-local demo. It contains no server, real authentication, remote database, or online messaging adapter. Backend absence is the normal supported configuration.

## Integration boundary

`src/Workspace.jsx` exposes `state`, `dispatch`, `replace`, `reset`, `notify`, `warning`, and `profile` through `useWorkspace()`. The UI consumes that interface. `src/model.mjs` defines the versioned workspace model and immutable transitions, while `src/seed.mjs` supplies examples.

For a production backend, retain this local provider as the explicit demo implementation and add a separate remote provider behind the same UI interface. Select demo mode when no backend is configured. Once a user is working remotely, report connection errors and offer an explicit switch to a separate demo; do not silently turn failed server writes into pretend successful saves.

## Data to store

Use workspace-scoped projects, tasks, members, comments, checklist items, messages, and activity records. Scope every query and mutation to a workspace that the authenticated user can access. Treat IDs, assignees, and project references as untrusted request data. The local importer is data-shape validation, not authorization.

The sample `profileId` and browser storage must never be trusted as server identity. Authenticate users through your chosen provider and validate their session and workspace membership on the server. Invitations need real delivery and acceptance flows; the demo add-member button only creates a local record.

A possible API contract (not implemented) is:

| Request                                | Purpose                                           |
| -------------------------------------- | ------------------------------------------------- |
| `GET /api/workspaces/:id`              | Load an authorized workspace snapshot             |
| `POST /api/workspaces/:id/projects`    | Create a project                                  |
| `PATCH /api/projects/:id`              | Edit or archive a project                         |
| `DELETE /api/projects/:id`             | Delete a project and authorized dependent records |
| `POST /api/projects/:id/tasks`         | Create a task                                     |
| `PATCH /api/tasks/:id`                 | Edit or move a task                               |
| `DELETE /api/tasks/:id`                | Delete a task                                     |
| `POST /api/tasks/:id/comments`         | Add a comment as the authenticated user           |
| `POST /api/conversations/:id/messages` | Send a message to authorized participants         |

## Practical sequence

1. Add backend authentication and workspace membership checks.
2. Map server responses into the current state shape or adapt the pages to server entities.
3. Make remote mutations asynchronous with pending/error states, and either wait for confirmation or roll back failed optimistic updates.
4. Use server-generated timestamps and record revisions to prevent lost updates. Replace browser last-write-wins with an explicit conflict strategy.
5. Implement server-side validation, participant permissions, rate limits, and tests for unauthorized access.
6. Add subscriptions or polling for shared state and message delivery.
7. Keep imports scoped to the authorized workspace and validate all references server-side.
8. Keep demo and remote storage keys separate. Do not automatically upload local sample or user data.
9. Adjust Vercel route handling when adding `/api` endpoints, and keep server credentials only in server environment variables.

Local font assets, layout, project cards, task editors, calendar, and charts can remain unchanged. Use environment variables only after an actual backend adapter exists. No claim of remote capability is made by the current app.
