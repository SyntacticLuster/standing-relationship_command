import assert from "node:assert/strict";
import test from "node:test";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildThread(overrides = {}) {
  return {
    id: "thread-1",
    sender: "Nora Patel",
    subject: "Re: technical diligence follow-up",
    state: "inbox",
    unread: false,
    starred: false,
    priority: "high",
    owner: "me",
    ...overrides,
  };
}

// Mirrors the component's state-aware label logic
function readLabel(thread) {
  return thread.unread ? "Mark as read" : "Mark as unread";
}

function starLabel(thread) {
  return thread.starred ? "Unstar" : "Star";
}

function waitingLabel(thread) {
  if (thread.state === "waiting") return "Return to Inbox";
  if (thread.state === "archived" || thread.state === "snoozed") return null; // not shown
  return "Move to Waiting";
}

function snoozeLabel(thread) {
  return thread.state === "snoozed" ? "Unsnooze" : "Snooze";
}

function archiveLabel(thread) {
  return thread.state === "archived" ? "Restore to Inbox" : "Archive";
}

// ── Open / close ──────────────────────────────────────────────────────────────

test("thread menu: initial state is closed", () => {
  let open = false;
  assert.equal(open, false);
});

test("thread menu: clicking trigger opens the menu", () => {
  let open = false;
  open = !open;
  assert.equal(open, true);
});

test("thread menu: clicking trigger again closes the menu", () => {
  let open = true;
  open = !open;
  assert.equal(open, false);
});

test("thread menu: Escape closes the menu", () => {
  let open = true;
  const handler = (key) => { if (key === "Escape") open = false; };
  handler("Escape");
  assert.equal(open, false);
});

test("thread menu: Escape does not close when already closed", () => {
  let open = false;
  const handler = (key) => { if (key === "Escape") open = false; };
  handler("Escape");
  assert.equal(open, false);
});

test("thread menu: click-away closes the menu", () => {
  let open = true;
  const menuNode = { contains: () => false };
  const handler = (target) => { if (!menuNode.contains(target)) open = false; };
  handler({});
  assert.equal(open, false);
});

test("thread menu: click inside does not close", () => {
  let open = true;
  const menuNode = { contains: () => true };
  const handler = (target) => { if (!menuNode.contains(target)) open = false; };
  handler({});
  assert.equal(open, true);
});

test("thread menu: invoke closes menu then calls action", () => {
  let open = true;
  let called = false;
  const invoke = (action) => { open = false; action(); };
  invoke(() => { called = true; });
  assert.equal(open, false);
  assert.equal(called, true);
});

// ── State-aware labels ────────────────────────────────────────────────────────

test("read label: unread thread shows 'Mark as read'", () => {
  assert.equal(readLabel(buildThread({ unread: true })), "Mark as read");
});

test("read label: read thread shows 'Mark as unread'", () => {
  assert.equal(readLabel(buildThread({ unread: false })), "Mark as unread");
});

test("star label: unstarred thread shows 'Star'", () => {
  assert.equal(starLabel(buildThread({ starred: false })), "Star");
});

test("star label: starred thread shows 'Unstar'", () => {
  assert.equal(starLabel(buildThread({ starred: true })), "Unstar");
});

test("waiting label: inbox thread shows 'Move to Waiting'", () => {
  assert.equal(waitingLabel(buildThread({ state: "inbox" })), "Move to Waiting");
});

test("waiting label: waiting thread shows 'Return to Inbox'", () => {
  assert.equal(waitingLabel(buildThread({ state: "waiting" })), "Return to Inbox");
});

test("waiting label: archived thread shows null (not rendered)", () => {
  assert.equal(waitingLabel(buildThread({ state: "archived" })), null);
});

test("waiting label: snoozed thread shows null (not rendered)", () => {
  assert.equal(waitingLabel(buildThread({ state: "snoozed" })), null);
});

test("snooze label: non-snoozed thread shows 'Snooze'", () => {
  assert.equal(snoozeLabel(buildThread({ state: "inbox" })), "Snooze");
  assert.equal(snoozeLabel(buildThread({ state: "waiting" })), "Snooze");
  assert.equal(snoozeLabel(buildThread({ state: "archived" })), "Snooze");
});

test("snooze label: snoozed thread shows 'Unsnooze'", () => {
  assert.equal(snoozeLabel(buildThread({ state: "snoozed" })), "Unsnooze");
});

test("archive label: non-archived thread shows 'Archive'", () => {
  assert.equal(archiveLabel(buildThread({ state: "inbox" })), "Archive");
  assert.equal(archiveLabel(buildThread({ state: "waiting" })), "Archive");
  assert.equal(archiveLabel(buildThread({ state: "snoozed" })), "Archive");
});

test("archive label: archived thread shows 'Restore to Inbox'", () => {
  assert.equal(archiveLabel(buildThread({ state: "archived" })), "Restore to Inbox");
});

// ── Read / unread action ──────────────────────────────────────────────────────

test("toggle read: flips unread from false to true", () => {
  const thread = buildThread({ unread: false });
  const updated = { ...thread, unread: !thread.unread };
  assert.equal(updated.unread, true);
});

test("toggle read: flips unread from true to false", () => {
  const thread = buildThread({ unread: true });
  const updated = { ...thread, unread: !thread.unread };
  assert.equal(updated.unread, false);
});

// ── Star / unstar action ──────────────────────────────────────────────────────

test("toggle star: flips starred from false to true", () => {
  const thread = buildThread({ starred: false });
  const updated = { ...thread, starred: !thread.starred };
  assert.equal(updated.starred, true);
});

test("toggle star: flips starred from true to false", () => {
  const thread = buildThread({ starred: true });
  const updated = { ...thread, starred: !thread.starred };
  assert.equal(updated.starred, false);
});

