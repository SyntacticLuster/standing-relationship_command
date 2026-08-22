import { getDb } from "../../../../db";
import { contactNotes } from "../../../../db/schema";
import { requireOwner, routeError } from "../shared";

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const payload = (await request.json()) as { contactId?: string; body?: string };
    const contactId = payload.contactId?.trim() ?? "";
    const body = payload.body?.trim() ?? "";

    if (!contactId || !body) {
      return Response.json({ error: "contactId and body are required." }, { status: 400 });
    }
    if (body.length > 2000) {
      return Response.json({ error: "Notes may not exceed 2,000 characters." }, { status: 400 });
    }

    const db = getDb();
    const [note] = await db
      .insert(contactNotes)
      .values({ ownerId: owner, contactId, body })
      .returning();

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
