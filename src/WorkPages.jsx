import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useWorkspace } from "./Workspace.jsx";
import {
  dateKey,
  displayDate,
  filterTasks,
  isOverdue,
  progressOf,
  STATUSES,
  tasksToCSV,
} from "./model.mjs";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Confirm,
  Cover,
  downloadFile,
  Empty,
  Icon,
  PageHeader,
  Priority,
  Progress,
  ProjectCard,
  relativeTime,
  SectionTitle,
  TaskRow,
} from "./UI.jsx";
export function Dashboard() {
  const { state, profile } = useWorkspace(),
    { openTask, openProject } = useOutletContext();
  const [tab, setTab] = useState("today");
  const today = dateKey(),
    mine = state.tasks.filter((t) => t.assigneeId === state.profileId),
    active = state.projects.filter((p) => p.status === "active"),
    rate = progressOf(state.tasks);
  const visible = mine
    .filter((t) =>
      tab === "completed"
        ? t.status === "done"
        : t.status !== "done" &&
          (tab === "today"
            ? t.dueDate && t.dueDate <= today
            : t.dueDate > today),
    )
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
    .slice(0, 5);
  const upcoming = state.tasks
    .filter((t) => t.status !== "done" && t.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hey ${profile.name.split(" ")[0]}, let’s make it happen 👋`}
        description="A fresh perspective on your projects, people, and progress."
      >
        <span className="today-chip">
          <Icon name="calendar" size={16} />
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <button className="btn primary" onClick={() => openProject()}>
          <Icon name="plus" size={18} />
          New project
        </button>
      </PageHeader>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="welcome-banner">
            <div className="banner-copy">
              <span className="banner-eyebrow">
                ● A LITTLE CLARITY GOES A LONG WAY
              </span>
              <h2>
                Big ideas.
                <br />
                Small steps. <em>Great work.</em>
              </h2>
              <p>
                You’ve got the ideas. Let’s give them a place to grow.
                <br />
                Organize your day and make room for what matters.
              </p>
              <button className="btn banner-btn" onClick={() => openTask()}>
                Create a task <Icon name="arrow" size={17} />
              </button>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="art-orbit" />
              <span className="art-spark">✳</span>
              <div className="floating-card card-back">
                <span className="soft-icon purple">
                  <Icon name="rocket" size={24} />
                </span>
                <strong>Ideas into action</strong>
                <i />
                <i />
              </div>
              <div className="floating-card card-front">
                <div>
                  <span className="art-check">✓</span>
                  <small>You’ve got this!</small>
                  <b>✦</b>
                </div>
                <h4>Make something great.</h4>
                <div className="art-progress">
                  <i />
                </div>
                <p>
                  <span>S</span>
                  <span>O</span>
                  <span>A</span>
                  <small>One step at a time</small>
                </p>
              </div>
              <span className="art-badge">
                <Icon name="zap" size={13} />
                In your flow
              </span>
            </div>
          </section>
          <div className="stats-grid">
            {[
              [
                "projects",
                "Total projects",
                active.length,
                "Projects in your workspace",
                "blue",
              ],
              [
                "tasks",
                "Tasks in progress",
                state.tasks.filter((t) => t.status === "progress").length,
                "Moving things forward",
                "orange",
              ],
              [
                "completed",
                "Completed tasks",
                state.tasks.filter((t) => t.status === "done").length,
                `${rate}% of all tasks completed`,
                "green",
              ],
              [
                "team",
                "Team members",
                state.members.length,
                "Great minds, working together",
                "purple",
              ],
            ].map(([icon, label, n, note, color]) => (
              <div className="stat-card" key={label}>
                <div className="stat-top">
                  <span className={`soft-icon ${color}`}>
                    <Icon name={icon} size={20} />
                  </span>
                  <Icon name="upRight" size={15} />
                </div>
                <div className="stat-value">
                  {n}
                  <span>{label}</span>
                </div>
                <p>{note}</p>
              </div>
            ))}
          </div>
          <section className="recent-projects">
            <SectionTitle
              title="Recent projects"
              subtitle="A little progress, every day."
            >
              <Link className="text-btn" to="/projects">
                View all projects <Icon name="arrow" size={14} />
              </Link>
            </SectionTitle>
            <div className="project-grid dashboard-projects">
              {active.slice(0, 3).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
            {!active.length && (
              <Empty icon="projects" title="Your next idea belongs here">
                <button className="btn primary" onClick={() => openProject()}>
                  Create project
                </button>
              </Empty>
            )}
          </section>
          <section className="panel my-tasks-panel">
            <SectionTitle title="My tasks" subtitle="Small wins add up.">
              <button
                className="icon-btn"
                aria-label="Create task"
                onClick={() => openTask()}
              >
                <Icon name="plus" />
              </button>
            </SectionTitle>
            <div className="tabs">
              {[
                ["today", "Today & overdue"],
                ["upcoming", "Upcoming"],
                ["completed", "Completed"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={tab === id ? "active" : ""}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {visible.map((t) => (
              <TaskRow key={t.id} task={t} onOpen={openTask} />
            ))}
            {!visible.length && (
              <Empty
                icon="completed"
                title="A clear list. A fresh start."
                description="Create a task or explore another tab."
              />
            )}
            <Link className="panel-footer-link" to="/tasks">
              View all my tasks <Icon name="arrow" size={14} />
            </Link>
          </section>
        </div>
        <aside className="dashboard-rail">
          <section className="panel focus-panel">
            <SectionTitle title="Your work, in focus">
              <Icon name="analytics" size={17} />
            </SectionTitle>
            <p className="muted small">Workspace task overview</p>
            <div
              className="donut"
              style={{
                background: `conic-gradient(#3267f6 0 ${rate}%,var(--soft-blue) ${rate}% 100%)`,
              }}
            >
              <div>
                <strong>{rate}%</strong>
                <small>Completed</small>
              </div>
            </div>
            <div className="donut-legend">
              {STATUSES.map((s) => (
                <div key={s.id}>
                  <span>
                    <i style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <strong>
                    {state.tasks.filter((t) => t.status === s.id).length}
                  </strong>
                </div>
              ))}
            </div>
            <div className="insight">
              <Icon name="sparkles" size={18} />
              <span>Every completed task is a step forward. Keep going!</span>
            </div>
          </section>
          <section className="panel deadlines">
            <SectionTitle title="Coming up">
              <Link
                className="icon-btn"
                to="/calendar"
                aria-label="Open calendar"
              >
                <Icon name="upRight" size={18} />
              </Link>
            </SectionTitle>
            {upcoming.map((t) => (
              <button
                className="deadline-item"
                key={t.id}
                onClick={() => openTask(t)}
              >
                <span className="date-tile">
                  <small>
                    {new Date(`${t.dueDate}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { month: "short" },
                    )}
                  </small>
                  <strong>{t.dueDate.slice(-2)}</strong>
                </span>
                <span>
                  <strong>{t.title}</strong>
                  <small>
                    {state.projects.find((p) => p.id === t.projectId)?.title}
                  </small>
                </span>
              </button>
            ))}
            {!upcoming.length && (
              <p className="muted small">
                Nothing scheduled. Your calendar has room to breathe.
              </p>
            )}
          </section>
          <section className="panel activity-panel">
            <SectionTitle title="Recent activity">
              <i className="live-dot" />
            </SectionTitle>
            <div className="activity-timeline">
              {state.activity.slice(0, 4).map((a, i) => (
                <div key={a.id}>
                  <span
                    className={`timeline-icon ${i % 2 ? "purple" : "blue"}`}
                  >
                    <Icon name={i % 2 ? "messages" : "check"} size={13} />
                  </span>
                  <p>
                    {a.text}
                    <small>{relativeTime(a.at)}</small>
                  </p>
                </div>
              ))}
            </div>
          </section>
          <div className="team-mini">
            <AvatarGroup
              ids={state.members.slice(0, 4).map((m) => m.id)}
              max={4}
            />
            <p>Great work happens together.</p>
            <Link to="/team">
              Meet your team <Icon name="arrow" size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
export function Projects() {
  const { state } = useWorkspace(),
    { openProject } = useOutletContext();
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("active"),
    [view, setView] = useState("grid"),
    [sort, setSort] = useState("newest");
  const projects = state.projects
    .filter(
      (p) =>
        `${p.title} ${p.description}`.toLowerCase().includes(q.toLowerCase()) &&
        (tab === "all" ||
          (tab === "favorites" ? p.favorite : p.status === tab)),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "due"
          ? (a.dueDate || "9999").localeCompare(b.dueDate || "9999")
          : b.createdAt.localeCompare(a.createdAt),
    );
  return (
    <>
      <PageHeader
        eyebrow="A SPACE FOR EVERY IDEA"
        title="My projects"
        description="Bring your ideas together. Make great things happen."
      >
        <button className="btn primary" onClick={() => openProject()}>
          <Icon name="plus" size={18} />
          New project
        </button>
      </PageHeader>
      <div className="summary-strip">
        {[
          [
            "projects",
            state.projects.filter((p) => p.status === "active").length,
            "active projects",
            "blue",
          ],
          [
            "completed",
            state.tasks.filter((t) => t.status === "done").length,
            "tasks completed",
            "green",
          ],
          ["team", state.members.length, "creative minds", "purple"],
        ].map(([icon, n, label, color]) => (
          <div key={label}>
            <span className={`soft-icon ${color}`}>
              <Icon name={icon} />
            </span>
            <span>
              <strong>{n}</strong> {label}
            </span>
          </div>
        ))}
        <span>✳</span>
      </div>
      <div className="toolbar">
        <div className="tabs pill-tabs">
          {[
            ["active", "Active"],
            ["favorites", "Favorites"],
            ["archived", "Archived"],
            ["all", "All projects"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              aria-label="Search projects"
              placeholder="Search projects…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <select
            aria-label="Sort projects"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="due">Due date</option>
            <option value="title">Name A–Z</option>
          </select>
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>
      <div className={`project-grid ${view === "list" ? "project-list" : ""}`}>
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} layout={view} />
        ))}
        {tab === "active" && !q && view === "grid" && (
          <button className="new-project-card" onClick={() => openProject()}>
            <span>
              <Icon name="plus" size={26} />
            </span>
            <h3>A new idea?</h3>
            <p>Give it a place to grow.</p>
            <b>
              Create a project <Icon name="arrow" size={14} />
            </b>
          </button>
        )}
      </div>
      {!projects.length && (
        <Empty
          icon="projects"
          title="No projects in this view"
          description="Try another filter or create a new project."
        />
      )}
    </>
  );
}
function ViewToggle({ view, setView, board = false }) {
  return (
    <div className="view-toggle">
      {[
        [board ? "board" : "grid", board ? "projects" : "grid"],
        ["list", "list"],
      ].map(([id, icon]) => (
        <button
          key={id}
          className={view === id ? "active" : ""}
          aria-label={`${id} view`}
          aria-pressed={view === id}
          onClick={() => setView(id)}
        >
          <Icon name={icon} size={17} />
        </button>
      ))}
    </div>
  );
}
export function TaskBoard({ tasks, onOpen, onCreate }) {
  const { state, dispatch, notify } = useWorkspace();
  const [over, setOver] = useState(null),
    [dragging, setDragging] = useState(null);
  const move = (id, status) => {
    if (!tasks.some((t) => t.id === id)) return;
    dispatch({ type: "MOVE", id, status });
    setOver(null);
    setDragging(null);
    notify(
      `Moved to ${STATUSES.find((s) => s.id === status).label.toLowerCase()}`,
    );
  };
  return (
    <div className="kanban-board">
      {STATUSES.map((s) => (
        <section
          key={s.id}
          className={`kanban-column ${over === s.id ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setOver(s.id);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOver(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            move(e.dataTransfer.getData("text/plain"), s.id);
          }}
        >
          <div className="kanban-heading">
            <span>
              <i style={{ background: s.color }} />
              {s.label}
              <b>{tasks.filter((t) => t.status === s.id).length}</b>
            </span>
            <button
              className="icon-btn"
              aria-label={`Add task to ${s.label}`}
              onClick={() => onCreate(s.id)}
            >
              <Icon name="plus" size={17} />
            </button>
          </div>
          {tasks
            .filter((t) => t.status === s.id)
            .map((t) => (
              <article
                className={`kanban-card ${dragging === t.id ? "dragging" : ""}`}
                key={t.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", t.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragging(t.id);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
              >
                <div className="kanban-tags">
                  <Badge
                    color={
                      state.projects.find((p) => p.id === t.projectId)?.color
                    }
                  >
                    {t.tags[0] || "Task"}
                  </Badge>
                  <Icon name="grip" size={14} />
                </div>
                <button className="kanban-title" onClick={() => onOpen(t)}>
                  {t.title}
                </button>
                <p>{t.description}</p>
                <Priority value={t.priority} />
                {t.subtasks.length > 0 && (
                  <div className="mini-checklist">
                    <span>
                      <Icon name="tasks" size={12} />
                      {t.subtasks.filter((s) => s.done).length}/
                      {t.subtasks.length} checklist
                    </span>
                    <Progress
                      value={Math.round(
                        (t.subtasks.filter((s) => s.done).length /
                          t.subtasks.length) *
                          100,
                      )}
                    />
                  </div>
                )}
                <div className="kanban-footer">
                  <Avatar
                    member={state.members.find((m) => m.id === t.assigneeId)}
                  />
                  <span className={`due ${isOverdue(t) ? "overdue" : ""}`}>
                    <Icon name="calendar" size={12} />
                    {displayDate(t.dueDate)}
                  </span>
                  <span className="comment-count">
                    <Icon name="messages" size={13} />
                    {t.comments.length}
                  </span>
                </div>
                <select
                  className="card-status"
                  aria-label={`Move ${t.title}`}
                  value={t.status}
                  onChange={(e) => move(t.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          <button className="add-board-task" onClick={() => onCreate(s.id)}>
            <Icon name="plus" size={15} />
            Add task
          </button>
        </section>
      ))}
    </div>
  );
}
export function ProjectDetails() {
  const { projectId } = useParams(),
    navigate = useNavigate(),
    { state, dispatch, notify } = useWorkspace(),
    { openTask, openProject } = useOutletContext();
  const [view, setView] = useState("board"),
    [query, setQuery] = useState(""),
    [assignee, setAssignee] = useState("all"),
    [deleting, setDeleting] = useState(false);
  const project = state.projects.find((p) => p.id === projectId);
  if (!project)
    return (
      <Empty
        icon="projects"
        title="Project not found"
        description="It may have been removed."
      >
        <Link className="btn primary" to="/projects">
          All projects
        </Link>
      </Empty>
    );
  const all = state.tasks.filter((t) => t.projectId === projectId),
    tasks = filterTasks(all, { query, assignee }),
    rate = progressOf(all);
  return (
    <>
      <Link to="/projects" className="back-link">
        <Icon name="back" size={16} />
        All projects
      </Link>
      <div className="project-detail-header">
        <span className={`soft-icon xl ${project.color}`}>
          <Icon name="projects" size={29} />
        </span>
        <div className="project-detail-heading">
          <h1>
            {project.title}
            <button
              className={`icon-btn star ${project.favorite ? "selected" : ""}`}
              aria-label="Toggle favorite project"
              onClick={() =>
                dispatch({
                  type: "PROJECT",
                  value: { ...project, favorite: !project.favorite },
                })
              }
            >
              <Icon name="star" />
            </button>
          </h1>
          <p>{project.description}</p>
          <div className="project-detail-meta">
            <span className="due">
              <Icon name="calendar" size={14} />
              Due {displayDate(project.dueDate)}
            </span>
            <AvatarGroup ids={project.memberIds} />
            <span className="muted small">
              {project.memberIds.length} members
            </span>
            <Badge color={project.status === "active" ? "green" : "purple"}>
              {project.status}
            </Badge>
          </div>
        </div>
        <div className="project-header-actions">
          <button className="btn" onClick={() => openProject(project)}>
            <Icon name="edit" size={16} />
            Edit project
          </button>
          <button
            className="btn primary"
            onClick={() => openTask(null, { projectId })}
          >
            <Icon name="plus" size={17} />
            New task
          </button>
        </div>
      </div>
      <div className="project-progress-banner">
        <span>
          <Icon name="target" size={19} />
          <strong>
            {all.filter((t) => t.status === "done").length} of {all.length}{" "}
            tasks
          </strong>{" "}
          completed
        </span>
        <Progress value={rate} color={project.color} />
        <strong>{rate}%</strong>
        <small>One step closer.</small>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {[
            ["board", "projects", "Board view"],
            ["list", "list", "List view"],
            ["overview", "layers", "Overview"],
          ].map(([id, icon, label]) => (
            <button
              className={view === id ? "active" : ""}
              key={id}
              onClick={() => setView(id)}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              aria-label="Search project tasks"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter by assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="all">All assignees</option>
            <option value="">Unassigned</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {view === "board" ? (
        <>
          <p className="board-hint">
            <Icon name="grip" size={13} />
            Drag cards between columns or use a card’s status menu.
          </p>
          <TaskBoard
            tasks={tasks}
            onOpen={openTask}
            onCreate={(status) => openTask(null, { projectId, status })}
          />
        </>
      ) : view === "list" ? (
        <div className="panel">
          {STATUSES.map((s) => (
            <section key={s.id}>
              <div className="list-group-heading">
                <i style={{ background: s.color }} />
                {s.label}
                <span>{tasks.filter((t) => t.status === s.id).length}</span>
              </div>
              {tasks
                .filter((t) => t.status === s.id)
                .map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onOpen={openTask}
                    showProject={false}
                  />
                ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="project-overview-grid">
          <section className="panel">
            <Cover color={project.color} large />
            <div className="panel-padding">
              <h2>About this project</h2>
              <p>
                {project.description ||
                  "Add a description to share the big picture."}
              </p>
              <h3>Project team</h3>
              <div className="overview-members">
                {project.memberIds.map((id) => {
                  const m = state.members.find((m) => m.id === id);
                  return (
                    m && (
                      <div key={id}>
                        <Avatar member={m} size="md" />
                        <span>
                          <strong>{m.name}</strong>
                          <small>{m.role}</small>
                        </span>
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          </section>
          <section className="panel panel-padding">
            <h2>Project settings</h2>
            <p className="muted">Keep your project details up to date.</p>
            <button className="btn" onClick={() => openProject(project)}>
              Edit details
            </button>
            <div className="divider" />
            <h3>
              {project.status === "archived" ? "Restore" : "Archive"} project
            </h3>
            <p className="muted small">
              Archived projects keep their tasks and can be restored anytime.
            </p>
            <button
              className="btn"
              onClick={() => {
                dispatch({
                  type: "PROJECT",
                  value: {
                    ...project,
                    status: project.status === "active" ? "archived" : "active",
                  },
                });
                notify(
                  project.status === "active"
                    ? "Project archived"
                    : "Project restored",
                );
              }}
            >
              <Icon name="archive" size={16} />
              {project.status === "active"
                ? "Archive project"
                : "Restore project"}
            </button>
            <div className="divider" />
            <h3 className="danger-text">Delete project</h3>
            <p className="muted small">
              Permanently remove this project and all of its tasks, comments,
              and checklists.
            </p>
            <button
              className="btn danger-outline"
              onClick={() => setDeleting(true)}
            >
              <Icon name="delete" size={16} />
              Delete project
            </button>
          </section>
        </div>
      )}
      {deleting && (
        <Confirm
          title="Delete this project?"
          description={`“${project.title}” and its ${all.length} tasks will be permanently removed from this browser.`}
          onClose={() => setDeleting(false)}
          onConfirm={() => {
            dispatch({ type: "DELETE_PROJECT", id: projectId });
            notify("Project deleted");
            navigate("/projects");
          }}
        />
      )}
    </>
  );
}
export function Tasks() {
  const { state, notify } = useWorkspace(),
    { openTask } = useOutletContext();
  const [filters, setFilters] = useState({
      query: "",
      status: "all",
      priority: "all",
      assignee: state.profileId,
      projectId: "all",
      sort: "due",
    }),
    [view, setView] = useState("list");
  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    tasks = filterTasks(state.tasks, filters);
  return (
    <>
      <PageHeader
        eyebrow="ONE THING AT A TIME"
        title="My tasks"
        description="Clear priorities. Less busywork. More progress."
      >
        <button
          className="btn"
          onClick={() => {
            downloadFile(
              "taska-tasks.csv",
              tasksToCSV(tasks, state.projects, state.members),
              "text/csv;charset=utf-8",
            );
            notify("Task list exported");
          }}
        >
          <Icon name="download" size={16} />
          Export CSV
        </button>
        <button className="btn primary" onClick={() => openTask()}>
          <Icon name="plus" size={17} />
          New task
        </button>
      </PageHeader>
      <div className="task-filter-card">
        <div className="task-filter-top">
          <label className="search-field">
            <Icon name="search" size={17} />
            <input
              aria-label="Search tasks"
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Find a task, tag, or idea…"
            />
          </label>
          <ViewToggle view={view} setView={setView} board />
        </div>
        <div className="task-filter-bottom">
          <span>
            <Icon name="filter" size={16} />
            Filter by
          </span>
          <select
            aria-label="Task assignee filter"
            value={filters.assignee}
            onChange={(e) => set("assignee", e.target.value)}
          >
            <option value="all">Everyone</option>
            <option value="">Unassigned</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === state.profileId ? "Assigned to me" : m.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Task project filter"
            value={filters.projectId}
            onChange={(e) => set("projectId", e.target.value)}
          >
            <option value="all">All projects</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Task priority filter"
            value={filters.priority}
            onChange={(e) => set("priority", e.target.value)}
          >
            <option value="all">All priorities</option>
            {["high", "medium", "low"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort tasks"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="due">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Name</option>
            <option value="newest">Sort: Newest</option>
          </select>
          <button
            className="text-btn"
            onClick={() =>
              setFilters({
                query: "",
                status: "all",
                priority: "all",
                assignee: "all",
                projectId: "all",
                sort: "due",
              })
            }
          >
            Clear filters
          </button>
        </div>
      </div>
      <div className="toolbar">
        <div className="tabs task-status-tabs">
          {[
            { id: "all", label: "All tasks" },
            ...STATUSES,
            { id: "overdue", label: "Overdue" },
          ].map((s) => (
            <button
              key={s.id}
              className={filters.status === s.id ? "active" : ""}
              onClick={() => set("status", s.id)}
            >
              {s.label}
              {filters.status === s.id && <span>{tasks.length}</span>}
            </button>
          ))}
        </div>
        <span className="muted small">{tasks.length} tasks</span>
      </div>
      {view === "board" ? (
        <TaskBoard
          tasks={tasks}
          onOpen={openTask}
          onCreate={(status) =>
            openTask(null, {
              status,
              projectId:
                filters.projectId === "all" ? undefined : filters.projectId,
            })
          }
        />
      ) : (
        <div className="panel task-list-panel">
          <div className="task-table-heading">
            <span>Task name / project</span>
            <span>Priority · due date · assignee</span>
          </div>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={openTask} />
          ))}
          {!tasks.length && (
            <Empty
              title="Nothing on this list"
              description="Try different filters, or create a task."
            >
              <button className="btn primary" onClick={() => openTask()}>
                Create a task
              </button>
            </Empty>
          )}
        </div>
      )}
    </>
  );
}
export function Calendar() {
  const { state } = useWorkspace(),
    { openTask } = useOutletContext();
  const [month, setMonth] = useState(
      () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    [selected, setSelected] = useState(dateKey()),
    [scope, setScope] = useState("all");
  const start = new Date(month);
  start.setDate(1 - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    }),
    tasks = state.tasks.filter(
      (t) => t.dueDate && (scope === "all" || t.assigneeId === state.profileId),
    ),
    forDay = tasks.filter((t) => t.dueDate === selected);
  return (
    <>
      <PageHeader
        eyebrow="MAKE SPACE FOR WHAT MATTERS"
        title="Your calendar"
        description="A little planning today. A little more breathing room tomorrow."
      >
        <select
          aria-label="Calendar task scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="all">Everyone’s tasks</option>
          <option value="mine">My tasks</option>
        </select>
        <button
          className="btn primary"
          onClick={() => openTask(null, { dueDate: selected })}
        >
          <Icon name="plus" size={17} />
          New task
        </button>
      </PageHeader>
      <div className="calendar-layout">
        <section className="panel calendar-panel">
          <div className="calendar-toolbar">
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div>
              <button
                className="btn"
                onClick={() => {
                  setMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                    ),
                  );
                  setSelected(dateKey());
                }}
              >
                Today
              </button>
              <button
                className="icon-btn"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <Icon name="left" />
              </button>
              <button
                className="icon-btn"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <Icon name="right" />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((d) => {
              const key = dateKey(d),
                events = tasks.filter((t) => t.dueDate === key);
              return (
                <div
                  key={key}
                  className={`calendar-day ${d.getMonth() !== month.getMonth() ? "outside" : ""} ${key === selected ? "selected" : ""} ${key === dateKey() ? "today" : ""}`}
                >
                  <button
                    className="day-number"
                    aria-label={`Select ${key}`}
                    aria-pressed={key === selected}
                    onClick={() => setSelected(key)}
                  >
                    {d.getDate()}
                  </button>
                  <div className="calendar-events">
                    {events.slice(0, 2).map((t) => (
                      <button
                        key={t.id}
                        className={`calendar-event ${state.projects.find((p) => p.id === t.projectId)?.color} ${t.status === "done" ? "done" : ""}`}
                        title={t.title}
                        onClick={() => openTask(t)}
                      >
                        {t.title}
                      </button>
                    ))}
                    {events.length > 2 && (
                      <button
                        className="more-events"
                        onClick={() => setSelected(key)}
                      >
                        +{events.length - 2} more
                      </button>
                    )}
                  </div>
                  {events.length > 0 && (
                    <button
                      className="mobile-event-dot"
                      aria-label={`${events.length} tasks on ${key}`}
                      onClick={() => setSelected(key)}
                    >
                      {events.length}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="calendar-legend">
            {state.projects.slice(0, 6).map((p) => (
              <span key={p.id}>
                <i className={`project-dot ${p.color}`} />
                {p.title}
              </span>
            ))}
          </div>
        </section>
        <aside className="panel day-agenda">
          <div className="agenda-top">
            <span className="eyebrow">YOUR DAILY FOCUS</span>
            <h2>
              {new Date(`${selected}T12:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
              })}
            </h2>
            <p>
              {new Date(`${selected}T12:00:00`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <Badge color="blue">{forDay.length} tasks scheduled</Badge>
          </div>
          <div className="agenda-tasks">
            {forDay.map((t) => (
              <TaskRow key={t.id} task={t} onOpen={openTask} />
            ))}
            {!forDay.length && (
              <Empty
                icon="sun"
                title="A little breathing room"
                description="No tasks scheduled for this day."
              />
            )}
          </div>
          <button
            className="btn full-width"
            onClick={() => openTask(null, { dueDate: selected })}
          >
            <Icon name="plus" size={16} />
            Add a task for this day
          </button>
        </aside>
      </div>
    </>
  );
}
