import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "./Workspace.jsx";
import { uid, dateKey, displayDate, STATUSES } from "./model.mjs";
import {
  Avatar,
  Badge,
  ColorPicker,
  Cover,
  Empty,
  Field,
  Icon,
  Modal,
  Priority,
  relativeTime,
} from "./UI.jsx";
export function ProjectDialog({ project, onClose }) {
  const { state, dispatch, notify } = useWorkspace(),
    navigate = useNavigate();
  const [form, setForm] = useState(
    project || {
      title: "",
      description: "",
      color: "blue",
      dueDate: "",
      memberIds: [state.profileId],
      status: "active",
      favorite: false,
    },
  );
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const p = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      id: project?.id || uid(),
      createdAt: project?.createdAt || new Date().toISOString(),
    };
    dispatch({ type: "PROJECT", value: p });
    notify(project ? "Project updated" : "Your new project is ready");
    onClose();
    if (!project) navigate(`/projects/${p.id}`);
  };
  return (
    <Modal
      title={project ? "Edit project" : "A new space for your ideas"}
      onClose={onClose}
      wide
    >
      <form onSubmit={save}>
        <div className="modal-content form-stack">
          <Cover color={form.color} />
          <Field label="Project name">
            <input
              required
              maxLength={100}
              placeholder="e.g. Website redesign"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field label="Description">
            <textarea
              maxLength={2000}
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What are we making happen?"
            />
          </Field>
          <div className="form-grid">
            <Field label="Due date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </Field>
            <Field label="Project status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
          <div className="field">
            <span>Cover color</span>
            <ColorPicker
              value={form.color}
              onChange={(c) => update("color", c)}
            />
          </div>
          <div className="field">
            <span>Project team</span>
            <div className="member-picker">
              {state.members.map((m) => (
                <label key={m.id}>
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(m.id)}
                    onChange={(e) =>
                      update(
                        "memberIds",
                        e.target.checked
                          ? [...form.memberIds, m.id]
                          : form.memberIds.filter((id) => id !== m.id),
                      )
                    }
                  />
                  <Avatar member={m} />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary">
            {project ? "Save changes" : "Create project"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export function TaskDialog({ taskId, defaults = {}, onClose }) {
  const { state, dispatch, notify, profile } = useWorkspace();
  const task = state.tasks.find((t) => t.id === taskId);
  const [editing, setEditing] = useState(!task),
    [comment, setComment] = useState(""),
    [subtask, setSubtask] = useState(""),
    [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(
    task || {
      title: "",
      description: "",
      projectId:
        defaults.projectId ||
        state.projects.find((p) => p.status === "active")?.id ||
        state.projects[0]?.id ||
        "",
      status: defaults.status || "todo",
      priority: "medium",
      assigneeId: state.profileId,
      dueDate: defaults.dueDate || dateKey(),
      tags: [],
      subtasks: [],
      comments: [],
    },
  );
  const [tags, setTags] = useState(form.tags.join(", "));
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = (e) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !state.projects.some((p) => p.id === form.projectId)
    )
      return;
    dispatch({
      type: "TASK",
      value: {
        ...form,
        comments: task?.comments || [],
        subtasks: task?.subtasks || [],
        title: form.title.trim(),
        description: form.description.trim(),
        tags: [
          ...new Set(
            tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ].slice(0, 8),
        id: task?.id || uid(),
        createdAt: task?.createdAt || new Date().toISOString(),
        completedAt: task?.completedAt || null,
      },
    });
    notify(task ? "Task updated" : "Task created");
    if (task) setEditing(false);
    else onClose();
  };
  if (taskId && !task)
    return (
      <Modal title="Task unavailable" onClose={onClose}>
        <Empty
          title="This task was removed"
          description="It may have been deleted in another tab."
        />
      </Modal>
    );
  return (
    <Modal
      title={
        editing ? (task ? "Edit task" : "Create a new task") : "Task details"
      }
      onClose={onClose}
      drawer
    >
      {editing ? (
        <form onSubmit={save}>
          <div className="modal-content form-stack">
            <Field label="Task name">
              <input
                autoFocus
                required
                maxLength={160}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="What needs to be done?"
              />
            </Field>
            <Field label="Project">
              <select
                required
                value={form.projectId}
                onChange={(e) => update("projectId", e.target.value)}
              >
                <option value="" disabled>
                  Select a project
                </option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.status === "archived" ? " (archived)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            {!state.projects.length && (
              <p className="info-note">
                Create a project before adding a task.
              </p>
            )}
            <Field label="Description">
              <textarea
                rows={4}
                maxLength={4000}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Add a little context…"
              />
            </Field>
            <div className="form-grid">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                >
                  {["low", "medium", "high"].map((v) => (
                    <option key={v} value={v}>
                      {v[0].toUpperCase() + v.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Assignee">
                <select
                  value={form.assigneeId}
                  onChange={(e) => update("assigneeId", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {state.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Due date">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => update("dueDate", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Tags" hint="Separate tags with commas; up to 8 tags.">
              <input
                maxLength={200}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Design, Research"
              />
            </Field>
          </div>
          <footer className="modal-footer">
            <button
              type="button"
              className="btn"
              onClick={() => (task ? setEditing(false) : onClose())}
            >
              Cancel
            </button>
            <button className="btn primary" disabled={!state.projects.length}>
              {task ? "Save changes" : "Create task"}
            </button>
          </footer>
        </form>
      ) : (
        <div className="modal-content task-detail">
          <div className="detail-breadcrumb">
            <Icon name="projects" size={15} />
            {state.projects.find((p) => p.id === task.projectId)?.title}
          </div>
          <h2>{task.title}</h2>
          <div className="detail-actions">
            <button
              className={`btn ${task.status === "done" ? "success" : "primary"}`}
              onClick={() =>
                dispatch({
                  type: "MOVE",
                  id: task.id,
                  status: task.status === "done" ? "todo" : "done",
                })
              }
            >
              <Icon name="check" size={17} />
              {task.status === "done" ? "Completed · reopen" : "Mark complete"}
            </button>
            <button
              className="btn"
              onClick={() => {
                setForm(task);
                setTags(task.tags.join(", "));
                setEditing(true);
              }}
            >
              <Icon name="edit" size={15} />
              Edit task
            </button>
          </div>
          <dl className="detail-properties">
            <dt>Assignee</dt>
            <dd>
              <Avatar
                member={state.members.find((m) => m.id === task.assigneeId)}
              />
              {state.members.find((m) => m.id === task.assigneeId)?.name ||
                "Unassigned"}
            </dd>
            <dt>Due date</dt>
            <dd>{displayDate(task.dueDate)}</dd>
            <dt>Status</dt>
            <dd>
              <select
                aria-label="Task status"
                value={task.status}
                onChange={(e) =>
                  dispatch({
                    type: "MOVE",
                    id: task.id,
                    status: e.target.value,
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </dd>
            <dt>Priority</dt>
            <dd>
              <Priority value={task.priority} />
            </dd>
          </dl>
          <div className="tag-list">
            {task.tags.map((t) => (
              <Badge key={t} color="blue">
                {t}
              </Badge>
            ))}
          </div>
          <h3>Description</h3>
          <p className="description-text">
            {task.description ||
              "No description yet. Edit this task to add some context."}
          </p>
          <Section
            title={`Checklist · ${task.subtasks.filter((s) => s.done).length}/${task.subtasks.length}`}
          />
          <div className="checklist">
            {task.subtasks.map((s) => (
              <div key={s.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() =>
                      dispatch({ type: "CHECK", taskId: task.id, id: s.id })
                    }
                  />
                  <span className={s.done ? "crossed" : ""}>{s.title}</span>
                </label>
                <button
                  className="icon-btn"
                  aria-label={`Delete checklist item ${s.title}`}
                  onClick={() =>
                    dispatch({
                      type: "TASK",
                      value: {
                        ...task,
                        subtasks: task.subtasks.filter((x) => x.id !== s.id),
                      },
                    })
                  }
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!subtask.trim()) return;
              dispatch({
                type: "TASK",
                value: {
                  ...task,
                  subtasks: [
                    ...task.subtasks,
                    { id: uid(), title: subtask.trim(), done: false },
                  ],
                },
              });
              setSubtask("");
            }}
          >
            <input
              aria-label="New checklist item"
              maxLength={160}
              placeholder="Add a checklist item…"
              value={subtask}
              onChange={(e) => setSubtask(e.target.value)}
            />
            <button
              className="btn"
              aria-label="Add checklist item"
              disabled={!subtask.trim() || task.subtasks.length >= 100}
            >
              <Icon name="plus" size={17} />
            </button>
          </form>
          <h3>
            Comments <span className="count">{task.comments.length}</span>
          </h3>
          <div className="comments">
            {task.comments.map((c) => (
              <div className="comment" key={c.id}>
                <Avatar member={{ name: c.author, color: "purple" }} />
                <div>
                  <strong>{c.author}</strong>
                  <small>{relativeTime(c.at)}</small>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
            {!task.comments.length && (
              <p className="muted small">
                Start the conversation. Comments stay in this demo.
              </p>
            )}
          </div>
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              dispatch({
                type: "COMMENT",
                id: task.id,
                value: {
                  id: uid(),
                  author: profile.name,
                  text: comment.trim(),
                  at: new Date().toISOString(),
                },
              });
              setComment("");
              notify("Comment added");
            }}
          >
            <textarea
              rows={2}
              aria-label="Write a comment"
              maxLength={2000}
              placeholder="Share an update…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="btn primary"
              disabled={!comment.trim() || task.comments.length >= 500}
            >
              <Icon name="send" size={15} />
              Post comment
            </button>
          </form>
          <div className="danger-zone">
            {deleting ? (
              <>
                <p>Delete this task and its comments? This cannot be undone.</p>
                <button
                  className="btn danger"
                  onClick={() => {
                    dispatch({ type: "DELETE_TASK", id: task.id });
                    notify("Task deleted");
                    onClose();
                  }}
                >
                  Yes, delete task
                </button>
                <button className="btn" onClick={() => setDeleting(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="text-btn danger-text"
                onClick={() => setDeleting(true)}
              >
                <Icon name="delete" size={15} />
                Delete task
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
function Section({ title }) {
  return <h3>{title}</h3>;
}
export function MemberDialog({ member, onClose }) {
  const { state, dispatch, notify } = useWorkspace();
  const [form, setForm] = useState(
      member || { name: "", email: "", role: "Team member", color: "purple" },
    ),
    [error, setError] = useState("");
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    const email = form.email.trim().toLowerCase();
    if (
      state.members.some(
        (m) => m.id !== member?.id && m.email.toLowerCase() === email,
      )
    ) {
      setError("This email already belongs to a member.");
      return;
    }
    dispatch({
      type: "MEMBER",
      value: {
        ...form,
        id: member?.id || uid(),
        name: form.name.trim(),
        role: form.role.trim(),
        email,
      },
    });
    notify(member ? "Member updated" : "Demo member added");
    onClose();
  };
  return (
    <Modal
      title={member ? "Edit team member" : "Bring your team together"}
      onClose={onClose}
    >
      <form onSubmit={save}>
        <div className="modal-content form-stack">
          <p className="info-note">
            <Icon name="team" size={18} />
            Demo members are local records. No invitation email is sent.
          </p>
          <div className="center">
            <Avatar
              member={{ ...form, name: form.name || "New Member" }}
              size="xl"
            />
          </div>
          <Field label="Full name">
            <input
              required
              maxLength={80}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Email address">
            <input
              required
              type="email"
              maxLength={160}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Role">
            <input
              required
              maxLength={80}
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </Field>
          <ColorPicker
            value={form.color}
            onChange={(v) => update("color", v)}
          />
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary">
            {member ? "Save changes" : "Add member"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export function SearchDialog({ onClose, onTask }) {
  const { state } = useWorkspace(),
    navigate = useNavigate();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase(),
    projects = state.projects
      .filter((p) => p.title.toLowerCase().includes(query))
      .slice(0, 5),
    tasks = state.tasks
      .filter((t) =>
        `${t.title} ${t.description} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  return (
    <Modal title="Find your flow" onClose={onClose} wide>
      <div className="search-modal-input">
        <Icon name="search" />
        <input
          autoFocus
          aria-label="Search workspace"
          placeholder="Search projects, tasks, and ideas…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <kbd>ESC</kbd>
      </div>
      <div className="search-results">
        <div className="eyebrow">PROJECTS</div>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              navigate(`/projects/${p.id}`);
              onClose();
            }}
          >
            <span className={`soft-icon ${p.color}`}>
              <Icon name="projects" size={18} />
            </span>
            <div>
              <strong>{p.title}</strong>
              <small>{p.description}</small>
            </div>
            <Icon name="arrow" size={16} />
          </button>
        ))}
        <div className="eyebrow">TASKS</div>
        {tasks.map((t) => (
          <button key={t.id} onClick={() => onTask(t)}>
            <Icon name="tasks" />
            <div>
              <strong>{t.title}</strong>
              <small>
                {state.projects.find((p) => p.id === t.projectId)?.title}
              </small>
            </div>
            <Priority value={t.priority} />
          </button>
        ))}
        {!projects.length && !tasks.length && (
          <Empty
            icon="search"
            title="No matches just yet"
            description="Try a different name, phrase, or tag."
          />
        )}
      </div>
    </Modal>
  );
}
export function HelpDialog({ onClose }) {
  return (
    <Modal title="A little help to find your flow" onClose={onClose} wide>
      <div className="modal-content">
        <div className="help-intro">
          <Icon name="sparkles" size={32} />
          <h2>Big ideas start with a small step.</h2>
          <p>Your workspace is ready to explore.</p>
        </div>
        {[
          [
            "projects",
            "Make room for a project",
            "Create a project, choose a color, add a deadline and select your demo team. Star it to pin it in the sidebar.",
          ],
          [
            "tasks",
            "Turn ideas into action",
            "Add tasks, assign owners, set priorities, and build checklists. Drag board cards between columns or use their status menus on any device.",
          ],
          [
            "calendar",
            "See the bigger picture",
            "Explore deadlines by month. Select a date to see its tasks or add a new one.",
          ],
          [
            "shield",
            "A demo that remembers",
            "Changes are saved in this browser. Export a backup in Settings to keep your work or move it to another device.",
          ],
          [
            "messages",
            "Try the conversation flow",
            "Messages and comments are local demonstrations. They are never sent to real people.",
          ],
        ].map(([icon, title, body]) => (
          <div className="help-item" key={icon}>
            <span className="soft-icon blue">
              <Icon name={icon} />
            </span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </div>
        ))}
        <div className="shortcut-hint">
          <kbd>Ctrl / ⌘</kbd> + <kbd>K</kbd> Search your workspace
        </div>
      </div>
      <footer className="modal-footer">
        <button className="btn primary" onClick={onClose}>
          Let’s get started <Icon name="arrow" size={16} />
        </button>
      </footer>
    </Modal>
  );
}
