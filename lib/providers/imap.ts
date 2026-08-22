import { ImapFlow } from "imapflow";
import type {
  DiscoveredFolder,
  MailProvider,
  MailProviderConfig,
  NormalizedMessage,
} from "./types";

const PREVIEW_CHARS = 280;

function deriveThreadKey(messageId: string, inReplyTo: string, references: string): string {
  // Use the oldest Message-ID in the References chain as the stable thread key.
  // Falls back to In-Reply-To, then the message's own Message-ID.
  const refs = references
    .split(/\s+/)
    .map((r) => r.trim())
    .filter(Boolean);
  if (refs.length > 0) return refs[0];
  if (inReplyTo.trim()) return inReplyTo.trim();
  return messageId.trim();
}

function addressList(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object") {
          const addr = (a as Record<string, unknown>).address ?? "";
          const name = (a as Record<string, unknown>).name ?? "";
          return name ? `${name} <${addr}>` : String(addr);
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

export class ImapProvider implements MailProvider {
  private client: ImapFlow;

  constructor(config: MailProviderConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: true, // TLS always
      auth: {
        user: config.username,
        pass: config.password,
      },
      logger: false, // never log credentials
      tls: {
        rejectUnauthorized: config.tls, // true = verify cert
      },
    });
  }

  async validateConnection(): Promise<void> {
    await this.client.connect();
    // Immediately verify we can list — confirms auth and read access
    await this.client.list();
  }

  async discoverFolders(): Promise<DiscoveredFolder[]> {
    const list = await this.client.list();
    return list.map((folder) => ({
      name: folder.path,
      flags: folder.flags ? [...folder.flags] : [],
    }));
  }

  async fetchMessages(
    folderName: string,
    sinceUid: number,
    storedUidValidity: string,
  ): Promise<{
    messages: NormalizedMessage[];
    currentUidValidity: string;
    uidValidityChanged: boolean;
  }> {
    const lock = await this.client.getMailboxLock(folderName, { readOnly: true });
    try {
      const mailbox = this.client.mailbox;
      if (!mailbox) throw new Error(`Could not open folder: ${folderName}`);

      const currentUidValidity = String(mailbox.uidValidity ?? "");
      const uidValidityChanged =
        storedUidValidity !== "" && storedUidValidity !== currentUidValidity;

      // If UIDVALIDITY changed, reset to full re-import from UID 1
      const startUid = uidValidityChanged ? 1 : sinceUid + 1;
      const range = `${startUid}:*`;

      const messages: NormalizedMessage[] = [];

      for await (const msg of this.client.fetch(range, {
        uid: true,
        envelope: true,
        flags: true,
        size: true,
        bodyParts: ["TEXT"],
      }, { uid: true })) {
        const env = msg.envelope ?? {};
        const messageId = String(env.messageId ?? "");
        const inReplyTo = String(env.inReplyTo ?? "");
        const references = String((env as Record<string, unknown>).references ?? "");
        const fromAddress = addressList(env.from);
        const toAddresses = addressList(env.to);
        const subject = String(env.subject ?? "");
        const sentAt = env.date instanceof Date ? env.date : null;
        const flags = msg.flags ? [...msg.flags].join(" ") : "";
        const rawSize = msg.size ?? 0;

        // Extract plain-text preview from body
        let bodyPreview = "";
        const textPart = msg.bodyParts?.get("TEXT");
        if (textPart) {
          const raw = textPart.toString("utf8");
          bodyPreview = raw.replace(/\r?\n/g, " ").trim().slice(0, PREVIEW_CHARS);
        }

        messages.push({
          uid: msg.uid,
          messageId,
          inReplyTo,
          references,
          threadKey: deriveThreadKey(messageId, inReplyTo, references),
          fromAddress,
          toAddresses,
          subject,
          sentAt,
          flags,
          bodyPreview,
          rawSize,
        });
      }

      return { messages, currentUidValidity, uidValidityChanged };
    } finally {
      lock.release();
    }
  }

  async close(): Promise<void> {
    await this.client.logout();
  }
}
