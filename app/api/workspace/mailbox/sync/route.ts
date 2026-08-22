import { requireOwner, routeError } from "../../shared";
import { syncMailboxAccount } from "../../../../../lib/providers/sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (owner instanceof Response) return owner;

  try {
    const payload = (await request.json()) as { accountId?: number };
    const accountId = Number(payload.accountId ?? 0);

    if (!accountId || !Number.isInteger(accountId)) {
      return Response.json({ error: "accountId is required." }, { status: 400 });
    }

    const results = await syncMailboxAccount(owner, accountId);
    return Response.json({ results });
  } catch (error) {
    return routeError(error);
  }
}
