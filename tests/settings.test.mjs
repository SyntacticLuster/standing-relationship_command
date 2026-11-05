import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

// ── Build artifact helpers ────────────────────────────────────────────────────

const ssrDir = new URL("../.next/server/chunks/ssr/", import.meta.url);

/** Find the SSR chunk that contains a given string. */
async function findChunkContaining(needle) {
  const files = await readdir(ssrDir);
  for (const f of files) {
    if (!f.endsWith(".js") || f.endsWith(".map")) continue;
    const content = await readFile(new URL(f, ssrDir), "utf8");
    if (content.includes(needle)) return content;
  }
  return null;
}

async function workspaceChunk() {
  const c = await findChunkContaining("Sync mailboxes now");
  assert.ok(c, "StandingWorkspace SSR chunk not found");
  return c;
}

async function settingsChunk() {
  const c = await findChunkContaining("settings-shell");
  assert.ok(c, "SettingsClient SSR chunk not found");
  return c;
}

// ── 1. Settings navigation ────────────────────────────────────────────────────

test("settings gear and account row navigate to /settings", async () => {
  const ws = await workspaceChunk();
  assert.match(ws, /\/settings/);
  // router.push("/settings") appears at least twice (gear + mailbox card)
  const matches = ws.match(/\/settings/g) ?? [];
  assert.ok(matches.length >= 2, "Expected at least 2 /settings references");
});

test("/settings page route is emitted", async () => {
  const dir = new URL("../.next/server/app/settings/", import.meta.url);
  const files = await readdir(dir);
  assert.ok(files.length > 0, "settings route was not emitted");
});

// ── 2. Connected mailbox list ─────────────────────────────────────────────────

test("settings client fetches mailbox status on load", async () => {
  const s = await settingsChunk();
  assert.match(s, /\/api\/workspace\/mailbox\/status/);
});

test("settings page shows provider, account identity, connection state, last sync", async () => {
  const s = await settingsChunk();
  assert.match(s, /Connected/);
  assert.match(s, /Last sync/);
  assert.match(s, /settings-orb/);
  assert.match(s, /settings-mailbox-info/);
});

// ── 3. Add mailbox reuses existing connect flow ───────────────────────────────

test("settings Add mailbox reuses the provider chooser and IMAP connect form", async () => {
  const s = await settingsChunk();
  assert.match(s, /Choose the first live adapter/);
  assert.match(s, /Nothing here can send, delete, or mutate external mail/);
  assert.match(s, /Connect IMAP account/);
  assert.match(s, /\/api\/workspace\/mailbox\/connect/);
});

// ── 4. Edit connection — blank password preserves credential ─────────────────

test("edit connection only sends password when non-empty", async () => {
  const s = await settingsChunk();
  // In the minified bundle: H&&(a.password=H) — H is the editPass state variable
  // We verify the pattern: truthy-check then assign password
  assert.match(s, /&&\(a\.password=/);
});

test("edit connection form placeholder communicates blank = preserve", async () => {
  const s = await settingsChunk();
  assert.match(s, /Leave blank to keep existing/);
});

test("edit connection form clears password when opening edit", async () => {
  const s = await settingsChunk();
  // The minifier chooses identifier names, so derive the editPass setter from
  // the "New password" input (the only input with this placeholder) instead of
  // hardcoding it: <input type="password" value={editPass}
  // onChange={(e) => setEditPass(e.target.value)} placeholder="Leave blank ..." />
  const input = s.match(
    /type:"password",value:[\w$]+,onChange:[\w$]+=>([\w$]+)\([\w$]+\.target\.value\),placeholder:"Leave blank to keep existing"/,
  );
  assert.ok(input, "edit-connection password input not found in compiled output");
  const setEditPass = input[1];

  // The Edit button's onClick (openEdit) must reset that same setter to "".
  const edit = s.match(
    /className:"settings-edit-btn",onClick:\(\)=>\{([^}]*)\}/,
  );
  assert.ok(edit, "Edit button onClick handler not found in compiled output");
  const escaped = setEditPass.replace(/\$/g, "\\$");
  assert.match(
    edit[1],
    new RegExp(`(^|,)${escaped}\\(""\\)(,|$)`),
    `Edit handler must call the editPass setter ${setEditPass}("") to clear the password`,
  );
});

