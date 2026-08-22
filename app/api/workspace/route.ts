import { count, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { contactNotes, drafts, threadStates } from "../../../db/schema";
import { requireOwner, routeError } from "./shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const db = getDb();
    const [states, notes, draftCount] = await Promise.all([
      db.select().from(threadStates).where(eq(threadStates.ownerId, owner)),
      db.select().from(contactNotes).where(eq(contactNotes.ownerId, owner)),
      db
        .select({ value: count() })
        .from(drafts)
        .where(eq(drafts.ownerId, owner)),
    ]);

    return Response.json({
      threadStates: states,
      contactNotes: notes,
      draftCount: draftCount[0]?.value ?? 0,
    });
  } catch (error) {
    return routeError(error);
  }
}
