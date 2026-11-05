import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("packages the Standing product shell and durable workspace capability", async () => {
  // Layout chunk contains the page title metadata
  const ssrChunksDir = new URL("../.next/server/chunks/ssr/", import.meta.url);
  const ssrChunks = await readdir(ssrChunksDir);

  const layoutChunk = ssrChunks.find((f) => f.startsWith("app_layout_tsx"));
  assert.ok(layoutChunk, "layout SSR chunk was not emitted");
  const layoutBundle = await readFile(new URL(layoutChunk, ssrChunksDir), "utf8");
  assert.match(layoutBundle, /Standing.*Relationship Command|Relationship Command.*Standing/);

  // Workspace component chunk contains the UI strings
  const ssrChunksDir2 = new URL("../.next/server/chunks/ssr/", import.meta.url);
  const ssrChunks2 = await readdir(ssrChunksDir2);
  let workspaceBundle = null;
  for (const f of ssrChunks2) {
    if (!f.endsWith(".js") || f.endsWith(".map")) continue;
    const content = await readFile(new URL(f, ssrChunksDir2), "utf8");
    if (content.includes("Search people, threads, facts")) { workspaceBundle = content; break; }
  }
  assert.ok(workspaceBundle, "StandingWorkspace SSR chunk was not emitted");
  assert.match(workspaceBundle, /Search people, threads, facts/);
  assert.match(workspaceBundle, /Nothing here can send, delete, or mutate external mail/);

  // Verify the workspace API route directory is present
  const apiDir = new URL("../.next/server/app/api/workspace/", import.meta.url);
  const apiFiles = await readdir(apiDir);
  assert.ok(apiFiles.length > 0, "workspace API routes were not emitted");

  // Verify the health route is present
  const healthDir = new URL("../.next/server/app/api/health/", import.meta.url);
  const healthFiles = await readdir(healthDir);
  assert.ok(healthFiles.some((f) => f.endsWith(".js") || f.endsWith(".rsc")), "health route was not emitted");

  // Verify the PostgreSQL migration exists
  const migrations = await readdir(new URL("../drizzle/", import.meta.url));
  assert.ok(migrations.some((name) => name.endsWith(".sql")), "PostgreSQL migration was not found");
});
