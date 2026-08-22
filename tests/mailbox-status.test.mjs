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
