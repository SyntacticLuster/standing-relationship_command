export type MailProviderConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  tls: true; // always required — no plaintext
};

export type DiscoveredFolder = {
  name: string;
  flags: string[];
};

export type NormalizedMessage = {
  uid: number;
  messageId: string;
  inReplyTo: string;
  references: string;
  threadKey: string;
  fromAddress: string;
  toAddresses: string;
  subject: string;
  sentAt: Date | null;
  flags: string;
  bodyPreview: string;
  rawSize: number;
};

export type FolderCursor = {
  folderId: number;
  folderName: string;
  lastUid: number;
  uidValidity: string;
};

export type SyncResult = {
  folder: string;
  ingested: number;
  skipped: number;
  uidValidityReset: boolean;
};

export type MailProvider = {
  validateConnection(): Promise<void>;
  discoverFolders(): Promise<DiscoveredFolder[]>;
  fetchMessages(
    folderName: string,
    sinceUid: number,
    uidValidity: string,
  ): Promise<{ messages: NormalizedMessage[]; currentUidValidity: string; uidValidityChanged: boolean }>;
  close(): Promise<void>;
};
