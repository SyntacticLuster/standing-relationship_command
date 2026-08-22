import { and, eq } from "drizzle-orm";
import { getDb } from "../../db";
import {
  mailboxAccounts,
  mailboxCursors,
  mailboxFolders,
  mailboxMessages,
} from "../../db/schema";
import { decryptPassword } from "./crypto";
import { ImapProvider } from "./imap";
import type { SyncResult } from "./types";

export async function syncMailboxAccount(
  ownerId: string,
  accountId: number,
): Promise<SyncResult[]> {
  const db = getDb();

  const [account] = await db
    .select()
    .from(mailboxAccounts)
    .where(and(eq(mailboxAccounts.id, accountId), eq(mailboxAccounts.ownerId, ownerId)));

  if (!account) throw new Error("Mailbox account not found or not owned by caller.");

  const password = decryptPassword(account.encryptedPassword);
  const provider = new ImapProvider({
    host: account.host,
    port: account.port,
    username: account.username,
    password,
    tls: true,
  });

  await provider.validateConnection();
  const discovered = await provider.discoverFolders();

  const results: SyncResult[] = [];

  for (const folder of discovered) {
    // Upsert folder record
    await db
      .insert(mailboxFolders)
      .values({ ownerId, accountId, name: folder.name })
      .onConflictDoNothing();

    const [folderRow] = await db
      .select()
      .from(mailboxFolders)
      .where(
        and(eq(mailboxFolders.accountId, accountId), eq(mailboxFolders.name, folder.name)),
      );
    if (!folderRow) continue;

    // Load cursor
    const [cursor] = await db
      .select()
      .from(mailboxCursors)
      .where(
        and(
          eq(mailboxCursors.accountId, accountId),
          eq(mailboxCursors.folderId, folderRow.id),
        ),
      );

    const lastUid = cursor?.lastUid ?? 0;
    const storedUidValidity = cursor?.uidValidity ?? "";

    const { messages, currentUidValidity, uidValidityChanged } =
      await provider.fetchMessages(folder.name, lastUid, storedUidValidity);

    // If UIDVALIDITY changed, purge stale messages for this folder
    if (uidValidityChanged) {
      await db
        .delete(mailboxMessages)
        .where(
          and(
            eq(mailboxMessages.accountId, accountId),
            eq(mailboxMessages.folderId, folderRow.id),
          ),
        );
    }

    let ingested = 0;
    let skipped = 0;
    let maxUid = uidValidityChanged ? 0 : lastUid;

    for (const msg of messages) {
      try {
        await db
          .insert(mailboxMessages)
          .values({
            ownerId,
            accountId,
            folderId: folderRow.id,
            uid: msg.uid,
            messageId: msg.messageId,
            inReplyTo: msg.inReplyTo,
            references: msg.references,
            threadKey: msg.threadKey,
            fromAddress: msg.fromAddress,
            toAddresses: msg.toAddresses,
            subject: msg.subject,
            sentAt: msg.sentAt,
            flags: msg.flags,
            bodyPreview: msg.bodyPreview,
            rawSize: msg.rawSize,
          })
          .onConflictDoNothing(); // idempotent — unique(accountId, folderId, uid)
        ingested++;
      } catch {
        skipped++;
      }
      if (msg.uid > maxUid) maxUid = msg.uid;
    }

    // Persist cursor
    await db
      .insert(mailboxCursors)
      .values({
        ownerId,
        accountId,
        folderId: folderRow.id,
        lastUid: maxUid,
        uidValidity: currentUidValidity,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [mailboxCursors.accountId, mailboxCursors.folderId],
        set: {
          lastUid: maxUid,
          uidValidity: currentUidValidity,
          syncedAt: new Date(),
        },
      });

    results.push({
      folder: folder.name,
      ingested,
      skipped,
      uidValidityReset: uidValidityChanged,
    });
  }

  await provider.close();
  return results;
}
