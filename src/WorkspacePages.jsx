import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { useWorkspace } from "./Workspace.jsx";
import {
  dateKey,
  exportWorkspace,
  isOverdue,
  progressOf,
  shiftDate,
  STATUSES,
  uid,
  validateWorkspace,
} from "./model.mjs";
import {
  Avatar,
  Badge,
  ColorPicker,
  Confirm,
  downloadFile,
  Empty,
  Field,
  Icon,
  Modal,
  PageHeader,
  Progress,
  relativeTime,
  SectionTitle,
} from "./UI.jsx";
export function Team() {
  const { state, dispatch, notify } = useWorkspace(),
    { openMember } = useOutletContext();
  const [q, setQ] = useState(""),
    [remove, setRemove] = useState(null);
  const members = state.members.filter((m) =>
    `${m.name} ${m.role} ${m.email}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="BETTER, TOGETHER"
        title="Meet your team"
        description="A shared space for the people behind the progress."
      >
        <button className="btn primary" onClick={() => openMember()}>
          <Icon name="plus" size={17} />
          Add team member
        </button>
      </PageHeader>
      <div className="team-banner">
        <div>
          <span className="eyebrow">GOOD PEOPLE. GREAT POSSIBILITIES.</span>
          <h2>
            Different minds.
            <br />
            One shared direction.
          </h2>
          <p>
            Bring your demo team together and make work feel a little lighter.
          </p>
        </div>
        <div className="team-banner-avatars">
          {state.members.slice(0, 5).map((m) => (
            <Avatar key={m.id} member={m} size="xl" />
          ))}
          <span>✳</span>
        </div>
      </div>
      <div className="toolbar">
        <h2>
          All members <span className="count">{state.members.length}</span>
        </h2>
        <label className="search-field">
          <Icon name="search" size={17} />
          <input
            aria-label="Search team"
            placeholder="Search people or roles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <div className="team-grid">
        {members.map((m) => {
          const tasks = state.tasks.filter((t) => t.assigneeId === m.id);
          return (
            <article key={m.id} className="member-card">
              <div className="member-card-top">
                <span>{m.id === state.profileId ? "YOU" : "DEMO MEMBER"}</span>
                <button
                  className="icon-btn"
                  aria-label={`Edit ${m.name}`}
                  onClick={() => openMember(m)}
                >
                  <Icon name="edit" size={16} />
                </button>
              </div>
              <Avatar member={m} size="xl" />
              <h3>{m.name}</h3>
              <p>{m.role}</p>
              <small>{m.email}</small>
              <div className="member-stats">
                <span>
                  <strong>
                    {tasks.filter((t) => t.status !== "done").length}
                  </strong>
                  Active tasks
                </span>
                <span>
                  <strong>
                    {tasks.filter((t) => t.status === "done").length}
                  </strong>
                  Completed
                </span>
                <span>
                  <strong>
                    {
                      state.projects.filter((p) => p.memberIds.includes(m.id))
                        .length
                    }
                  </strong>
                  Projects
                </span>
              </div>
              <div className="member-actions">
                {m.id === state.profileId ? (
                  <Link className="btn full-width" to="/settings">
                    <Icon name="user" size={15} />
                    Edit profile
                  </Link>
                ) : (
                  <>
                    <Link className="btn" to={`/messages?to=${m.id}`}>
                      <Icon name="messages" size={15} />
                      Message
                    </Link>
                    <button
                      className="icon-btn danger-text"
                      aria-label={`Remove ${m.name}`}
                      onClick={() => setRemove(m)}
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!members.length && (
        <Empty
          icon="team"
          title="No people found"
          description="Try another name, role, or email."
        />
      )}
      <p className="demo-footnote">
        <Icon name="shield" size={15} />
        Demo members and roles are local records. No invitations or account
        access are created.
      </p>
      {remove && (
        <Confirm
          title="Remove team member?"
          description={`${remove.name} will be removed from projects. Their tasks become unassigned and their demo message threads are deleted.`}
          onClose={() => setRemove(null)}
          onConfirm={() => {
            dispatch({ type: "DELETE_MEMBER", id: remove.id });
            notify("Demo member removed");
          }}
        />
      )}
    </>
  );
}
export function Messages() {
  const { state, dispatch, notify } = useWorkspace();
  const [params, setParams] = useSearchParams(),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [mobileThread, setMobileThread] = useState(!!params.get("to"));
  const end = useRef(null);
  const others = state.members.filter((m) => m.id !== state.profileId),
    selected = others.find((m) => m.id === params.get("to")) || others[0],
    conversation = state.messages.filter(
      (m) =>
        (m.from === selected?.id && m.to === state.profileId) ||
        (m.from === state.profileId && m.to === selected?.id),
    );
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [conversation.length, selected?.id]);
  const send = (e) => {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    dispatch({
      type: "MESSAGE",
      value: {
        id: uid(),
        from: state.profileId,
        to: selected.id,
        text: draft.trim(),
        at: new Date().toISOString(),
      },
    });
    setDraft("");
    notify("Message saved in this demo");
  };
  return (
    <>
      <PageHeader
        eyebrow="KEEP THE CONVERSATION GOING"
        title="Messages"
        description="A place to exchange ideas and stay in sync."
      >
        <Badge color="blue">
          <Icon name="shield" size={13} />
          Local demo conversations
        </Badge>
      </PageHeader>
      <div className={`messenger panel ${mobileThread ? "show-thread" : ""}`}>
        <aside className="conversations">
          <div className="conversation-heading">
            <h2>
              Inbox <span className="count">{others.length}</span>
            </h2>
            <Link className="icon-btn" to="/team" aria-label="Manage team">
              <Icon name="team" size={18} />
            </Link>
          </div>
          <label className="search-field">
            <Icon name="search" size={15} />
            <input
              aria-label="Search conversations"
              placeholder="Search conversations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="conversation-list">
            {others
              .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
              .map((m) => {
                const last = state.messages
                  .filter(
                    (x) =>
                      (x.from === m.id && x.to === state.profileId) ||
                      (x.from === state.profileId && x.to === m.id),
                  )
                  .at(-1);
                return (
                  <button
                    className={selected?.id === m.id ? "selected" : ""}
                    key={m.id}
                    onClick={() => {
                      setParams({ to: m.id });
                      setDraft("");
                      setMobileThread(true);
                    }}
                  >
                    <Avatar member={m} size="md" />
                    <span>
                      <strong>{m.name}</strong>
                      <small>
                        {last
                          ? `${last.from === state.profileId ? "You: " : ""}${last.text}`
                          : "Start a conversation"}
                      </small>
                    </span>
                    <time>{last ? relativeTime(last.at) : ""}</time>
                  </button>
                );
              })}
          </div>
          <div className="conversation-note">
            <Icon name="heart" />
            <p>
              A little conversation.
              <br />A lot of collaboration.
            </p>
          </div>
        </aside>
        <section className="message-thread">
          {selected ? (
            <>
              <header className="thread-heading">
                <button
                  className="icon-btn thread-back"
                  aria-label="Back to conversations"
                  onClick={() => setMobileThread(false)}
                >
                  <Icon name="back" />
                </button>
                <Avatar member={selected} size="md" />
                <div>
                  <h3>{selected.name}</h3>
                  <small>{selected.role}</small>
                </div>
                <Badge color="blue">Demo contact</Badge>
              </header>
              <div className="thread-notice">
                <Icon name="shield" size={14} />
                Messages stay in this browser. Nothing is delivered to real
                people.
              </div>
              <div className="message-scroll">
                <div className="conversation-start">
                  <Avatar member={selected} size="lg" />
                  <h3>{selected.name}</h3>
                  <p>This is the beginning of your demo conversation.</p>
                </div>
                {conversation.map((m) => (
                  <div
                    key={m.id}
                    className={`message ${m.from === state.profileId ? "outgoing" : ""}`}
                  >
                    {m.from !== state.profileId && <Avatar member={selected} />}
                    <div>
                      <p>{m.text}</p>
                      <div className="message-meta">
                        <time>
                          {new Date(m.at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        {m.from === state.profileId && (
                          <>
                            <span>Saved locally</span>
                            <button
                              aria-label="Delete your message"
                              onClick={() =>
                                dispatch({ type: "DELETE_MESSAGE", id: m.id })
                              }
                            >
                              <Icon name="delete" size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form className="message-composer" onSubmit={send}>
                <textarea
                  rows={1}
                  maxLength={2000}
                  aria-label="Write a message"
                  placeholder={`Write a message to ${selected.name.split(" ")[0]}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send(e);
                    }
                  }}
                />
                <button
                  className="btn primary"
                  aria-label="Save demo message"
                  disabled={!draft.trim()}
                >
                  <Icon name="send" size={18} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <Empty
              icon="messages"
              title="It starts with a hello"
              description="Add a demo team member to begin."
            >
              <Link className="btn primary" to="/team">
                Open team
              </Link>
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
export function Analytics() {
  const { state } = useWorkspace();
  const tasks = state.tasks,
    done = tasks.filter((t) => t.status === "done"),
    rate = progressOf(tasks),
    days = Array.from({ length: 7 }, (_, i) => shiftDate(i - 6)),
    counts = days.map(
      (d) =>
        done.filter(
          (t) => t.completedAt && dateKey(new Date(t.completedAt)) === d,
        ).length,
    ),
    max = Math.max(1, ...counts);
  const report = () =>
    downloadFile(
      "taska-progress-report.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalTasks: tasks.length,
          completed: done.length,
          completionRate: rate,
          overdue: tasks.filter(isOverdue).length,
          dailyCompletions: days.map((date, i) => ({ date, count: counts[i] })),
          projects: state.projects.map((p) => ({
            title: p.title,
            completionRate: progressOf(
              tasks.filter((t) => t.projectId === p.id),
            ),
          })),
        },
        null,
        2,
      ),
    );
  return (
    <>
      <PageHeader
        eyebrow="SMALL WINS. REAL MOMENTUM."
        title="A clearer picture"
        description="See how your work is moving, one task at a time."
      >
        <button className="btn" onClick={report}>
          <Icon name="download" size={16} />
          Export report
        </button>
      </PageHeader>
      <div className="analytics-stats">
        {[
          ["tasks", "Total tasks", tasks.length, "blue"],
          ["completed", "Completed", done.length, "green"],
          ["target", "Completion rate", `${rate}%`, "purple"],
          ["clock", "Overdue tasks", tasks.filter(isOverdue).length, "orange"],
        ].map(([icon, label, n, color]) => (
          <div key={label} className="panel analytics-stat">
            <span className={`soft-icon ${color}`}>
              <Icon name={icon} />
            </span>
            <div>
              <p>{label}</p>
              <strong>{n}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="panel chart-panel">
          <SectionTitle
            title="A week of progress"
            subtitle="Tasks completed in the last 7 days"
          >
            <Badge color="green">
              {counts.reduce((a, b) => a + b, 0)} completed
            </Badge>
          </SectionTitle>
          <div
            className="bar-chart"
            role="img"
            aria-label={days
              .map((d, i) => `${d}: ${counts[i]} tasks completed`)
              .join("; ")}
          >
            {days.map((d, i) => (
              <div className="bar-column" key={d}>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{ height: `${(counts[i] / max) * 82 + 3}%` }}
                  >
                    <strong>{counts[i]}</strong>
                  </div>
                </div>
                <span>
                  {new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
          <p className="chart-note">
            Based on completion dates in this workspace.
          </p>
        </section>
        <section className="panel chart-panel">
          <SectionTitle
            title="Tasks by status"
            subtitle="Every stage is a step forward"
          />
          <div className="status-visual">
            {STATUSES.map((s) => {
              const n = tasks.filter((t) => t.status === s.id).length;
              return (
                <div key={s.id}>
                  <span>
                    <i style={{ background: s.color }} />
                    {s.label}
                    <strong>{n}</strong>
                  </span>
                  <div className="status-track">
                    <i
                      style={{
                        background: s.color,
                        width: `${tasks.length ? (n / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <small>
                    {tasks.length ? Math.round((n / tasks.length) * 100) : 0}%
                    of all tasks
                  </small>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel chart-panel">
          <SectionTitle
            title="Project momentum"
            subtitle="A little closer to the finish line"
          />
          <div className="project-momentum">
            {state.projects.map((p) => {
              const ts = tasks.filter((t) => t.projectId === p.id);
              return (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <span className={`soft-icon ${p.color}`}>
                    <Icon name="projects" size={18} />
                  </span>
                  <div>
                    <strong>{p.title}</strong>
                    <small>
                      {ts.filter((t) => t.status === "done").length} of{" "}
                      {ts.length} complete
                    </small>
                    <Progress value={progressOf(ts)} color={p.color} />
                  </div>
                  <b>{progressOf(ts)}%</b>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="panel chart-panel">
          <SectionTitle
            title="Team workload"
            subtitle="Active tasks, by assignee"
          />
          <div className="workload-list">
            {[
              ...state.members,
              { id: "", name: "Unassigned", color: "blue" },
            ].map((m) => (
              <div key={m.id}>
                <Avatar member={m} />
                <span>{m.name}</span>
                <strong>
                  {
                    tasks.filter(
                      (t) => t.assigneeId === m.id && t.status !== "done",
                    ).length
                  }
                  <small> tasks</small>
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
export function Settings() {
  const { state, profile, dispatch, notify, replace, reset } = useWorkspace(),
    { openHelp } = useOutletContext();
  const [tab, setTab] = useState("profile"),
    [form, setForm] = useState(profile),
    [workspaceName, setWorkspaceName] = useState(state.settings.workspaceName),
    [confirm, setConfirm] = useState(false),
    [importData, setImportData] = useState(null);
  const inputRef = useRef(null);
  useEffect(() => setForm(profile), [profile]);
  useEffect(
    () => setWorkspaceName(state.settings.workspaceName),
    [state.settings.workspaceName],
  );
  const setting = (value) => {
    dispatch({ type: "SETTINGS", value });
    notify("Preference saved");
  };
  const saveProfile = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      notify("Enter a name and role", "error");
      return;
    }
    if (
      state.members.some(
        (m) =>
          m.id !== profile.id &&
          m.email.toLowerCase() === form.email.trim().toLowerCase(),
      )
    ) {
      notify("That email belongs to another member", "error");
      return;
    }
    dispatch({
      type: "MEMBER",
      value: {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role.trim(),
      },
    });
    notify("Profile updated");
  };
  const importBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("Choose a backup smaller than 5 MB", "error");
      return;
    }
    try {
      setImportData(validateWorkspace(JSON.parse(await file.text())));
    } catch {
      notify("This is not a valid Taska v1 JSON backup", "error");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="MAKE IT FEEL LIKE YOU"
        title="Settings"
        description="Your profile, your preferences, your workspace."
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {[
            ["profile", "user", "My profile"],
            ["workspace", "projects", "Workspace"],
            ["appearance", "palette", "Appearance"],
            ["data", "shield", "Data & backups"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
          <div className="settings-note">
            <Icon name="shield" size={24} />
            <p>Demo mode is on.</p>
            <small>Everything works in this browser. No backend needed.</small>
          </div>
        </nav>
        <section className="panel settings-panel">
          {tab === "profile" && (
            <form onSubmit={saveProfile}>
              <SectionTitle
                title="My profile"
                subtitle="The person behind the progress"
              />
              <div className="profile-editor">
                <Avatar member={form} size="xl" />
                <div>
                  <strong>{form.name || "Your name"}</strong>
                  <small>Choose an avatar color</small>
                  <ColorPicker
                    value={form.color}
                    onChange={(color) => setForm((f) => ({ ...f, color }))}
                  />
                </div>
              </div>
              <div className="form-grid">
                <Field label="Full name">
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Email address">
                  <input
                    required
                    type="email"
                    maxLength={160}
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Role / job title">
                  <input
                    required
                    maxLength={80}
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Account type">
                  <input readOnly value="Local demo profile" />
                </Field>
              </div>
              <p className="info-note">
                <Icon name="shield" size={17} />
                This is a local demo profile. No password or real account is
                created.
              </p>
              <div className="settings-form-footer">
                <Link className="text-btn" to="/welcome">
                  Preview welcome screen <Icon name="external" size={13} />
                </Link>
                <button className="btn primary">Save profile</button>
              </div>
            </form>
          )}
          {tab === "workspace" && (
            <>
              <SectionTitle
                title="Workspace preferences"
                subtitle="A space that works your way"
              />
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (workspaceName.trim())
                    setting({ workspaceName: workspaceName.trim() });
                }}
              >
                <Field label="Workspace name">
                  <input
                    required
                    maxLength={60}
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </Field>
                <button className="btn primary align-start">
                  Save workspace
                </button>
              </form>
              <div className="divider" />
              <div className="setting-row">
                <div>
                  <h3>Notification indicator</h3>
                  <p>Show a badge for unread activity.</p>
                </div>
                <Toggle
                  value={state.settings.notifications}
                  label="Notification indicator"
                  onChange={() =>
                    setting({ notifications: !state.settings.notifications })
                  }
                />
              </div>
              <div className="divider" />
              <h3>A little help goes a long way.</h3>
              <p className="muted small">Explore what you can do with Taska.</p>
              <button className="btn" onClick={openHelp}>
                <Icon name="help" size={17} />
                Getting started
              </button>
            </>
          )}
          {tab === "appearance" && (
            <>
              <SectionTitle
                title="A workspace in your style"
                subtitle="Choose the view that feels right"
              />
              <h3>Color theme</h3>
              <div className="theme-options">
                {[
                  ["light", "sun", "Light"],
                  ["dark", "moon", "Dark"],
                  ["system", "monitor", "System"],
                ].map(([id, icon, label]) => (
                  <button
                    key={id}
                    aria-pressed={state.settings.theme === id}
                    className={state.settings.theme === id ? "selected" : ""}
                    onClick={() => setting({ theme: id })}
                  >
                    <span className={`theme-preview ${id}`}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>
                      <Icon name={icon} size={16} />
                      {label}
                      {state.settings.theme === id && (
                        <Icon name="completed" size={16} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="divider" />
              <div className="setting-row">
                <div>
                  <h3>Compact task rows</h3>
                  <p>Fit a little more into your view.</p>
                </div>
                <Toggle
                  label="Compact task rows"
                  value={state.settings.compact}
                  onChange={() => setting({ compact: !state.settings.compact })}
                />
              </div>
            </>
          )}
          {tab === "data" && (
            <>
              <SectionTitle
                title="Your work. Your data."
                subtitle="Keep a copy, take it with you, or start fresh"
              />
              <div className="backup-summary">
                <span className="soft-icon blue">
                  <Icon name="shield" size={24} />
                </span>
                <div>
                  <strong>Saved in this browser</strong>
                  <p>
                    {state.projects.length} projects · {state.tasks.length}{" "}
                    tasks · {state.members.length} members
                  </p>
                </div>
                <Badge color="green">Demo mode</Badge>
              </div>
              <p className="muted small">
                Your workspace uses this browser’s local storage. Clearing site
                data removes it. Export a backup to move your work to another
                browser or device.
              </p>
              <div className="data-action">
                <div>
                  <h3>Export workspace</h3>
                  <p>
                    Download all projects, tasks, messages, comments, and
                    preferences as JSON.
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    downloadFile(
                      `taska-backup-${dateKey()}.json`,
                      exportWorkspace(state),
                    );
                    notify("Workspace backup exported");
                  }}
                >
                  <Icon name="download" size={16} />
                  Export backup
                </button>
              </div>
              <div className="data-action">
                <div>
                  <h3>Import workspace</h3>
                  <p>
                    Review a valid Taska backup before replacing your current
                    data.
                  </p>
                </div>
                <input
                  hidden
                  ref={inputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={importBackup}
                />
                <button
                  className="btn"
                  onClick={() => inputRef.current?.click()}
                >
                  <Icon name="upload" size={16} />
                  Import backup
                </button>
              </div>
              <div className="data-action">
                <div>
                  <h3 className="danger-text">Reset demo data</h3>
                  <p>
                    Restore the sample workspace. Export first to keep your
                    changes.
                  </p>
                </div>
                <button
                  className="btn danger-outline"
                  onClick={() => setConfirm(true)}
                >
                  <Icon name="reset" size={16} />
                  Reset demo
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      {confirm && (
        <Confirm
          title="Start fresh?"
          description="This replaces all projects, tasks, messages, comments, and settings in this browser with fresh sample data. Export a backup first if you want to keep your work."
          label="Reset demo"
          onClose={() => setConfirm(false)}
          onConfirm={reset}
        />
      )}
      {importData && (
        <Modal
          title="Restore this workspace?"
          onClose={() => setImportData(null)}
        >
          <div className="modal-content">
            <p>
              This backup contains{" "}
              <strong>{importData.projects.length} projects</strong>,{" "}
              <strong>{importData.tasks.length} tasks</strong>, and{" "}
              <strong>{importData.members.length} members</strong>.
            </p>
            <p>
              Restoring replaces all current data. Export your current workspace
              first if you need to keep it.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setImportData(null)}>
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={() => {
                replace(importData);
                setImportData(null);
                notify("Workspace restored");
              }}
            >
              Restore workspace
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Toggle({ value, label, onChange }) {
  return (
    <button
      className={`switch ${value ? "on" : ""}`}
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
export function Welcome() {
  const { state, profile, dispatch } = useWorkspace(),
    navigate = useNavigate();
  const [name, setName] = useState(profile.name),
    [workspace, setWorkspace] = useState(state.settings.workspaceName);
  return (
    <main className="welcome-page">
      <section className="welcome-story">
        <Link to="/" className="brand">
          <img src="/favicon.svg" alt="" />
          <span>taska.</span>
        </Link>
        <div>
          <span className="eyebrow">LESS BUSYWORK. MORE POSSIBILITY.</span>
          <h1>
            Your work.
            <br />
            Your people.
            <br />
            <em>All in flow.</em>
          </h1>
          <p>
            One thoughtful space to plan your projects, organize your day, and
            turn big ideas into small, meaningful steps.
          </p>
          <div className="welcome-mini-card">
            <span className="soft-icon green">
              <Icon name="completed" size={28} />
            </span>
            <div>
              <strong>Make room for great work.</strong>
              <p>A fresh perspective starts here.</p>
            </div>
            <span>✦</span>
          </div>
        </div>
        <small>Made for a little more focus, and a lot more possibility.</small>
      </section>
      <section className="welcome-form-section">
        <Badge color="blue">
          <Icon name="sparkles" size={14} />
          Your workspace is ready
        </Badge>
        <h2>Let’s make it happen.</h2>
        <p>
          Try the full experience. No account, password, or backend required.
        </p>
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !workspace.trim()) return;
            dispatch({
              type: "MEMBER",
              value: { ...profile, name: name.trim() },
            });
            dispatch({
              type: "SETTINGS",
              value: { workspaceName: workspace.trim() },
            });
            navigate("/");
          }}
        >
          <Field label="Your name">
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Workspace name">
            <input
              required
              maxLength={60}
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            />
          </Field>
          <button className="btn primary full-width">
            Enter demo workspace <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="welcome-privacy">
          <Icon name="shield" size={17} />
          This demo saves changes in your browser. Messages are local examples,
          and no real account is created.
        </p>
        <Link className="text-btn" to="/">
          Continue with current workspace <Icon name="arrow" size={14} />
        </Link>
      </section>
    </main>
  );
}
