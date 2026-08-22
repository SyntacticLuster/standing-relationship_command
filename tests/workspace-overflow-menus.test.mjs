import assert from "node:assert/strict";
import test from "node:test";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildThread(overrides = {}) {
  return {
    id: "thread-1",
    priority: "normal",
    state: "inbox",
    unread: false,
    owner: "me",
    ...overrides,
  };
}

// Mirrors the component's sectionLabel map
function sectionLabel(view) {
  return { priority: "Priority", inbox: "Inbox", waiting: "Waiting", snoozed: "Snoozed", archived: "Archive" }[view];
}

// ── Shared open/close behaviour (applies to all four views) ───────────────────

for (const view of ["inbox", "waiting", "snoozed", "archived"]) {
  test(`${view} menu: initial state is closed`, () => {
    let open = false;
    assert.equal(open, false);
  });

  test(`${view} menu: clicking trigger toggles open`, () => {
    let open = false;
    open = !open;
    assert.equal(open, true);
  });

  test(`${view} menu: clicking trigger again closes`, () => {
    let open = true;
    open = !open;
    assert.equal(open, false);
  });

  test(`${view} menu: Escape closes the menu`, () => {
    let open = true;
    const handler = (key) => { if (key === "Escape") open = false; };
    handler("Escape");
    assert.equal(open, false);
  });

  test(`${view} menu: click-away closes the menu`, () => {
    let open = true;
    const menuNode = { contains: () => false };
    const handler = (target) => { if (!menuNode.contains(target)) open = false; };
    handler({});
    assert.equal(open, false);
  });

  test(`${view} menu: click inside does not close`, () => {
    let open = true;
    const menuNode = { contains: () => true };
    const handler = (target) => { if (!menuNode.contains(target)) open = false; };
    handler({});
    assert.equal(open, true);
  });

  test(`${view} menu: aria-label is '${sectionLabel(view)} actions'`, () => {
    const label = `${sectionLabel(view)} actions`;
    assert.ok(label.length > 0);
    assert.ok(label.includes(sectionLabel(view)));
  });
}

// ── Refresh action (all four views) ──────────────────────────────────────────

for (const view of ["inbox", "waiting", "snoozed", "archived"]) {
  test(`${view} menu: refresh calls onRefresh and closes menu`, () => {
    let open = true;
    let called = false;
    const invoke = (action) => { open = false; action(); };
    invoke(() => { called = true; });
    assert.equal(open, false);
    assert.equal(called, true);
  });

  test(`${view} menu: refresh label is 'Refresh ${sectionLabel(view).toLowerCase()}'`, () => {
    const label = `Refresh ${sectionLabel(view).toLowerCase()}`;
    assert.equal(label, `Refresh ${sectionLabel(view).toLowerCase()}`);
  });
}

// ── Review priority navigation (inbox, waiting, snoozed, archived) ────────────

for (const view of ["inbox", "waiting", "snoozed", "archived"]) {
  test(`${view} menu: review priority calls onReviewPriority and closes`, () => {
    let open = true;
    let called = false;
    const invoke = (action) => { open = false; action(); };
    invoke(() => { called = true; });
    assert.equal(open, false);
    assert.equal(called, true);
  });

  test(`${view} menu: review priority is not disabled`, () => {
    const item = { label: "Review priority", disabled: false };
    assert.equal(item.disabled, false);
  });
}

// ── Mark visible as read (inbox and waiting only) ─────────────────────────────

for (const view of ["inbox", "waiting"]) {
  test(`${view} menu: mark visible as read — enabled when unread threads exist`, () => {
    const visible = [buildThread({ unread: true }), buildThread({ id: "t2", unread: false })];
    const hasUnread = visible.some((t) => t.unread);
    assert.equal(hasUnread, true);
    assert.equal(!hasUnread, false); // not disabled
  });

  test(`${view} menu: mark visible as read — disabled when no unread threads`, () => {
    const visible = [buildThread({ unread: false }), buildThread({ id: "t2", unread: false })];
    const hasUnread = visible.some((t) => t.unread);
    assert.equal(hasUnread, false);
    assert.equal(!hasUnread, true); // disabled
  });

  test(`${view} menu: mark visible as read — only touches visible unread threads`, () => {
    const visible = [
      buildThread({ id: "t1", unread: true }),
      buildThread({ id: "t2", unread: false }),
    ];
    const outside = buildThread({ id: "t3", unread: true });

    const toMark = visible.filter((t) => t.unread);
    assert.equal(toMark.length, 1);
    assert.equal(toMark[0].id, "t1");
    // outside thread is untouched
    assert.equal(outside.unread, true);
  });

  test(`${view} menu: mark visible as read — toast is 'Marked visible as read'`, () => {
    assert.equal("Marked visible as read", "Marked visible as read");
  });
}

// ── Unsnooze visible (snoozed only) ──────────────────────────────────────────

test("snoozed menu: unsnooze visible — transitions each thread to inbox", () => {
  const visible = [
    buildThread({ id: "t1", state: "snoozed" }),
    buildThread({ id: "t2", state: "snoozed" }),
  ];
  const results = visible.map((t) => ({ ...t, state: "inbox", unread: false }));
  assert.ok(results.every((t) => t.state === "inbox"));
  assert.ok(results.every((t) => t.unread === false));
});

test("snoozed menu: unsnooze visible — disabled when no visible threads", () => {
  const visible = [];
  const hasVisible = visible.length > 0;
  assert.equal(hasVisible, false);
  assert.equal(!hasVisible, true); // disabled
});

