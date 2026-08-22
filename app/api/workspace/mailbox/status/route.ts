import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { mailboxAccounts, mailboxCursors, mailboxFolders } from "../../../../../db/schema";
import { requireOwner, routeError } from "../../shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const db = getDb();
    const accounts = await db
      .select({
        id: mailboxAccounts.id,
        host: mailboxAccounts.host,
        username: mailboxAccounts.username,
        status: mailboxAccounts.status,
        createdAt: mailboxAccounts.createdAt,
      })
      .from(mailboxAccounts)
      .where(eq(mailboxAccounts.ownerId, owner));

    const folderRows = await db
      .select()
      .from(mailboxFolders)
      .where(eq(mailboxFolders.ownerId, owner));

    const cursorRows = await db
      .select()
      .from(mailboxCursors)
      .where(eq(mailboxCursors.ownerId, owner));

    return Response.json({ accounts, folders: folderRows, cursors: cursorRows });
  } catch (error) {
    return routeError(error);
  }
}
