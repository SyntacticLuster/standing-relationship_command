import { getDb } from "../../../../db";
import { drafts } from "../../../../db/schema";
import { requireOwner, routeError } from "../shared";

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const payload = (await request.json()) as {
      recipient?: string;
      subject?: string;
      body?: string;
    };
    const recipient = payload.recipient?.trim() ?? "";
    const subject = payload.subject?.trim() ?? "";
    const body = payload.body?.trim() ?? "";

    if (!recipient && !subject && !body) {
      return Response.json({ error: "An empty draft cannot be saved." }, { status: 400 });
    }

    const db = getDb();
    const [draft] = await db
      .insert(drafts)
      .values({ ownerId: owner, recipient, subject, body })
      .returning({ id: drafts.id, createdAt: drafts.createdAt });

    return Response.json({ draft }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
