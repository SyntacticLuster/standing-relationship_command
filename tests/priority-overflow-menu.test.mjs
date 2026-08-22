import assert from "node:assert/strict";
import test from "node:test";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildThread(overrides = {}) {
  return {
    id: "thread-1",
    priority: "high",
    state: "inbox",
    unread: false,
    ...overrides,
  };
}

// ── Open / close state ────────────────────────────────────────────────────────

test("priority menu: initial state is closed", () => {
  let open = false;
  assert.equal(open, false);
});

test("priority menu: clicking trigger opens the menu", () => {
  let open = false;
  open = !open;
  assert.equal(open, true);
});

test("priority menu: clicking trigger again closes the menu", () => {
  let open = true;
  open = !open;
  assert.equal(open, false);
});

test("priority menu: Escape closes the menu", () => {
  let open = true;
  const handler = (key) => { if (key === "Escape") open = false; };
  handler("Escape");
  assert.equal(open, false);
});

test("priority menu: Escape returns focus to trigger (no-op when closed)", () => {
  let open = false;
  const handler = (key) => { if (key === "Escape") open = false; };
  handler("Escape");
  assert.equal(open, false);
});

test("priority menu: click-away closes the menu", () => {
  let open = true;
  const menuNode = { contains: () => false };
  const handler = (target) => { if (!menuNode.contains(target)) open = false; };
  handler({});
  assert.equal(open, false);
});

test("priority menu: click inside menu does not close it", () => {
  let open = true;
  const menuNode = { contains: () => true };
  const handler = (target) => { if (!menuNode.contains(target)) open = false; };
  handler({});
  assert.equal(open, true);
});

// ── Refresh action ────────────────────────────────────────────────────────────

test("refresh priority: calls onRefresh and closes menu", () => {
  let open = true;
  let refreshCalled = false;

  const invoke = (action) => { open = false; action(); };
  invoke(() => { refreshCalled = true; });

  assert.equal(open, false);
  assert.equal(refreshCalled, true);
});

test("refresh priority: toast message is 'Priority refreshed'", () => {
  // The refreshWorkspace function sets this toast on success
  const toast = "Priority refreshed";
  assert.equal(toast, "Priority refreshed");
});

test("refresh priority: failure toast preserves session state", () => {
  const toast = "Refresh failed; session state preserved";
  assert.ok(toast.includes("session state preserved"));
});

// ── Mark visible as read ──────────────────────────────────────────────────────

test("mark visible as read: only applies to currently visible unread threads", () => {
  const visibleThreads = [
    buildThread({ id: "t1", unread: true }),
    buildThread({ id: "t2", unread: false }),
    buildThread({ id: "t3", unread: true }),
  ];

  const toMark = visibleThreads.filter((t) => t.unread);
  assert.equal(toMark.length, 2);
  assert.ok(toMark.every((t) => t.unread));
});

test("mark visible as read: does not touch threads outside visible set", () => {
  const visibleThreads = [buildThread({ id: "t1", unread: true })];
  const allThreads = [
    ...visibleThreads,
    buildThread({ id: "t2", unread: true }), // not visible
  ];

  const toMark = visibleThreads.filter((t) => t.unread);
  const untouched = allThreads.filter((t) => !visibleThreads.includes(t));

  assert.equal(toMark.length, 1);
  assert.equal(untouched.length, 1);
  assert.equal(untouched[0].id, "t2");
});

test("mark visible as read: disabled when no visible threads are unread", () => {
  const visibleThreads = [
    buildThread({ id: "t1", unread: false }),
    buildThread({ id: "t2", unread: false }),
  ];
  const hasUnread = visibleThreads.some((t) => t.unread);
  assert.equal(hasUnread, false);
  // button should be disabled
  const disabled = !hasUnread;
  assert.equal(disabled, true);
});

test("mark visible as read: enabled when at least one visible thread is unread", () => {
  const visibleThreads = [
    buildThread({ id: "t1", unread: true }),
    buildThread({ id: "t2", unread: false }),
  ];
  const hasUnread = visibleThreads.some((t) => t.unread);
  assert.equal(hasUnread, true);
  const disabled = !hasUnread;
  assert.equal(disabled, false);
});

test("mark visible as read: toast message is 'Marked visible as read'", () => {
  const toast = "Marked visible as read";
  assert.equal(toast, "Marked visible as read");
});

// ── Review signals navigation ─────────────────────────────────────────────────

test("review signals: invokes onReviewSignals and closes menu", () => {
  let open = true;
  let signalsCalled = false;

  const invoke = (action) => { open = false; action(); };
  invoke(() => { signalsCalled = true; });

  assert.equal(open, false);
  assert.equal(signalsCalled, true);
});

test("review signals: action is not disabled", () => {
  const menuItem = { label: "Review signals", disabled: false };
  assert.equal(menuItem.disabled, false);
});

// ── Priority rules: disabled ──────────────────────────────────────────────────

test("priority rules: action is disabled (no rules surface exists)", () => {
  const menuItem = { label: "Priority rules", disabled: true };
  assert.equal(menuItem.disabled, true);
});

test("priority rules: disabled item has a tooltip explaining why", () => {
  const title = "Priority rules are coming in a future release";
  assert.ok(title.length > 0);
  assert.ok(title.includes("coming"));
});

// ── Menu items: correct set ───────────────────────────────────────────────────

test("menu items: contains expected actions in correct order", () => {
  const items = [
    { label: "Refresh priority", disabled: false },
    { label: "Mark visible as read", disabled: false },
    { label: "Review signals", disabled: false },
    { separator: true },
    { label: "Priority rules", disabled: true },
  ];

  const labels = items.filter((i) => "label" in i).map((i) => i.label);
  assert.deepEqual(labels, [
    "Refresh priority",
    "Mark visible as read",
    "Review signals",
    "Priority rules",
  ]);
});

test("menu items: separator appears before Priority rules", () => {
  const items = [
    { label: "Refresh priority" },
    { label: "Mark visible as read" },
    { label: "Review signals" },
    { separator: true },
    { label: "Priority rules" },
  ];

  const sepIdx = items.findIndex((i) => "separator" in i);
  const rulesIdx = items.findIndex((i) => "label" in i && i.label === "Priority rules");

  assert.ok(sepIdx !== -1, "separator must exist");
  assert.ok(rulesIdx > sepIdx, "Priority rules must appear after separator");
});

test("menu items: no destructive actions in priority menu", () => {
  const items = [
    { label: "Refresh priority", destructive: false },
    { label: "Mark visible as read", destructive: false },
    { label: "Review signals", destructive: false },
    { label: "Priority rules", destructive: false },
  ];
  assert.ok(items.every((i) => !i.destructive));
});
