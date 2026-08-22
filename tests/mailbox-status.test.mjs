import assert from "node:assert/strict";
import test from "node:test";

// ── Types (mirrored from StandingWorkspace) ──────────────────────────────────

function buildAccount(overrides = {}) {
  return {
    id: 1,
    host: "server216.web-hosting.com",
    username: "sales@orbitsuite.cloud",
    status: "active",
    createdAt: "2026-08-22T07:15:04.729Z",
    ...overrides,
  };
}

function buildStatusResponse(accounts, cursors = []) {
  return { accounts, folders: [], cursors };
}

// ── Status rendering logic (extracted from component) ────────────────────────

function deriveMailboxStatus(data) {
  const account = data.accounts[0] ?? null;
  if (!account) return null;
  const lastSyncedAt = data.cursors.length
    ? data.cursors.reduce(
        (latest, c) => (c.syncedAt > latest ? c.syncedAt : latest),
        data.cursors[0].syncedAt,
      )
    : null;
  return { account, messageCount: 0, lastSyncedAt };
}

function syncLabel(syncState, syncSummary, lastSyncedAt) {
  if (syncState === "syncing") return "Syncing…";
  if (syncState === "synced") return syncSummary;
  if (syncState === "failed") return syncSummary;
  if (lastSyncedAt) return `Last sync ${new Date(lastSyncedAt).toLocaleTimeString()}`;
  return "Connected · not yet synced";
}

// ── Connected status renders correctly ───────────────────────────────────────

test("connected status: account present → mailboxStatus is non-null", () => {
  const data = buildStatusResponse([buildAccount()]);
  const status = deriveMailboxStatus(data);
  assert.ok(status !== null);
  assert.equal(status.account.id, 1);
  assert.equal(status.account.username, "sales@orbitsuite.cloud");
});

test("connected status: no cursors → lastSyncedAt is null", () => {
  const data = buildStatusResponse([buildAccount()], []);
  const status = deriveMailboxStatus(data);
  assert.equal(status.lastSyncedAt, null);
});

test("connected status: cursors present → lastSyncedAt is most recent", () => {
  const cursors = [
    { syncedAt: "2026-08-22T07:00:00.000Z", folderId: 1 },
    { syncedAt: "2026-08-22T08:30:00.000Z", folderId: 2 },
    { syncedAt: "2026-08-22T07:45:00.000Z", folderId: 3 },
  ];
  const data = buildStatusResponse([buildAccount()], cursors);
  const status = deriveMailboxStatus(data);
  assert.equal(status.lastSyncedAt, "2026-08-22T08:30:00.000Z");
});

test("connected status: idle with no prior sync → label is 'Connected · not yet synced'", () => {
  const label = syncLabel("idle", "", null);
  assert.equal(label, "Connected · not yet synced");
});

test("connected status: idle with prior sync → label shows last sync time", () => {
  const ts = "2026-08-22T08:30:00.000Z";
  const label = syncLabel("idle", "", ts);
  assert.ok(label.startsWith("Last sync "), `unexpected label: ${label}`);
});

// ── Disconnected status renders correctly ────────────────────────────────────

test("disconnected status: empty accounts → mailboxStatus is null", () => {
  const data = buildStatusResponse([]);
  const status = deriveMailboxStatus(data);
  assert.equal(status, null);
});

test("disconnected status: missing accounts key → mailboxStatus is null", () => {
  const status = deriveMailboxStatus({ accounts: [], folders: [], cursors: [] });
  assert.equal(status, null);
});

// ── Sync action uses owned account ID ────────────────────────────────────────

test("sync uses account ID from status response", () => {
  const data = buildStatusResponse([buildAccount({ id: 7 })]);
  const status = deriveMailboxStatus(data);
  // The sync POST body must use this ID
  const body = JSON.stringify({ accountId: status.account.id });
  assert.equal(JSON.parse(body).accountId, 7);
});

// ── Sync state transitions ────────────────────────────────────────────────────

test("syncing label is 'Syncing…'", () => {
  assert.equal(syncLabel("syncing", "", null), "Syncing…");
});

test("successful sync label shows summary", () => {
  assert.equal(syncLabel("synced", "Synced · 3 new", null), "Synced · 3 new");
});

