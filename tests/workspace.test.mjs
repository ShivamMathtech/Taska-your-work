import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState } from "../src/seed.mjs";
import {
  uid,
  dateKey,
  shiftDate,
  progressOf,
  filterTasks,
  reduceWorkspace,
  validateWorkspace,
  exportWorkspace,
  tasksToCSV,
} from "../src/model.mjs";
const base = new Date("2026-10-25T12:00:00Z");
const seed = () => createDemoState(base);
const at = "2026-10-26T12:00:00.000Z";

test("demo seed is complete and survives a validated backup round trip", () => {
  const state = seed();
  assert.equal(state.projects.length, 6);
  assert.equal(state.tasks.length, 32);
  assert.equal(state.members.length, 6);
  const restored = validateWorkspace(JSON.parse(exportWorkspace(state)));
  assert.deepEqual(restored, state);
  restored.projects[0].title = "Changed";
  assert.notEqual(restored.projects[0].title, state.projects[0].title);
});

test("IDs work without randomUUID in an HTTP demo and have correct UUID bits", () => {
  const id = uid({ getRandomValues: (bytes) => bytes.fill(255) });
  assert.equal(id, "ffffffff-ffff-4fff-bfff-ffffffffffff");
  assert.equal(uid({ randomUUID: () => "secure-id" }), "secure-id");
  assert.notEqual(uid(), uid());
});

test("project creation, editing, and deletion preserve unrelated projects", () => {
  const state = seed();
  const project = {
    ...state.projects[0],
    id: "new-project",
    title: "New project",
  };
  const created = reduceWorkspace(state, {
    type: "PROJECT",
    value: project,
    at,
  });
  assert.equal(created.projects.length, 7);
  const edited = reduceWorkspace(created, {
    type: "PROJECT",
    value: { ...project, title: "Renamed" },
    at,
  });
  assert.equal(edited.projects.length, 7);
  assert.equal(
    edited.projects.find((p) => p.id === project.id).title,
    "Renamed",
  );
  const deleted = reduceWorkspace(edited, {
    type: "DELETE_PROJECT",
    id: "p1",
    at,
  });
  assert.equal(
    deleted.tasks.some((t) => t.projectId === "p1"),
    false,
  );
  assert.deepEqual(
    deleted.tasks,
    state.tasks.filter((t) => t.projectId !== "p1"),
  );
  validateWorkspace(deleted);
});

test("task completion records time and reopening updates progress without losing details", () => {
  const state = seed();
  const task = state.tasks.find((t) => t.id === "t4");
  const done = reduceWorkspace(state, {
    type: "MOVE",
    id: task.id,
    status: "done",
    at,
  });
  const changed = done.tasks.find((t) => t.id === task.id);
  assert.equal(changed.completedAt, at);
  assert.deepEqual(changed.comments, task.comments);
  assert.deepEqual(changed.subtasks, task.subtasks);
  assert.equal(progressOf(done.tasks.filter((t) => t.projectId === "p1")), 50);
  const reopen = reduceWorkspace(done, {
    type: "MOVE",
    id: task.id,
    status: "todo",
    at,
  });
  assert.equal(reopen.tasks.find((t) => t.id === task.id).completedAt, null);
  assert.equal(
    progressOf(reopen.tasks.filter((t) => t.projectId === "p1")),
    38,
  );
  assert.equal(state.tasks.find((t) => t.id === task.id).status, "progress");
});

test("task create, edit, delete and invalid project handling", () => {
  const state = seed();
  const task = {
    ...state.tasks[0],
    id: "new-task",
    title: "Test workflow",
    status: "todo",
    completedAt: null,
  };
  const created = reduceWorkspace(state, { type: "TASK", value: task, at });
  assert.equal(created.tasks.length, 33);
  const done = reduceWorkspace(created, {
    type: "TASK",
    value: { ...task, status: "done" },
    at,
  });
  assert.equal(done.tasks.find((t) => t.id === task.id).completedAt, at);
  const edited = reduceWorkspace(done, {
    type: "TASK",
    value: { ...done.tasks.find((t) => t.id === task.id), title: "Updated" },
    at: "2026-10-27T12:00:00Z",
  });
  assert.equal(edited.tasks.find((t) => t.id === task.id).completedAt, at);
  const deleted = reduceWorkspace(edited, {
    type: "DELETE_TASK",
    id: task.id,
    at,
  });
  assert.deepEqual(deleted.tasks, state.tasks);
  assert.throws(
    () =>
      reduceWorkspace(state, {
        type: "TASK",
        value: { ...task, projectId: "missing" },
      }),
    /existing project/,
  );
});

test("unknown moves and unknown actions leave the original state untouched", () => {
  const state = seed();
  for (const action of [
    { type: "MOVE", id: "t4", status: "invalid" },
    { type: "MOVE", id: "missing", status: "done" },
    { type: "MOVE", id: "t4", status: "progress" },
    { type: "UNKNOWN" },
  ])
    assert.equal(reduceWorkspace(state, action), state);
});

test("checklist toggles and comments affect only the intended task", () => {
  const state = seed(),
    task = state.tasks[3];
  const checked = reduceWorkspace(state, {
    type: "CHECK",
    taskId: task.id,
    id: task.subtasks[0].id,
  });
  assert.equal(checked.tasks[3].subtasks[0].done, !task.subtasks[0].done);
  assert.deepEqual(checked.tasks[2], state.tasks[2]);
  const comment = {
    id: "comment-test",
    author: "Tester",
    text: "Reviewed",
    at,
  };
  const commented = reduceWorkspace(checked, {
    type: "COMMENT",
    id: task.id,
    value: comment,
    at,
  });
  assert.deepEqual(commented.tasks[3].comments.at(-1), comment);
  validateWorkspace(commented);
});

