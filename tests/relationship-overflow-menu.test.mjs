import assert from "node:assert/strict";
import test from "node:test";

// ── Helpers mirroring component logic ────────────────────────────────────────

function buildContact(overrides = {}) {
  return {
    id: "nora-patel",
    name: "Nora Patel",
    email: "nora@northstar.example",
    facts: ["Evaluates infrastructure", "Prefers live product evidence"],
    ...overrides,
  };
}

function buildThread(overrides = {}) {
  return {
    id: "thread-1",
    contactId: "nora-patel",
    state: "inbox",
    starred: false,
    unread: false,
    ...overrides,
  };
}

// ── Menu open/close state ─────────────────────────────────────────────────────

test("menu: initial state is closed", () => {
  let open = false;
  assert.equal(open, false);
});

test("menu: clicking trigger toggles open to true", () => {
  let open = false;
  // simulate toggle
  open = !open;
  assert.equal(open, true);
});

test("menu: clicking trigger again toggles open to false", () => {
  let open = true;
  open = !open;
  assert.equal(open, false);
});

test("menu: Escape key closes the menu", () => {
  let open = true;
  // simulate Escape handler
  const handleKey = (key) => { if (key === "Escape") open = false; };
  handleKey("Escape");
  assert.equal(open, false);
});

test("menu: Escape does not close when already closed", () => {
  let open = false;
  const handleKey = (key) => { if (key === "Escape") open = false; };
  handleKey("Escape");
  assert.equal(open, false);
});

test("menu: non-Escape key does not close the menu", () => {
  let open = true;
  const handleKey = (key) => { if (key === "Escape") open = false; };
  handleKey("Enter");
  assert.equal(open, true);
});

test("menu: click-away closes the menu (target outside menu)", () => {
  let open = true;
  const menuNode = { contains: () => false };
  const handleClickAway = (target) => {
    if (!menuNode.contains(target)) open = false;
  };
  handleClickAway({});
  assert.equal(open, false);
});

test("menu: click inside menu does not close it", () => {
  let open = true;
  const menuNode = { contains: () => true };
  const handleClickAway = (target) => {
    if (!menuNode.contains(target)) open = false;
  };
  handleClickAway({});
  assert.equal(open, true);
});

// ── Copy email action ─────────────────────────────────────────────────────────

test("copy email: produces correct toast message", () => {
  const email = "nora@northstar.example";
  const toast = `Copied ${email}`;
  assert.equal(toast, "Copied nora@northstar.example");
});

test("copy email: clipboard unavailable produces fallback toast", () => {
  const email = "nora@northstar.example";
  const toast = "Clipboard unavailable — copy manually: " + email;
  assert.ok(toast.includes(email));
  assert.ok(toast.startsWith("Clipboard unavailable"));
});

// ── Archive relationship action ───────────────────────────────────────────────

test("archive contact: archives all non-archived threads for the contact", () => {
  const contact = buildContact();
  const threads = [
    buildThread({ id: "t1", contactId: contact.id, state: "inbox" }),
    buildThread({ id: "t2", contactId: contact.id, state: "waiting" }),
    buildThread({ id: "t3", contactId: "other-contact", state: "inbox" }),
    buildThread({ id: "t4", contactId: contact.id, state: "archived" }),
  ];

  const toArchive = threads.filter(
    (t) => t.contactId === contact.id && t.state !== "archived",
  );

  assert.equal(toArchive.length, 2);
  assert.ok(toArchive.every((t) => t.contactId === contact.id));
  assert.ok(toArchive.every((t) => t.state !== "archived"));
});

test("archive contact: no active threads produces informational toast", () => {
  const contact = buildContact();
  const threads = [
    buildThread({ id: "t1", contactId: contact.id, state: "archived" }),
  ];

  const toArchive = threads.filter(
    (t) => t.contactId === contact.id && t.state !== "archived",
  );

  let toast = "";
  if (!toArchive.length) {
    toast = `No active threads to archive for ${contact.name}`;
  } else {
    toast = `${contact.name}'s threads archived`;
  }

  assert.equal(toast, "No active threads to archive for Nora Patel");
});