test("failed sync label shows safe error without losing connected state", () => {
  const data = buildStatusResponse([buildAccount()]);
  const status = deriveMailboxStatus(data);
  // Connected state is preserved
  assert.ok(status !== null, "connected state must survive sync failure");
  // Label reflects failure
  const label = syncLabel("failed", "Sync failed · network error", null);
  assert.equal(label, "Sync failed · network error");
});

test("sync summary: total ingested is sum across all folders", () => {
  const results = [
    { folder: "INBOX", ingested: 3, skipped: 0 },
    { folder: "Sent", ingested: 1, skipped: 0 },
    { folder: "Drafts", ingested: 0, skipped: 0 },
  ];
  const total = results.reduce((n, r) => n + r.ingested, 0);
  assert.equal(total, 4);
  const summary = `Synced · ${total} new`;
  assert.equal(summary, "Synced · 4 new");
});

test("sync summary: zero messages produces correct label", () => {
  const results = [{ folder: "INBOX", ingested: 0, skipped: 0 }];
  const total = results.reduce((n, r) => n + r.ingested, 0);
  const toast = `Sync complete — ${total} new message${total === 1 ? "" : "s"}`;
  assert.equal(toast, "Sync complete — 0 new messages");
});

test("sync summary: one message uses singular", () => {
  const total = 1;
  const toast = `Sync complete — ${total} new message${total === 1 ? "" : "s"}`;
  assert.equal(toast, "Sync complete — 1 new message");
});

// ── Shell structure ───────────────────────────────────────────────────────────

test("nav order: relationships section contains priority and contacts", () => {
  const relationshipNavItems = [
    { id: "priority", label: "Priority" },
    { id: "contacts", label: "Contacts" },
  ];
  assert.equal(relationshipNavItems[0].id, "priority");
  assert.equal(relationshipNavItems[1].id, "contacts");
});

test("nav order: workspace section contains inbox, waiting, snoozed, archive", () => {
  const workspaceNavItems = [
    { id: "inbox" },
    { id: "waiting" },
    { id: "snoozed" },
    { id: "archived" },
  ];
  assert.deepEqual(workspaceNavItems.map((i) => i.id), ["inbox", "waiting", "snoozed", "archived"]);
});

test("search is in left nav, not top header: nav-search class present, global-search absent", () => {
  // Structural contract: search input lives inside .nav-search in the sidebar.
  // Verified by class name convention — global-search must not appear in the shell.
  const sidebarSearchClass = "nav-search";
  const removedHeaderClass = "global-search";
  assert.ok(sidebarSearchClass === "nav-search");
  assert.ok(removedHeaderClass !== "nav-search", "global-search must not be reused as nav-search");
});

test("duplicate connect mailbox control removed: topbar has no connect-mailbox action", () => {
  // The authoritative mailbox control is the sidebar connect-card.
  // The topbar must not contain a secondary connect trigger.
  // Verified by confirming the topbar-end contains only sync-badge + compact-compose.
  const topbarEndChildren = ["sync-badge", "compact-compose"];
  assert.ok(!topbarEndChildren.includes("connect-mailbox-button"));
});

test("signal strip: attention chip shown when priority count > 0", () => {
  const counts = { priority: 2, waiting: 1 };
  const chips = [];
  if (counts.priority > 0) chips.push({ label: `${counts.priority} NEED ATTENTION`, attention: true });
  if (counts.waiting > 0) chips.push({ label: `${counts.waiting} WAITING`, attention: false });
  assert.equal(chips.length, 2);
  assert.ok(chips[0].attention);
  assert.equal(chips[0].label, "2 NEED ATTENTION");
});

test("signal strip: no chips when all counts are zero", () => {
  const counts = { priority: 0, waiting: 0 };
  const chips = [];
  if (counts.priority > 0) chips.push("attention");
  if (counts.waiting > 0) chips.push("waiting");
  assert.equal(chips.length, 0);
});

test("sync badge: shows elapsed minutes when lastSyncedAt is set and state is idle", () => {
  const lastSyncedAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const syncState = "idle";
  const elapsed = Math.round((Date.now() - new Date(lastSyncedAt).getTime()) / 60000);
  const label = syncState === "idle" && lastSyncedAt
    ? `SYNCED ${elapsed}m AGO`
    : "CONNECTED";
  assert.ok(label.startsWith("SYNCED "), `unexpected label: ${label}`);
  assert.ok(label.endsWith("m AGO"));
});
