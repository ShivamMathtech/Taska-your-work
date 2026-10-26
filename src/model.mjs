export const STATUSES = [
  { id: "todo", label: "To do", color: "#8996ac" },
  { id: "progress", label: "In progress", color: "#3267f6" },
  { id: "review", label: "In review", color: "#a17ad7" },
  { id: "done", label: "Completed", color: "#28ac82" },
];
export const COLORS = ["blue", "purple", "orange", "green", "pink", "teal"];
export function uid(source = globalThis.crypto) {
  if (typeof source.randomUUID === "function") return source.randomUUID();
  const b = source.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const shiftDate = (days, base = new Date()) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return dateKey(d);
};
export const displayDate = (d) =>
  d
    ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No date";
export const initials = (n) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
export const progressOf = (tasks) =>
  tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "done").length / tasks.length) * 100,
      )
    : 0;
export const isOverdue = (t) =>
  !!t.dueDate && t.dueDate < dateKey() && t.status !== "done";
export function filterTasks(
  tasks,
  {
    query = "",
    status = "all",
    priority = "all",
    assignee = "all",
    projectId = "all",
    sort = "due",
  } = {},
) {
  return tasks
    .filter(
      (t) =>
        (!query ||
          `${t.title} ${t.description} ${t.tags.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (status === "all" ||
          (status === "overdue" ? isOverdue(t) : t.status === status)) &&
        (priority === "all" || t.priority === priority) &&
        (assignee === "all" || t.assigneeId === assignee) &&
        (projectId === "all" || t.projectId === projectId),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "priority"
          ? ["high", "medium", "low"].indexOf(a.priority) -
            ["high", "medium", "low"].indexOf(b.priority)
          : sort === "newest"
            ? b.createdAt.localeCompare(a.createdAt)
            : (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    );
}
export function reduceWorkspace(state, action) {
  const now = action.at || new Date().toISOString();
  const log = (next, text, projectId = null, taskId = null) => ({
    ...next,
    activity: [
      { id: uid(), text, at: now, projectId, taskId, read: false },
      ...next.activity,
    ].slice(0, 150),
  });
  switch (action.type) {
    case "PROJECT": {
      const exists = state.projects.some((p) => p.id === action.value.id);
      return log(
        {
          ...state,
          projects: exists
            ? state.projects.map((p) =>
                p.id === action.value.id ? action.value : p,
              )
            : [action.value, ...state.projects],
        },
        `${exists ? "Updated" : "Created"} ${action.value.title}`,
        action.value.id,
      );
    }
    case "DELETE_PROJECT": {
      const p = state.projects.find((p) => p.id === action.id);
      if (!p) return state;
      return log(
        {
          ...state,
          projects: state.projects.filter((p) => p.id !== action.id),
          tasks: state.tasks.filter((t) => t.projectId !== action.id),
        },
        `Deleted project ${p.title}`,
      );
    }
    case "TASK": {
      if (!state.projects.some((p) => p.id === action.value.projectId))
        throw Error("Select an existing project.");
      const old = state.tasks.find((t) => t.id === action.value.id);
      const task = {
        ...action.value,
        updatedAt: now,
        completedAt:
          action.value.status === "done" ? old?.completedAt || now : null,
      };
      return log(
        {
          ...state,
          tasks: old
            ? state.tasks.map((t) => (t.id === task.id ? task : t))
            : [task, ...state.tasks],
        },
        `${old ? "Updated" : "Created"} task “${task.title}”`,
        task.projectId,
        task.id,
      );
    }
    case "MOVE": {
      const t = state.tasks.find((t) => t.id === action.id);
      if (
        !t ||
        !STATUSES.some((s) => s.id === action.status) ||
        t.status === action.status
      )
        return state;
      return log(
        {
          ...state,
          tasks: state.tasks.map((t) =>
            t.id === action.id
              ? {
                  ...t,
                  status: action.status,
                  updatedAt: now,
                  completedAt: action.status === "done" ? now : null,
                }
              : t,
          ),
        },
        `Moved “${t.title}” to ${STATUSES.find((s) => s.id === action.status).label.toLowerCase()}`,
        t.projectId,
        t.id,
      );
    }
    case "DELETE_TASK": {
      const t = state.tasks.find((t) => t.id === action.id);
      return t
        ? log(
            { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) },
            `Deleted task “${t.title}”`,
            t.projectId,
          )
        : state;
    }
    case "COMMENT":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, comments: [...t.comments, action.value], updatedAt: now }
            : t,
        ),
      };
    case "CHECK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === action.id ? { ...s, done: !s.done } : s,
                ),
              }
            : t,
        ),
      };
    case "MEMBER": {
      const exists = state.members.some((m) => m.id === action.value.id);
      return log(
        {
          ...state,
          members: exists
            ? state.members.map((m) =>
                m.id === action.value.id ? action.value : m,
              )
            : [...state.members, action.value],
        },
        `${exists ? "Updated" : "Added"} ${action.value.name} in the demo team`,
      );
    }
    case "DELETE_MEMBER":
      if (action.id === state.profileId) return state;
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        projects: state.projects.map((p) => ({
          ...p,
          memberIds: p.memberIds.filter((id) => id !== action.id),
        })),
        tasks: state.tasks.map((t) =>
          t.assigneeId === action.id ? { ...t, assigneeId: "" } : t,
        ),
        messages: state.messages.filter(
          (m) => m.from !== action.id && m.to !== action.id,
        ),
      };
    case "MESSAGE":
      return { ...state, messages: [...state.messages, action.value] };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter(
          (m) => !(m.id === action.id && m.from === state.profileId),
        ),
      };
    case "READ":
      return {
        ...state,
        activity: state.activity.map((a) => ({ ...a, read: true })),
      };
    case "SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.value } };
    default:
      return state;
  }
}
export function validateWorkspace(data) {
  const fail = () => {
    throw Error("This is not a valid Taska v1 workspace backup.");
  };
  const str = (s, max = 10000) => typeof s === "string" && s.length <= max;
  const text = (s) => str(s, 200) && !!s.trim();
  const arr = (a, max = 10000) => Array.isArray(a) && a.length <= max;
  const time = (s) => str(s, 35) && !isNaN(Date.parse(s));
  const date = (s) =>
    s === "" ||
    (str(s, 10) &&
      /^\d{4}-\d{2}-\d{2}$/.test(s) &&
      !isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s);
  if (
    !data ||
    data.version !== 1 ||
    !arr(data.projects, 1000) ||
    !arr(data.tasks) ||
    !arr(data.members, 500) ||
    !data.members.length ||
    !arr(data.messages) ||
    !arr(data.activity, 150)
  )
    fail();
  for (const list of [
    data.projects,
    data.tasks,
    data.members,
    data.messages,
    data.activity,
  ])
    if (
      list.some((x) => !x || !text(x.id)) ||
      new Set(list.map((x) => x.id)).size !== list.length
    )
      fail();
  const members = new Set(data.members.map((m) => m.id)),
    projects = new Set(data.projects.map((p) => p.id));
  if (!members.has(data.profileId)) fail();
  for (const m of data.members)
    if (
      !text(m.name) ||
      !text(m.role) ||
      !text(m.email) ||
      !COLORS.includes(m.color)
    )
      fail();
  for (const p of data.projects)
    if (
      !text(p.title) ||
      !str(p.description) ||
      !COLORS.includes(p.color) ||
      !["active", "archived"].includes(p.status) ||
      !date(p.dueDate) ||
      !time(p.createdAt) ||
      typeof p.favorite !== "boolean" ||
      !arr(p.memberIds, 500) ||
      p.memberIds.some((id) => !members.has(id)) ||
      new Set(p.memberIds).size !== p.memberIds.length
    )
      fail();
  for (const t of data.tasks) {
    if (
      !projects.has(t.projectId) ||
      !text(t.title) ||
      !str(t.description) ||
      !STATUSES.some((s) => s.id === t.status) ||
      !["low", "medium", "high"].includes(t.priority) ||
      (t.assigneeId !== "" && !members.has(t.assigneeId)) ||
      !date(t.dueDate) ||
      !time(t.createdAt) ||
      !time(t.updatedAt) ||
      !(t.completedAt === null || time(t.completedAt)) ||
      !arr(t.tags, 20) ||
      t.tags.some((s) => !text(s)) ||
      !arr(t.subtasks, 100) ||
      !arr(t.comments, 500)
    )
      fail();
    if (
      t.subtasks.some(
        (s) =>
          !s || !text(s.id) || !text(s.title) || typeof s.done !== "boolean",
      ) ||
      t.comments.some(
        (c) =>
          !c ||
          !text(c.id) ||
          !text(c.author) ||
          !str(c.text, 2000) ||
          !time(c.at),
      )
    )
      fail();
    if (
      new Set(t.subtasks.map((s) => s.id)).size !== t.subtasks.length ||
      new Set(t.comments.map((c) => c.id)).size !== t.comments.length
    )
      fail();
  }
  for (const m of data.messages)
    if (
      !members.has(m.from) ||
      !members.has(m.to) ||
      !str(m.text, 2000) ||
      !time(m.at)
    )
      fail();
  for (const a of data.activity)
    if (
      !str(a.text, 1000) ||
      !time(a.at) ||
      typeof a.read !== "boolean" ||
      !(a.projectId === null || str(a.projectId, 200)) ||
      !(a.taskId === null || str(a.taskId, 200))
    )
      fail();
  if (
    !data.settings ||
    !text(data.settings.workspaceName) ||
    !["light", "dark", "system"].includes(data.settings.theme) ||
    typeof data.settings.compact !== "boolean" ||
    typeof data.settings.notifications !== "boolean"
  )
    fail();
  return structuredClone(data);
}
export const exportWorkspace = (state) => JSON.stringify(state, null, 2);
export function tasksToCSV(tasks, projects, members) {
  const cell = (v) => {
    const s = String(v ?? "");
    return (
      '"' +
      (/^\s*[=+@\-\t\r\n]/.test(s) ? "'" : "") +
      s.replaceAll('"', '""') +
      '"'
    );
  };
  return [
    ["Task", "Project", "Status", "Priority", "Assignee", "Due date"],
    ...tasks.map((t) => [
      t.title,
      projects.find((p) => p.id === t.projectId)?.title,
      STATUSES.find((s) => s.id === t.status)?.label,
      t.priority,
      members.find((m) => m.id === t.assigneeId)?.name,
      t.dueDate,
    ]),
  ]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");
}
