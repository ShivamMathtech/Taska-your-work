import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useWorkspace } from "./Workspace.jsx";
import { Avatar, Empty, Icon, Modal, relativeTime } from "./UI.jsx";
import {
  HelpDialog,
  MemberDialog,
  ProjectDialog,
  SearchDialog,
  TaskDialog,
} from "./Dialogs.jsx";
import {
  Dashboard,
  Projects,
  ProjectDetails,
  Tasks,
  Calendar,
} from "./WorkPages.jsx";
import {
  Team,
  Messages,
  Analytics,
  Settings,
  Welcome,
} from "./WorkspacePages.jsx";
const NAV = [
  ["/", "dashboard", "Overview"],
  ["/projects", "projects", "My projects"],
  ["/tasks", "tasks", "My tasks"],
  ["/calendar", "calendar", "Calendar"],
  ["/messages", "messages", "Messages"],
  ["/team", "team", "Team members"],
  ["/analytics", "analytics", "Analytics"],
];
export default function App() {
  const { state, profile, dispatch, warning } = useWorkspace(),
    location = useLocation(),
    navigate = useNavigate();
  const [dialog, setDialog] = useState(null),
    [sidebar, setSidebar] = useState(false);
  const close = () => setDialog(null);
  const actions = {
    openTask: (task, defaults = {}) =>
      setDialog({ type: "task", taskId: task?.id, defaults }),
    openProject: (project) => setDialog({ type: "project", project }),
    openMember: (member) => setDialog({ type: "member", member }),
    openHelp: () => setDialog({ type: "help" }),
  };
  useEffect(() => {
    setSidebar(false);
    window.scrollTo(0, 0);
    document.title =
      (NAV.find(([path]) => path === location.pathname)?.[2] || "Workspace") +
      " · Taska";
  }, [location.pathname]);
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDialog((d) => (d?.type === "search" ? null : { type: "search" }));
      }
      if (e.key === "Escape") setSidebar(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const myTasks = state.tasks.filter(
    (t) => t.assigneeId === state.profileId && t.status !== "done",
  ).length;
  return (
    <>
      {location.pathname === "/welcome" ? (
        <Welcome />
      ) : (
        <div className="app-shell">
          {sidebar && (
            <button
              className="sidebar-overlay"
              aria-label="Close navigation"
              onClick={() => setSidebar(false)}
            />
          )}
          <aside
            className={`sidebar ${sidebar ? "open" : ""}`}
            aria-label="Main navigation"
          >
            <Link to="/" className="brand">
              <img src="/favicon.svg" alt="" />
              <span>
                taska<span>.</span>
              </span>
            </Link>
            <button
              className="workspace-switch"
              onClick={() => navigate("/settings")}
            >
              <span className="workspace-icon">
                C<small>✦</small>
              </span>
              <span>
                <strong>{state.settings.workspaceName}</strong>
                <small>Personal workspace</small>
              </span>
              <Icon name="down" size={14} />
            </button>
            <div className="nav-label">WORKSPACE</div>
            <nav>
              {NAV.map(([path, icon, label]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon name={icon} size={19} />
                  <span>{label}</span>
                  {path === "/tasks" && myTasks > 0 && (
                    <b className="nav-count">{myTasks}</b>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="nav-label favorite-label">
              FAVORITE PROJECTS
              <button
                className="icon-btn"
                aria-label="Create project"
                onClick={() => actions.openProject()}
              >
                <Icon name="plus" size={15} />
              </button>
            </div>
            <nav className="favorites">
              {state.projects
                .filter((p) => p.favorite && p.status === "active")
                .slice(0, 5)
                .map((p) => (
                  <NavLink key={p.id} to={`/projects/${p.id}`}>
                    <i className={`project-dot ${p.color}`} />
                    {p.title}
                  </NavLink>
                ))}
              {!state.projects.some(
                (p) => p.favorite && p.status === "active",
              ) && (
                <p className="muted small">Star a project to pin it here.</p>
              )}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <span>✳</span>
                <h3>
                  A little focus.
                  <br />A lot of possibility.
                </h3>
                <p>Your next great idea starts here.</p>
                <button onClick={() => actions.openProject()}>
                  Create a project <Icon name="arrow" size={14} />
                </button>
              </div>
              <button className="nav-link" onClick={actions.openHelp}>
                <Icon name="help" size={19} />
                Help & getting started
              </button>
              <NavLink className="nav-link" to="/settings">
                <Icon name="settings" size={19} />
                Settings
              </NavLink>
              <div className="local-status">
                <i />
                Demo workspace · saved locally
              </div>
            </div>
          </aside>
          <div className="app-main">
            <header className="topbar">
              <button
                className="icon-btn mobile-menu"
                aria-label="Open navigation"
                onClick={() => setSidebar(true)}
              >
                <Icon name="menu" />
              </button>
              <div className="breadcrumbs">
                Workspace <Icon name="right" size={14} />
                <strong>
                  {location.pathname.startsWith("/projects/")
                    ? "Project details"
                    : NAV.find(([p]) => p === location.pathname)?.[2] ||
                      "Settings"}
                </strong>
              </div>
              <button
                className="global-search"
                aria-label="Search workspace"
                onClick={() => setDialog({ type: "search" })}
              >
                <Icon name="search" size={17} />
                <span>Search anything…</span>
                <kbd>⌘ K</kbd>
              </button>
              <div className="topbar-actions">
                <span className="demo-badge">
                  <i />
                  Demo mode
                </span>
                <button
                  className="icon-btn notification-button"
                  aria-label="View notifications"
                  onClick={() => setDialog({ type: "notifications" })}
                >
                  <Icon name="bell" />
                  {state.settings.notifications &&
                    state.activity.some((a) => !a.read) && <i />}
                </button>
                <button
                  className="profile-button"
                  aria-label="Open profile settings"
                  onClick={() => navigate("/settings")}
                >
                  <Avatar member={profile} size="md" />
                  <span>
                    <strong>{profile.name}</strong>
                    <small>{profile.role}</small>
                  </span>
                  <Icon name="down" size={14} />
                </button>
              </div>
            </header>
            {warning && (
              <div className="storage-warning">
                <Icon name="alert" size={18} />
                {warning}
                <Link to="/settings">Open settings</Link>
              </div>
            )}
            <main className="page-content">
              <Routes>
                <Route element={<Outlet context={actions} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                  <Route
                    path="projects/:projectId"
                    element={<ProjectDetails />}
                  />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="team" element={<Team />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                  <Route
                    path="*"
                    element={
                      <Empty
                        icon="search"
                        title="This page took a detour"
                        description="Let’s head back to your workspace."
                      >
                        <Link className="btn primary" to="/">
                          Back to overview
                        </Link>
                      </Empty>
                    }
                  />
                </Route>
              </Routes>
            </main>
            <footer className="app-footer">
              <span>Made for a little more flow.</span>
              <span>Taska ✦ Your work, beautifully organized</span>
            </footer>
          </div>
          <nav className="mobile-bottom" aria-label="Mobile navigation">
            {NAV.slice(0, 4).map(([path, icon, label]) => (
              <NavLink key={path} to={path} end={path === "/"}>
                <Icon name={icon} />
                <span>{label.replace("My ", "")}</span>
              </NavLink>
            ))}
            <button aria-label="Create task" onClick={() => actions.openTask()}>
              <Icon name="plus" />
            </button>
          </nav>
        </div>
      )}
      {dialog?.type === "task" && (
        <TaskDialog key={dialog.taskId || "new"} {...dialog} onClose={close} />
      )}
      {dialog?.type === "project" && (
        <ProjectDialog project={dialog.project} onClose={close} />
      )}
      {dialog?.type === "member" && (
        <MemberDialog member={dialog.member} onClose={close} />
      )}
      {dialog?.type === "search" && (
        <SearchDialog onClose={close} onTask={actions.openTask} />
      )}
      {dialog?.type === "help" && <HelpDialog onClose={close} />}
      {dialog?.type === "notifications" && (
        <Modal title="Your notifications" onClose={close} drawer>
          <div className="modal-content">
            <div className="section-heading">
              <span className="muted small">All workspace activity</span>
              <button
                className="text-btn"
                onClick={() => dispatch({ type: "READ" })}
              >
                <Icon name="checks" size={16} />
                Mark all as read
              </button>
            </div>
            <div className="notification-list">
              {state.activity.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    dispatch({ type: "READ" });
                    const t = state.tasks.find((t) => t.id === a.taskId);
                    if (t) actions.openTask(t);
                    else {
                      if (state.projects.some((p) => p.id === a.projectId))
                        navigate(`/projects/${a.projectId}`);
                      close();
                    }
                  }}
                >
                  <span className="soft-icon blue">
                    <Icon name="bell" size={18} />
                  </span>
                  <span>
                    <strong>{a.text}</strong>
                    <small>{relativeTime(a.at)}</small>
                  </span>
                  {!a.read && <i />}
                </button>
              ))}
            </div>
            {!state.activity.length && (
              <Empty
                title="All caught up"
                description="New activity will appear here."
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
