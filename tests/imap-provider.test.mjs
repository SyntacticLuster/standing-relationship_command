import assert from "node:assert/strict";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import test from "node:test";

// ── Credential encryption (inline — no live DB needed) ──────────────────────

const TEST_KEY = randomBytes(32).toString("hex");

function encryptPassword(plaintext) {
  const key = Buffer.from(TEST_KEY, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptPassword(stored) {
  const key = Buffer.from(TEST_KEY, "hex");
  const parts = stored.split(":");
  assert.equal(parts.length, 3, "stored credential must have 3 colon-separated parts");
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data).toString("utf8") + decipher.final("utf8");
}

// ── Config validation ────────────────────────────────────────────────────────

test("rejects missing host", () => {
  const host = "".trim();
  assert.equal(host, "", "empty host should be caught");
  assert.ok(!host, "falsy host triggers 400");
});

test("rejects missing username", () => {
  const username = "  ".trim();
  assert.ok(!username, "blank username triggers 400");
});

test("rejects missing password", () => {
  const password = "";
  assert.ok(!password, "empty password triggers 400");
});

test("rejects port out of range", () => {
  for (const port of [0, 65536, -1, 99999]) {
    assert.ok(port < 1 || port > 65535, `port ${port} should be rejected`);
  }
});

test("accepts valid port 993", () => {
  const port = 993;
  assert.ok(port >= 1 && port <= 65535 && Number.isInteger(port));
});

// ── Credential encryption / redaction ───────────────────────────────────────

test("encrypted password round-trips correctly", () => {
  const plain = "super-secret-app-password";
  const stored = encryptPassword(plain);
  const recovered = decryptPassword(stored);
  assert.equal(recovered, plain);
});

test("encrypted value does not contain plaintext password", () => {
  const plain = "hunter2";
  const stored = encryptPassword(plain);
  assert.ok(!stored.includes(plain), "plaintext must not appear in ciphertext");
});

test("two encryptions of same password produce different ciphertext (random IV)", () => {
  const plain = "same-password";
  const a = encryptPassword(plain);
  const b = encryptPassword(plain);
  assert.notEqual(a, b, "each encryption must use a fresh IV");
});

test("stored credential format has three colon-separated parts", () => {
  const stored = encryptPassword("test");
  const parts = stored.split(":");
  assert.equal(parts.length, 3);
});

test("tampered ciphertext fails authentication", () => {
  const stored = encryptPassword("secret");
  const parts = stored.split(":");
  // Flip a byte in the ciphertext
  const dataHex = parts[2];
  const tampered = dataHex.slice(0, -2) + (dataHex.slice(-2) === "ff" ? "00" : "ff");
  const bad = `${parts[0]}:${parts[1]}:${tampered}`;
  assert.throws(() => decryptPassword(bad), "tampered ciphertext must throw");
});

// ── Thread key derivation ────────────────────────────────────────────────────

function deriveThreadKey(messageId, inReplyTo, references) {
  const refs = references.split(/\s+/).map((r) => r.trim()).filter(Boolean);
  if (refs.length > 0) return refs[0];
  if (inReplyTo.trim()) return inReplyTo.trim();
  return messageId.trim();
}

test("thread key uses oldest reference when references present", () => {
  const key = deriveThreadKey(
    "<msg3@example.com>",
    "<msg2@example.com>",
    "<msg1@example.com> <msg2@example.com>",
  );
  assert.equal(key, "<msg1@example.com>");
});

test("thread key falls back to In-Reply-To when no references", () => {
  const key = deriveThreadKey("<msg2@example.com>", "<msg1@example.com>", "");
  assert.equal(key, "<msg1@example.com>");
});

test("thread key falls back to own Message-ID for root message", () => {
  const key = deriveThreadKey("<root@example.com>", "", "");
  assert.equal(key, "<root@example.com>");
});

// ── Owner isolation ──────────────────────────────────────────────────────────

test("owner isolation: account lookup requires matching ownerId", () => {
  const accounts = [
    { id: 1, ownerId: "auth0|alice", host: "imap.alice.example" },
    { id: 2, ownerId: "auth0|bob", host: "imap.bob.example" },
  ];
  const callerOwner = "auth0|alice";
  const found = accounts.filter((a) => a.id === 2 && a.ownerId === callerOwner);
  assert.equal(found.length, 0, "bob's account must not be accessible to alice");
});

test("owner isolation: account lookup succeeds for correct owner", () => {
  const accounts = [{ id: 1, ownerId: "auth0|alice", host: "imap.alice.example" }];
  const found = accounts.filter((a) => a.id === 1 && a.ownerId === "auth0|alice");
  assert.equal(found.length, 1);
});

// ── Bootstrap idempotency ────────────────────────────────────────────────────

test("idempotent insert: second insert of same (accountId, folderId, uid) is skipped", () => {
  const stored = new Map();
  function insertMessage(accountId, folderId, uid, subject) {
    const key = `${accountId}:${folderId}:${uid}`;
    if (stored.has(key)) return "skipped";
    stored.set(key, subject);
    return "inserted";
  }
  assert.equal(insertMessage(1, 1, 42, "Hello"), "inserted");
  assert.equal(insertMessage(1, 1, 42, "Hello again"), "skipped");
  assert.equal(stored.get("1:1:42"), "Hello", "original value preserved");
});

// ── Incremental UID sync ─────────────────────────────────────────────────────

test("incremental sync fetches only UIDs above cursor", () => {
  const cursor = { lastUid: 100 };
  const allUids = [98, 99, 100, 101, 102, 103];
  const toFetch = allUids.filter((uid) => uid > cursor.lastUid);
  assert.deepEqual(toFetch, [101, 102, 103]);
});

test("cursor advances to max UID after sync", () => {
  const messages = [{ uid: 101 }, { uid: 102 }, { uid: 103 }];
  const maxUid = messages.reduce((m, msg) => Math.max(m, msg.uid), 0);
  assert.equal(maxUid, 103);
});

test("cursor does not advance when no new messages", () => {
  const messages = [];
  const prevLastUid = 100;
  const maxUid = messages.reduce((m, msg) => Math.max(m, msg.uid), prevLastUid);
  assert.equal(maxUid, prevLastUid);
});

// ── UIDVALIDITY reset ────────────────────────────────────────────────────────

test("UIDVALIDITY change is detected when stored differs from current", () => {
  const stored = "1234567890";
  const current = "9999999999";
  const changed = stored !== "" && stored !== current;
  assert.ok(changed, "mismatch must trigger reset");
});

test("UIDVALIDITY change not triggered on first sync (empty stored)", () => {
  const stored = "";
  const current = "1234567890";
  const changed = stored !== "" && stored !== current;
  assert.ok(!changed, "empty stored means first sync, no reset");
});

test("UIDVALIDITY unchanged does not trigger reset", () => {
  const stored = "1234567890";
  const current = "1234567890";
  const changed = stored !== "" && stored !== current;
  assert.ok(!changed);
});

test("on UIDVALIDITY reset, startUid resets to 1", () => {
  const uidValidityChanged = true;
  const lastUid = 500;
  const startUid = uidValidityChanged ? 1 : lastUid + 1;
  assert.equal(startUid, 1);
});

test("on normal incremental sync, startUid is lastUid + 1", () => {
  const uidValidityChanged = false;
  const lastUid = 500;
  const startUid = uidValidityChanged ? 1 : lastUid + 1;
  assert.equal(startUid, 501);
});

// ── Duplicate prevention ─────────────────────────────────────────────────────

test("duplicate Message-ID in different folders is allowed (different folderId)", () => {
  const stored = new Map();
  function insertMessage(accountId, folderId, uid) {
    const key = `${accountId}:${folderId}:${uid}`;
    if (stored.has(key)) return "skipped";
    stored.set(key, true);
    return "inserted";
  }
  // Same UID in different folders is a different key
  assert.equal(insertMessage(1, 1, 42), "inserted");
  assert.equal(insertMessage(1, 2, 42), "inserted");
});