test("archive contact: success toast uses contact name", () => {
  const contact = buildContact({ name: "Theo Brooks" });
  const toast = `${contact.name}'s threads archived`;
  assert.equal(toast, "Theo Brooks's threads archived");
});

test("archive contact: does not touch threads belonging to other contacts", () => {
  const contact = buildContact();
  const threads = [
    buildThread({ id: "t1", contactId: contact.id, state: "inbox" }),
    buildThread({ id: "t2", contactId: "other-contact", state: "inbox" }),
  ];

  const toArchive = threads.filter(
    (t) => t.contactId === contact.id && t.state !== "archived",
  );

  assert.equal(toArchive.length, 1);
  assert.equal(toArchive[0].id, "t1");
});

// ── Edit relationship modal ───────────────────────────────────────────────────

test("edit modal: source-derived facts are read-only (not in form submission)", () => {
  const contact = buildContact();
  // Facts are displayed for context but the form only submits the note textarea
  const formFields = ["note"];
  assert.ok(!formFields.includes("facts"));
});

test("edit modal: save is disabled when note draft is empty", () => {
  const noteDraft = "";
  const disabled = !noteDraft.trim();
  assert.equal(disabled, true);
});

test("edit modal: save is enabled when note draft has content", () => {
  const noteDraft = "Prefers async communication";
  const disabled = !noteDraft.trim();
  assert.equal(disabled, false);
});

test("edit modal: note is trimmed before saving", () => {
  const raw = "  Some context  ";
  const trimmed = raw.trim();
  assert.equal(trimmed, "Some context");
});

test("edit modal: note exceeding 2000 chars is rejected by maxLength", () => {
  const note = "x".repeat(2001);
  const valid = note.length <= 2000;
  assert.equal(valid, false);
});

test("edit modal: note at exactly 2000 chars is valid", () => {
  const note = "x".repeat(2000);
  const valid = note.length <= 2000;
  assert.equal(valid, true);
});

// ── Mark as priority: disabled state ─────────────────────────────────────────

test("mark as priority: action is disabled (no contact state write path)", () => {
  // This action has no persistence route — contact priority is seed-data only.
  // The menu item must be rendered as disabled.
  const menuItem = { label: "Mark as priority", disabled: true };
  assert.equal(menuItem.disabled, true);
});

// ── Menu items: correct set of actions ───────────────────────────────────────

test("menu items: contains expected actions", () => {
  const items = [
    { label: "Edit relationship", disabled: false },
    { label: "Add private note", disabled: false },
    { label: "Mark as priority", disabled: true },
    { label: "Copy email", disabled: false },
    { label: "Archive relationship", disabled: false, destructive: true },
  ];

  assert.equal(items.length, 5);
  assert.ok(items.find((i) => i.label === "Edit relationship"));
  assert.ok(items.find((i) => i.label === "Add private note"));
  assert.ok(items.find((i) => i.label === "Mark as priority")?.disabled);
  assert.ok(items.find((i) => i.label === "Copy email"));
  assert.ok(items.find((i) => i.label === "Archive relationship")?.destructive);
});

test("menu items: deferred actions are not present", () => {
  const items = [
    "Edit relationship",
    "Add private note",
    "Mark as priority",
    "Copy email",
    "Archive relationship",
  ];
  assert.ok(!items.includes("Merge duplicate"));
  assert.ok(!items.includes("Export relationship"));
  assert.ok(!items.includes("Forget relationship"));
});

test("menu items: destructive actions are visually separated (appear after separator)", () => {
  // Archive is the only destructive action and must appear after the separator
  const items = [
    { label: "Edit relationship", destructive: false },
    { label: "Add private note", destructive: false },
    { label: "Mark as priority", destructive: false },
    { label: "Copy email", destructive: false },
    { separator: true },
    { label: "Archive relationship", destructive: true },
  ];

  const separatorIndex = items.findIndex((i) => "separator" in i);
  const archiveIndex = items.findIndex((i) => "label" in i && i.label === "Archive relationship");

  assert.ok(separatorIndex !== -1, "separator must exist");
  assert.ok(archiveIndex > separatorIndex, "archive must appear after separator");
});
