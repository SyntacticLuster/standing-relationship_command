import { getDb } from "../../../../db";
import { threadStates } from "../../../../db/schema";
import { requireOwner, routeError } from "../shared";

const validStates = new Set(["inbox", "waiting", "snoozed", "archived"]);

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const payload = (await request.json()) as {
      threadId?: string;
      state?: string;
      starred?: boolean;
      unread?: boolean;
    };
    const threadId = payload.threadId?.trim() ?? "";
    const state = payload.state?.trim() ?? "";

    if (!threadId || !validStates.has(state)) {
      return Response.json({ error: "A valid threadId and state are required." }, { status: 400 });
    }

    const values = {
      ownerId: owner,
      threadId,
      state,
      starred: Boolean(payload.starred),
      unread: Boolean(payload.unread),
      updatedAt: new Date(),
    };

    const db = getDb();
    await db
      .insert(threadStates)
      .values(values)
      .onConflictDoUpdate({
        target: [threadStates.ownerId, threadStates.threadId],
        set: {
          state: values.state,
          starred: values.starred,
          unread: values.unread,
          updatedAt: values.updatedAt,
        },
      });

    return Response.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