// ── 5. Credential replacement when new password is supplied ──────────────────

test("PATCH route encrypts new password when supplied", async () => {
  const route = await readFile(
    new URL("../app/api/workspace/mailbox/[id]/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /encryptPassword\(password\)/);
  assert.match(route, /updates\.encryptedPassword/);
  assert.match(route, /if \(password\)/);
});

// ── 6. Cross-owner edit rejection ────────────────────────────────────────────

test("PATCH route verifies ownership before mutating", async () => {
  const route = await readFile(
    new URL("../app/api/workspace/mailbox/[id]/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /eq\(mailboxAccounts\.ownerId, owner\)/);
  assert.match(route, /Account not found/);
  assert.match(route, /status: 404/);
  const ownerChecks = route.match(/eq\(mailboxAccounts\.ownerId, owner\)/g) ?? [];
  assert.ok(ownerChecks.length >= 2, "Expected ownership check on both select and update");
});

test("PATCH route never returns encryptedPassword to client", async () => {
  const route = await readFile(
    new URL("../app/api/workspace/mailbox/[id]/route.ts", import.meta.url),
    "utf8",
  );
  const returningBlock = route.match(/\.returning\(\{[\s\S]*?\}\)/)?.[0] ?? "";
  assert.ok(!returningBlock.includes("encryptedPassword"), "encryptedPassword must not be returned to client");
});

// ── 7. Airplane sync control removed from mailbox card ───────────────────────

test("connected mailbox card no longer contains a sync/send button", async () => {
  // The old card had: aria-label="Sync mailbox" (exact string, not "Sync mailboxes now")
  // Verify the exact old label is gone from the bundle
  const ws = await workspaceChunk();
  assert.doesNotMatch(ws, /aria-label[^>]{0,20}Sync mailbox"/);
});

test("connected mailbox card navigates to /settings on click", async () => {
  const ws = await workspaceChunk();
  assert.match(ws, /Manage connections/);
});

// ── 8. Header sync control states ────────────────────────────────────────────

test("SyncControl component renders state classes", async () => {
  const src = await readFile(new URL("../app/StandingWorkspace.tsx", import.meta.url), "utf8");
  assert.match(src, /standing-sync/);
  assert.match(src, /is-syncing/);
  assert.match(src, /"syncing"/);
  assert.match(src, /"failed"/);
  assert.match(src, /"synced"/);
});

test("SyncControl has accessible label and tooltip", async () => {
  const ws = await workspaceChunk();
  assert.match(ws, /Sync mailboxes now/);
});

test("SyncControl arrows animate during syncing state", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes standing-sync-rotate/);
  assert.match(css, /is-syncing/);
  assert.match(css, /animation/);
});

// ── 9. Single-account sync ───────────────────────────────────────────────────

test("triggerSync calls sync route with accountId", async () => {
  const ws = await workspaceChunk();
  assert.match(ws, /\/api\/workspace\/mailbox\/sync/);
  assert.match(ws, /accountId/);
});

// ── 10. Multi-account sync ───────────────────────────────────────────────────

test("triggerSync uses Promise.allSettled to sync all owned accounts", async () => {
  const ws = await workspaceChunk();
  assert.match(ws, /Promise\.allSettled/);
});

// ── 11. Duplicate sync prevention ────────────────────────────────────────────

test("triggerSync is guarded against concurrent activation via ref", async () => {
  // Verify in source (not minified) — the ref guard is in the TS source
  const src = await readFile(
    new URL("../app/StandingWorkspace.tsx", import.meta.url),
    "utf8",
  );
  assert.match(src, /syncingRef\.current/);
  assert.match(src, /if \(syncingRef\.current\) return/);
  assert.match(src, /syncingRef\.current = true/);
  assert.match(src, /syncingRef\.current = false/);
});

// ── 12. Partial sync failure presentation ────────────────────────────────────

test("triggerSync surfaces partial failure when some accounts fail", async () => {
  const src = await readFile(
    new URL("../app/StandingWorkspace.tsx", import.meta.url),
    "utf8",
  );
  assert.match(src, /Partial failure/);
  assert.match(src, /Partial sync/);
  assert.match(src, /failures\.length && results\.length === failures\.length/);
});
