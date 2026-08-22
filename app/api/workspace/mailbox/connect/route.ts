import { getDb } from "../../../../../db";
import { mailboxAccounts } from "../../../../../db/schema";
import { requireOwner, routeError } from "../../shared";
import { encryptPassword } from "../../../../../lib/providers/crypto";
import { ImapProvider } from "../../../../../lib/providers/imap";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const payload = (await request.json()) as {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
    };

    const host = payload.host?.trim() ?? "";
    const port = Number(payload.port ?? 993);
    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";

    if (!host || !username || !password) {
      return Response.json({ error: "host, username, and password are required." }, { status: 400 });
    }
    if (port < 1 || port > 65535 || !Number.isInteger(port)) {
      return Response.json({ error: "port must be an integer between 1 and 65535." }, { status: 400 });
    }

    // Validate TLS connection before persisting anything
    const provider = new ImapProvider({ host, port, username, password, tls: true });
    try {
      await provider.validateConnection();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return Response.json({ error: `IMAP connection failed: ${msg}` }, { status: 422 });
    } finally {
      await provider.close().catch(() => undefined);
    }

    const encryptedPassword = encryptPassword(password);
    const db = getDb();
    const [account] = await db
      .insert(mailboxAccounts)
      .values({ ownerId: owner, host, port, username, encryptedPassword, tlsVerified: true })
      .returning({ id: mailboxAccounts.id, host: mailboxAccounts.host, username: mailboxAccounts.username, createdAt: mailboxAccounts.createdAt });

    return Response.json({ account }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