test("removing a member unassigns tasks and clears team and conversation references", () => {
  const state = seed();
  assert.equal(
    reduceWorkspace(state, { type: "DELETE_MEMBER", id: state.profileId }),
    state,
  );
  const next = reduceWorkspace(state, { type: "DELETE_MEMBER", id: "m2" });
  assert.equal(
    next.members.some((m) => m.id === "m2"),
    false,
  );
  assert.equal(
    next.tasks.some((t) => t.assigneeId === "m2"),
    false,
  );
  assert.equal(
    next.projects.some((p) => p.memberIds.includes("m2")),
    false,
  );
  assert.equal(
    next.messages.some((m) => m.from === "m2" || m.to === "m2"),
    false,
  );
  assert.ok(next.tasks.some((t) => t.assigneeId === ""));
  validateWorkspace(next);
});

test("local messages can be added, but only the current profile can delete its outgoing messages", () => {
  const state = seed();
  const message = {
    id: "local-message",
    from: "m1",
    to: "m2",
    text: "Local test",
    at,
  };
  const next = reduceWorkspace(state, { type: "MESSAGE", value: message });
  assert.deepEqual(next.messages.at(-1), message);
  assert.deepEqual(
    reduceWorkspace(next, { type: "DELETE_MESSAGE", id: "msg1" }).messages,
    next.messages,
  );
  assert.deepEqual(
    reduceWorkspace(next, { type: "DELETE_MESSAGE", id: message.id }).messages,
    state.messages,
  );
});

test("filters compose and sorting never reorders source data", () => {
  const state = seed(),
    originalIds = state.tasks.map((t) => t.id);
  const result = filterTasks(state.tasks, {
    query: "screens",
    assignee: "m1",
    projectId: "p1",
    status: "progress",
    priority: "high",
  });
  assert.deepEqual(
    result.map((t) => t.id),
    ["t4"],
  );
  assert.deepEqual(filterTasks(state.tasks, { query: "no matches here" }), []);
  const sorted = filterTasks(state.tasks, { sort: "title" });
  assert.ok(
    sorted.every(
      (t, i) => !i || sorted[i - 1].title.localeCompare(t.title) <= 0,
    ),
  );
  assert.deepEqual(
    state.tasks.map((t) => t.id),
    originalIds,
  );
});

test("backup validation rejects corrupt nested records, duplicate IDs and references", () => {
  const corruptions = [
    (s) => {
      s.version = 2;
    },
    (s) => {
      s.tasks[0].projectId = "missing";
    },
    (s) => {
      s.tasks[0].assigneeId = "missing";
    },
    (s) => {
      s.tasks[0].status = "fake";
    },
    (s) => {
      s.tasks[0].dueDate = "2026-02-30";
    },
    (s) => {
      s.tasks[0].subtasks[0].done = "true";
    },
    (s) => {
      s.tasks[0].subtasks.push(s.tasks[0].subtasks[0]);
    },
    (s) => {
      s.tasks[3].comments.push(s.tasks[3].comments[0]);
    },
    (s) => {
      s.projects[0].memberIds.push("missing");
    },
    (s) => {
      s.projects[0].memberIds.push("m1");
    },
    (s) => {
      s.members.push(s.members[0]);
    },
    (s) => {
      s.messages[0].from = "missing";
    },
    (s) => {
      s.settings.theme = "unknown";
    },
    (s) => {
      s.profileId = "missing";
    },
  ];
  for (const mutate of corruptions) {
    const state = seed();
    mutate(state);
    assert.throws(() => validateWorkspace(state), /not a valid Taska/);
  }
  assert.throws(() => validateWorkspace(null));
});

test("CSV quotes text and neutralizes spreadsheet formulas", () => {
  const state = seed();
  const tasks = [
    "=SUM(A1)",
    "+cmd",
    "-cmd",
    "@SUM(A1)",
    "  =1",
    'Title, with "quotes"\nand newline',
  ].map((title, i) => ({ ...state.tasks[i], title }));
  const csv = tasksToCSV(tasks, state.projects, state.members);
  for (const prefix of ["'=SUM(A1)", "'+cmd", "'-cmd", "'@SUM(A1)", "'  =1"])
    assert.ok(csv.includes(prefix));
  assert.ok(csv.includes('"Title, with ""quotes""\nand newline"'));
  assert.ok(
    csv.startsWith(
      '"Task","Project","Status","Priority","Assignee","Due date"',
    ),
  );
});

test("calendar helpers cross months and leap days without changing the base date", () => {
  const date = new Date(2024, 1, 28, 12);
  assert.equal(shiftDate(1, date), "2024-02-29");
  assert.equal(shiftDate(2, date), "2024-03-01");
  assert.equal(dateKey(date), "2024-02-28");
  assert.equal(progressOf([]), 0);
});

test("workspace settings and read notifications preserve unrelated state", () => {
  const state = seed();
  const changed = reduceWorkspace(state, {
    type: "SETTINGS",
    value: { theme: "dark" },
  });
  assert.equal(changed.settings.theme, "dark");
  assert.equal(changed.settings.workspaceName, state.settings.workspaceName);
  assert.equal(changed.tasks, state.tasks);
  const read = reduceWorkspace(changed, { type: "READ" });
  assert.ok(read.activity.every((a) => a.read));
  validateWorkspace(read);
});
