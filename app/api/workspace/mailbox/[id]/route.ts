import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { mailboxAccounts } from "../../../../../db/schema";
import { requireOwner, routeError } from "../../shared";
import { encryptPassword } from "../../../../../lib/providers/crypto";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const { id } = await params;
    const accountId = Number(id);
    if (!accountId || !Number.isInteger(accountId)) {
      return Response.json({ error: "Invalid account id." }, { status: 400 });
    }

    const payload = (await request.json()) as {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
    };

    const host = payload.host?.trim() ?? "";
    const port = payload.port !== undefined ? Number(payload.port) : undefined;
    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";

    if (!host || !username) {
      return Response.json({ error: "host and username are required." }, { status: 400 });
    }
    if (port !== undefined && (port < 1 || port > 65535 || !Number.isInteger(port))) {
      return Response.json({ error: "port must be an integer between 1 and 65535." }, { status: 400 });
    }

    const db = getDb();

    const [existing] = await db
      .select({ id: mailboxAccounts.id })
      .from(mailboxAccounts)
      .where(and(eq(mailboxAccounts.id, accountId), eq(mailboxAccounts.ownerId, owner)));

    if (!existing) {
      return Response.json({ error: "Account not found." }, { status: 404 });
    }

    type UpdateFields = {
      host: string;
      username: string;
      port?: number;
      encryptedPassword?: string;
    };

    const updates: UpdateFields = { host, username };
    if (port !== undefined) updates.port = port;
    // Empty password means "leave existing credential unchanged"
    if (password) {
      updates.encryptedPassword = encryptPassword(password);
    }

    const [updated] = await db
      .update(mailboxAccounts)
      .set(updates)
      .where(and(eq(mailboxAccounts.id, accountId), eq(mailboxAccounts.ownerId, owner)))
      .returning({
        id: mailboxAccounts.id,
        host: mailboxAccounts.host,
        port: mailboxAccounts.port,
        username: mailboxAccounts.username,
        status: mailboxAccounts.status,
      });

    return Response.json({ account: updated });
  } catch (error) {
    return routeError(error);
  }
}