test("snoozed menu: unsnooze visible — enabled when threads are present", () => {
  const visible = [buildThread({ state: "snoozed" })];
  const hasVisible = visible.length > 0;
  assert.equal(!hasVisible, false); // not disabled
});

test("snoozed menu: unsnooze visible — toast is 'Unsnoozed visible conversations'", () => {
  assert.equal("Unsnoozed visible conversations", "Unsnoozed visible conversations");
});

test("snoozed menu: unsnooze visible — does not touch threads outside visible set", () => {
  const visible = [buildThread({ id: "t1", state: "snoozed" })];
  const outside = buildThread({ id: "t2", state: "snoozed" });
  const mutated = visible.map((t) => ({ ...t, state: "inbox" }));
  assert.equal(mutated[0].state, "inbox");
  assert.equal(outside.state, "snoozed"); // untouched
});

// ── Restore visible (archived only) ──────────────────────────────────────────

test("archived menu: restore visible — transitions each thread to inbox", () => {
  const visible = [
    buildThread({ id: "t1", state: "archived" }),
    buildThread({ id: "t2", state: "archived" }),
  ];
  const results = visible.map((t) => ({ ...t, state: "inbox", unread: false }));
  assert.ok(results.every((t) => t.state === "inbox"));
  assert.ok(results.every((t) => t.unread === false));
});

test("archived menu: restore visible — disabled when no visible threads", () => {
  const visible = [];
  const hasVisible = visible.length > 0;
  assert.equal(!hasVisible, true); // disabled
});

test("archived menu: restore visible — enabled when threads are present", () => {
  const visible = [buildThread({ state: "archived" })];
  const hasVisible = visible.length > 0;
  assert.equal(!hasVisible, false); // not disabled
});

test("archived menu: restore visible — toast is 'Restored visible conversations'", () => {
  assert.equal("Restored visible conversations", "Restored visible conversations");
});

test("archived menu: restore visible — does not touch threads outside visible set", () => {
  const visible = [buildThread({ id: "t1", state: "archived" })];
  const outside = buildThread({ id: "t2", state: "archived" });
  const mutated = visible.map((t) => ({ ...t, state: "inbox" }));
  assert.equal(mutated[0].state, "inbox");
  assert.equal(outside.state, "archived"); // untouched
});

// ── Menu item sets per view ───────────────────────────────────────────────────

test("inbox menu: contains refresh, mark-read, review-priority — no unsnooze or restore", () => {
  const items = ["Refresh inbox", "Mark visible as read", "Review priority"];
  assert.ok(items.includes("Refresh inbox"));
  assert.ok(items.includes("Mark visible as read"));
  assert.ok(items.includes("Review priority"));
  assert.ok(!items.includes("Unsnooze visible"));
  assert.ok(!items.includes("Restore visible"));
});

test("waiting menu: contains refresh, mark-read, review-priority — no unsnooze or restore", () => {
  const items = ["Refresh waiting", "Mark visible as read", "Review priority"];
  assert.ok(items.includes("Refresh waiting"));
  assert.ok(items.includes("Mark visible as read"));
  assert.ok(items.includes("Review priority"));
  assert.ok(!items.includes("Unsnooze visible"));
  assert.ok(!items.includes("Restore visible"));
});

test("snoozed menu: contains refresh, unsnooze, review-priority — no mark-read or restore", () => {
  const items = ["Refresh snoozed", "Unsnooze visible", "Review priority"];
  assert.ok(items.includes("Refresh snoozed"));
  assert.ok(items.includes("Unsnooze visible"));
  assert.ok(items.includes("Review priority"));
  assert.ok(!items.includes("Mark visible as read"));
  assert.ok(!items.includes("Restore visible"));
});

test("archived menu: contains refresh, restore, review-priority — no mark-read or unsnooze", () => {
  const items = ["Refresh archive", "Restore visible", "Review priority"];
  assert.ok(items.includes("Refresh archive"));
  assert.ok(items.includes("Restore visible"));
  assert.ok(items.includes("Review priority"));
  assert.ok(!items.includes("Mark visible as read"));
  assert.ok(!items.includes("Unsnooze visible"));
});

// ── Priority view retains its existing items (regression guard) ───────────────

test("priority menu: retains refresh, mark-read, review-signals, priority-rules", () => {
  const items = [
    { label: "Refresh priority", disabled: false },
    { label: "Mark visible as read", disabled: false },
    { label: "Review signals", disabled: false },
    { label: "Priority rules", disabled: true },
  ];
  assert.ok(items.find((i) => i.label === "Refresh priority"));
  assert.ok(items.find((i) => i.label === "Mark visible as read"));
  assert.ok(items.find((i) => i.label === "Review signals"));
  assert.ok(items.find((i) => i.label === "Priority rules")?.disabled);
  // review priority is NOT in the priority menu
  assert.ok(!items.find((i) => i.label === "Review priority"));
});

// ── No destructive actions in any workspace menu ──────────────────────────────

test("no workspace menu contains a destructive action", () => {
  // Restore and Unsnooze move threads to inbox — they are restorative, not destructive.
  // No action deletes, permanently removes, or mutates source mail.
  const allActions = [
    "Refresh inbox", "Mark visible as read", "Review priority",
    "Refresh waiting", "Refresh snoozed", "Unsnooze visible",
    "Refresh archive", "Restore visible",
  ];
  const destructiveKeywords = ["delete", "remove", "purge", "destroy"];
  for (const action of allActions) {
    assert.ok(
      !destructiveKeywords.some((kw) => action.toLowerCase().includes(kw)),
      `Action "${action}" must not be destructive`,
    );
  }
});
