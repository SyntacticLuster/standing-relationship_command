export function requireOwner(request: Request): string | Response {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) {
    return Response.json(
      { error: "Authenticated workspace identity is required." },
      { status: 401 },
    );
  }
  return email;
}

export function routeError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Unexpected storage error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table")) {
    return Response.json(
      { error: "SignalSuite storage has not finished provisioning." },
      { status: 503 },
    );
  }

  return Response.json({ error: "SignalSuite could not persist this change." }, { status: 500 });
}
