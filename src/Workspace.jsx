import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDemoState } from "./seed.mjs";
import { reduceWorkspace, validateWorkspace, uid } from "./model.mjs";
const KEY = "taska.workspace.v1";
const Context = createContext(null);
function initial() {
  try {
    const s = localStorage.getItem(KEY);
    return {
      data: s ? validateWorkspace(JSON.parse(s)) : createDemoState(),
      warning: "",
    };
  } catch {
    return {
      data: createDemoState(),
      warning:
        "Saved data could not be loaded. This temporary demo will not overwrite it. Export a backup, then use Settings to reset or import.",
      blocked: true,
    };
  }
}
export function WorkspaceProvider({ children }) {
  const [init] = useState(initial);
  const [state, setState] = useState(init.data);
  const [warning, setWarning] = useState(init.warning);
  const blocked = useRef(init.blocked);
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Set());
  const notify = (message, type = "success") => {
    const id = uid();
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      timers.current.delete(timer);
    }, 4200);
    timers.current.add(timer);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (blocked.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setWarning("");
    } catch {
      setWarning(
        "Browser storage is unavailable or full. Export a backup to keep this session’s changes.",
      );
    }
  }, [state]);
  useEffect(() => {
    const handle = (e) => {
      if (e.key === KEY && e.newValue)
        try {
          setState(validateWorkspace(JSON.parse(e.newValue)));
        } catch {
          /* Keep valid local state. */
        }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        state.settings.theme === "system"
          ? m.matches
            ? "dark"
            : "light"
          : state.settings.theme;
      document.documentElement.dataset.compact = String(state.settings.compact);
    };
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, [state.settings.theme, state.settings.compact]);
  const dispatch = (action) => setState((s) => reduceWorkspace(s, action));
  const replace = (data) => {
    const valid = validateWorkspace(data);
    blocked.current = false;
    setState(valid);
  };
  const reset = () => {
    blocked.current = false;
    setState(createDemoState());
    notify("Demo workspace restored");
  };
  return (
    <Context.Provider
      value={{
        state,
        dispatch,
        notify,
        replace,
        reset,
        warning,
        profile: state.members.find((m) => m.id === state.profileId),
      }}
    >
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast ${t.type}`} key={t.id}>
            <span>{t.type === "error" ? "!" : "✓"}</span>
            {t.message}
            <button
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((items) => items.filter((x) => x.id !== t.id))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}
export const useWorkspace = () => useContext(Context);