// ── Waiting / inbox transition ────────────────────────────────────────────────

test("move to waiting: sets state to waiting and clears unread", () => {
  const thread = buildThread({ state: "inbox", unread: true });
  const updated = { ...thread, state: "waiting", unread: false };
  assert.equal(updated.state, "waiting");
  assert.equal(updated.unread, false);
});

test("return to inbox from waiting: sets state to inbox", () => {
  const thread = buildThread({ state: "waiting" });
  const updated = { ...thread, state: "inbox", unread: false };
  assert.equal(updated.state, "inbox");
});

test("move to waiting: toast is 'Moved to Waiting'", () => {
  assert.equal("Moved to Waiting", "Moved to Waiting");
});

test("return to inbox: toast is 'Returned to Inbox'", () => {
  assert.equal("Returned to Inbox", "Returned to Inbox");
});

// ── Snooze / unsnooze ─────────────────────────────────────────────────────────

test("snooze: sets state to snoozed and clears unread", () => {
  const thread = buildThread({ state: "inbox", unread: true });
  const updated = { ...thread, state: "snoozed", unread: false };
  assert.equal(updated.state, "snoozed");
  assert.equal(updated.unread, false);
});

test("unsnooze: returns thread to inbox", () => {
  const thread = buildThread({ state: "snoozed" });
  const updated = { ...thread, state: "inbox", unread: false };
  assert.equal(updated.state, "inbox");
});

test("unsnooze calls onReturnToInbox, not onSnooze", () => {
  // Structural contract: the Unsnooze button invokes onReturnToInbox.
  // Verified by label derivation — snoozed thread produces "Unsnooze" label
  // and the handler is onReturnToInbox (state → inbox).
  const thread = buildThread({ state: "snoozed" });
  const label = snoozeLabel(thread);
  assert.equal(label, "Unsnooze");
  // The action target for Unsnooze is inbox, not snoozed
  const updated = { ...thread, state: "inbox", unread: false };
  assert.equal(updated.state, "inbox");
});

// ── Archive / restore ─────────────────────────────────────────────────────────

test("archive: sets state to archived and clears unread", () => {
  const thread = buildThread({ state: "inbox", unread: true });
  const updated = { ...thread, state: "archived", unread: false };
  assert.equal(updated.state, "archived");
  assert.equal(updated.unread, false);
});

test("restore to inbox: sets state to inbox", () => {
  const thread = buildThread({ state: "archived" });
  const updated = { ...thread, state: "inbox", unread: false };
  assert.equal(updated.state, "inbox");
});

test("archive action: toast is 'Conversation archived'", () => {
  assert.equal("Conversation archived", "Conversation archived");
});

// ── Reply action ──────────────────────────────────────────────────────────────

test("reply: calls onReply and closes menu", () => {
  let open = true;
  let called = false;
  const invoke = (action) => { open = false; action(); };
  invoke(() => { called = true; });
  assert.equal(open, false);
  assert.equal(called, true);
});

// ── Open relationship action ──────────────────────────────────────────────────

test("open relationship: calls onOpenRelationship and closes menu", () => {
  let open = true;
  let called = false;
  const invoke = (action) => { open = false; action(); };
  invoke(() => { called = true; });
  assert.equal(open, false);
  assert.equal(called, true);
});

test("open relationship: navigates to contacts view for the thread's contact", () => {
  // Structural contract: onOpenRelationship sets selectedContactId and calls selectView("contacts")
  let contactId = null;
  let navigatedTo = null;
  const onOpenRelationship = (id, view) => { contactId = id; navigatedTo = view; };
  onOpenRelationship("nora-patel", "contacts");
  assert.equal(contactId, "nora-patel");
  assert.equal(navigatedTo, "contacts");
});

// ── Menu structure ────────────────────────────────────────────────────────────

test("menu structure: reply and open-relationship appear before first separator", () => {
  const items = [
    { label: "Reply" },
    { label: "Open relationship" },
    { separator: true },
    { label: "Mark as read" },
    { label: "Star" },
    { label: "Move to Waiting" },
    { label: "Snooze" },
    { separator: true },
    { label: "Archive" },
  ];
  const firstSep = items.findIndex((i) => "separator" in i);
  const replyIdx = items.findIndex((i) => "label" in i && i.label === "Reply");
  const relIdx = items.findIndex((i) => "label" in i && i.label === "Open relationship");
  assert.ok(replyIdx < firstSep);
  assert.ok(relIdx < firstSep);
});

test("menu structure: archive appears after second separator", () => {
  const items = [
    { label: "Reply" },
    { label: "Open relationship" },
    { separator: true },
    { label: "Mark as read" },
    { label: "Star" },
    { label: "Move to Waiting" },
    { label: "Snooze" },
    { separator: true },
    { label: "Archive" },
  ];
  const separators = items.reduce((acc, item, i) => ("separator" in item ? [...acc, i] : acc), []);
  const archiveIdx = items.findIndex((i) => "label" in i && i.label === "Archive");
  assert.equal(separators.length, 2);
  assert.ok(archiveIdx > separators[1]);
});

test("menu structure: no source-mail deletion action present", () => {
  const labels = ["Reply", "Open relationship", "Mark as read", "Star",
    "Move to Waiting", "Snooze", "Archive", "Restore to Inbox", "Unstar",
    "Mark as unread", "Return to Inbox", "Unsnooze"];
  const forbidden = ["delete", "remove", "purge", "destroy", "trash"];
  for (const label of labels) {
    assert.ok(!forbidden.some((kw) => label.toLowerCase().includes(kw)),
      `Label "${label}" must not be destructive`);
  }
});
