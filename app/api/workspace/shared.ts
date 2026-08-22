import { auth0 } from "../../auth";

export async function requireOwner(): Promise<string | Response> {
  const session = await auth0.getSession();
  if (!session) {
    return Response.json(
      { error: "Authenticated workspace identity is required." },
      { status: 401 },
    );
  }
  return session.user.sub;
}

export function routeError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Unexpected storage error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("relation") && combined.includes("does not exist")) {
    return Response.json(
      { error: "Standing storage has not finished provisioning." },
      { status: 503 },
    );
  }

  return Response.json({ error: "Standing could not persist this change." }, { status: 500 });
}
