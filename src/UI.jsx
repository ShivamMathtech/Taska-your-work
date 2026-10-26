import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  CalendarDays,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  X,
  Check,
  CheckCheck,
  Clock3,
  Flag,
  Trash2,
  Pencil,
  Star,
  Grid2X2,
  List,
  SlidersHorizontal,
  Download,
  Upload,
  HelpCircle,
  Menu,
  Send,
  Circle,
  Layers,
  Zap,
  Sparkles,
  Target,
  ExternalLink,
  Sun,
  Moon,
  GripVertical,
  ArrowLeft,
  Archive,
  RefreshCw,
  AlertCircle,
  CircleCheck,
  ShieldCheck,
  UserRound,
  Palette,
  Monitor,
  Heart,
  Rocket,
} from "lucide-react";
import {
  COLORS,
  displayDate,
  initials,
  isOverdue,
  progressOf,
  STATUSES,
} from "./model.mjs";
import { useWorkspace } from "./Workspace.jsx";
const icons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  tasks: CheckSquare2,
  calendar: CalendarDays,
  messages: MessageSquare,
  team: Users,
  analytics: BarChart3,
  settings: Settings,
  search: Search,
  bell: Bell,
  plus: Plus,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
  upRight: ArrowUpRight,
  arrow: ArrowRight,
  close: X,
  check: Check,
  checks: CheckCheck,
  clock: Clock3,
  flag: Flag,
  delete: Trash2,
  edit: Pencil,
  star: Star,
  grid: Grid2X2,
  list: List,
  filter: SlidersHorizontal,
  download: Download,
  upload: Upload,
  help: HelpCircle,
  menu: Menu,
  send: Send,
  circle: Circle,
  layers: Layers,
  zap: Zap,
  sparkles: Sparkles,
  target: Target,
  external: ExternalLink,
  sun: Sun,
  moon: Moon,
  grip: GripVertical,
  back: ArrowLeft,
  archive: Archive,
  reset: RefreshCw,
  alert: AlertCircle,
  completed: CircleCheck,
  shield: ShieldCheck,
  user: UserRound,
  palette: Palette,
  monitor: Monitor,
  heart: Heart,
  rocket: Rocket,
};
export function Icon({ name, size = 20, ...props }) {
  const C = icons[name] || Circle;
  return <C size={size} strokeWidth={1.8} aria-hidden="true" {...props} />;
}
export function Avatar({ member, size = "" }) {
  return (
    <span
      title={member?.name || "Unassigned"}
      className={`avatar ${member?.color || "blue"} ${size}`}
    >
      {member ? initials(member.name) : "?"}
    </span>
  );
}
export function AvatarGroup({ ids = [], max = 3 }) {
  const { state } = useWorkspace();
  return (
    <div className="avatar-group">
      {ids.slice(0, max).map((id) => (
        <Avatar key={id} member={state.members.find((m) => m.id === id)} />
      ))}
      {ids.length > max && (
        <span className="avatar overflow">+{ids.length - max}</span>
      )}
    </div>
  );
}
export function Badge({ children, color = "" }) {
  return <span className={`badge ${color}`}>{children}</span>;
}
export function Priority({ value }) {
  return (
    <Badge color={value}>
      <Icon name="flag" size={11} />
      {value[0].toUpperCase() + value.slice(1)}
    </Badge>
  );
}
export function Progress({ value, color = "blue" }) {
  return (
    <div
      className={`progress ${color}`}
      role="progressbar"
      aria-label="Project completion"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function SectionTitle({ title, subtitle, children }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({
  icon = "tasks",
  title = "A little room for something great.",
  description = "Create a task to get started.",
  children,
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Cover({ color = "blue", large = false }) {
  return (
    <div
      className={`cover cover-${color} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      <i className="cover-orbit one" />
      <i className="cover-orbit two" />
      <i className="cover-pill" />
      <i className="cover-sphere" />
      <span className="cover-spark">✳</span>
      <span className="cover-caption">
        {
          {
            blue: "make it flow.",
            purple: "a new perspective.",
            orange: "bold by design.",
            green: "built together.",
            pink: "ideas in motion.",
            teal: "stay curious.",
          }[color]
        }
      </span>
    </div>
  );
}
export function ProjectCard({ project, layout = "grid" }) {
  const { state, dispatch } = useWorkspace();
  const tasks = state.tasks.filter((t) => t.projectId === project.id),
    progress = progressOf(tasks);
  return (
    <article className={`project-card ${layout}`}>
      <Link to={`/projects/${project.id}`} tabIndex={-1} aria-hidden="true">
        <Cover color={project.color} />
      </Link>
      <div className="project-card-body">
        <div className="project-title">
          <Link to={`/projects/${project.id}`}>
            <h3>{project.title}</h3>
          </Link>
          <button
            className={`icon-btn star ${project.favorite ? "selected" : ""}`}
            aria-label={`${project.favorite ? "Unfavorite" : "Favorite"} ${project.title}`}
            onClick={() =>
              dispatch({
                type: "PROJECT",
                value: { ...project, favorite: !project.favorite },
              })
            }
          >
            <Icon name="star" size={17} />
          </button>
        </div>
        <p className="card-description">{project.description}</p>
        <div className="progress-label">
          <span>Progress</span>
          <strong>{progress}%</strong>
        </div>
        <Progress value={progress} color={project.color} />
        <div className="project-card-footer">
          <AvatarGroup ids={project.memberIds} />
          <span className="muted small">
            <Icon name="tasks" size={13} />
            {tasks.filter((t) => t.status === "done").length}/{tasks.length}
          </span>
          <span className="due">
            <Icon name="calendar" size={12} />
            {displayDate(project.dueDate)}
          </span>
        </div>
      </div>
    </article>
  );
}
export function TaskRow({ task, onOpen, showProject = true }) {
  const { state, dispatch } = useWorkspace();
  const p = state.projects.find((p) => p.id === task.projectId);
  return (
    <div className={`task-row ${task.status === "done" ? "is-done" : ""}`}>
      <button
        className={`check-button ${task.status === "done" ? "checked" : ""}`}
        aria-label={`${task.status === "done" ? "Reopen" : "Complete"} ${task.title}`}
        onClick={() =>
          dispatch({
            type: "MOVE",
            id: task.id,
            status: task.status === "done" ? "todo" : "done",
          })
        }
      >
        {task.status === "done" && <Icon name="check" size={13} />}
      </button>
      <button className="task-row-main" onClick={() => onOpen(task)}>
        <span>{task.title}</span>
        {showProject && (
          <small>
            <i className={`project-dot ${p?.color}`} />
            {p?.title}
          </small>
        )}
      </button>
      <div className="task-row-meta">
        <Priority value={task.priority} />
        <span className={`due ${isOverdue(task) ? "overdue" : ""}`}>
          <Icon name="calendar" size={13} />
          {displayDate(task.dueDate)}
        </span>
        <Avatar member={state.members.find((m) => m.id === task.assigneeId)} />
      </div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  drawer = false,
}) {
  const ref = useRef(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = ref.current;
    (
      root.querySelector("[autofocus]") ||
      root.querySelector("input:not([type=hidden]),textarea,select") ||
      root.querySelector("button")
    )?.focus();
    const key = (e) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const els = [
          ...root.querySelectorAll(
            'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]',
          ),
        ].filter((el) => el.getClientRects().length);
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div
      className={`modal-backdrop ${drawer ? "drawer-backdrop" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`modal ${wide ? "wide" : ""} ${drawer ? "drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
export function Confirm({
  title,
  description,
  onClose,
  onConfirm,
  label = "Delete",
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-content">
        <span className="soft-icon orange">
          <Icon name="alert" />
        </span>
        <p className="confirm-copy">{description}</p>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {label}
        </button>
      </div>
    </Modal>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function ColorPicker({ value, onChange }) {
  return (
    <div className="color-picker" role="group" aria-label="Color">
      {COLORS.map((c) => (
        <button
          type="button"
          key={c}
          className={`color-swatch ${c} ${value === c ? "selected" : ""}`}
          aria-label={`Choose ${c}`}
          aria-pressed={value === c}
          onClick={() => onChange(c)}
        >
          {value === c && <Icon name="check" size={14} />}
        </button>
      ))}
    </div>
  );
}
export function downloadFile(name, content, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function relativeTime(value) {
  const n = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  return n < 1
    ? "Just now"
    : n < 60
      ? `${n}m ago`
      : n < 1440
        ? `${Math.floor(n / 60)}h ago`
        : `${Math.floor(n / 1440)}d ago`;
}
