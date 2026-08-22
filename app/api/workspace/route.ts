import { count, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { contactNotes, drafts, threadStates } from "../../../db/schema";
import { requireOwner, routeError } from "./shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const owner = requireOwner(request);
  if (owner instanceof Response) return owner;

  try {
    const db = getDb();
    const [states, notes, draftCount] = await Promise.all([
      db.select().from(threadStates).where(eq(threadStates.ownerEmail, owner)),
      db.select().from(contactNotes).where(eq(contactNotes.ownerEmail, owner)),
      db
        .select({ value: count() })
        .from(drafts)
        .where(eq(drafts.ownerEmail, owner)),
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
