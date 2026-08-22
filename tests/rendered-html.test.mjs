import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("packages the Standing product shell and durable workspace capability", async () => {
  const serverBundle = await readFile(
    new URL("../dist/server/index.js", import.meta.url),
    "utf8",
  );
  assert.match(serverBundle, /Standing — Relationship Command/);
  assert.match(serverBundle, /api\/workspace\/thread-state/);

  const assetDirectory = new URL("../dist/client/assets/", import.meta.url);
  const clientAssets = await readdir(assetDirectory);
  const workspaceAsset = clientAssets.find((name) =>
    name.startsWith("StandingWorkspace-"),
  );
  assert.ok(workspaceAsset, "StandingWorkspace client asset was not emitted");
  const clientBundle = await readFile(new URL(workspaceAsset, assetDirectory), "utf8");
  assert.match(clientBundle, /Search people, threads, facts/);
  assert.match(clientBundle, /Nothing here can send, delete, or mutate external mail/);

  const hosting = JSON.parse(
    await readFile(new URL("../dist/.openai/hosting.json", import.meta.url), "utf8"),
  );
  assert.equal(hosting.d1, "DB");

  const migrations = await readdir(
    new URL("../dist/.openai/drizzle/", import.meta.url),
  );
  assert.ok(migrations.some((name) => name.endsWith(".sql")));
  await access(new URL("../dist/client/og.png", import.meta.url));
});
