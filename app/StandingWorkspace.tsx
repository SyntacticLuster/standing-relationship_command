"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { contacts, initialThreads, type Contact, type Thread } from "./signal-data";

type MailSection =
  | "priority"
  | "inbox"
  | "waiting"
  | "snoozed"
  | "archived";
type WorkspaceView = MailSection | "contacts";
type ThreadFilter = "all" | "unread" | "reply" | "starred";
type StoredWorkspace = {
  threadStates: Array<{
    threadId: string;
    state: Thread["state"];
    starred: boolean;
    unread: boolean;
  }>;
  contactNotes: Array<{ contactId: string; body: string }>;
  draftCount: number;
};

type MailboxAccount = {
  id: number;
  host: string;
  username: string;
  status: string;
  createdAt: string;
};

type MailboxStatus = {
  account: MailboxAccount;
  messageCount: number;
  lastSyncedAt: string | null;
} | null;

type SyncState = "idle" | "syncing" | "synced" | "failed";
type IconName =
  | "archive"
  | "arrow-left"
  | "bolt"
  | "check"
  | "chevron-down"
  | "clock"
  | "close"
  | "compose"
  | "contact"
  | "copy"
  | "edit"
  | "inbox"
  | "link"
  | "mail"
  | "menu"
  | "more"
  | "note"
  | "reply"
  | "search"
  | "send"
  | "refresh"
  | "settings"
  | "spark"
  | "star"
  | "user"
  | "waiting";

const relationshipNavItems: { id: WorkspaceView; label: string; icon: IconName }[] = [
  { id: "priority", label: "Priority", icon: "bolt" },
  { id: "contacts", label: "Contacts", icon: "contact" },
];

const workspaceNavItems: { id: WorkspaceView; label: string; icon: IconName }[] = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "waiting", label: "Waiting", icon: "waiting" },
  { id: "snoozed", label: "Snoozed", icon: "clock" },
  { id: "archived", label: "Archive", icon: "archive" },
];

const filterItems: { id: ThreadFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reply", label: "Needs reply" },
  { id: "starred", label: "Starred" },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    archive: <><path d="M4 7.5h16v11H4z" /><path d="M3 4.5h18v3H3zM9 11.5h6" /></>,
    "arrow-left": <><path d="m14.5 5-7 7 7 7" /></>,
    bolt: <path d="m13.4 2-8 12h6l-.8 8 8-12h-6z" />,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    "chevron-down": <path d="m7 10 5 5 5-5" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    compose: <><path d="M4.5 19.5h4l10-10a2.8 2.8 0 0 0-4-4l-10 10v4z" /><path d="m13 7 4 4" /></>,
    contact: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 7h4M16 11h4M17 15h3" /></>,
    inbox: <><path d="M4 5h16v14H4z" /><path d="m4 14 4-4 3 3h2l3-3 4 4" /></>,
    link: <><path d="m9.5 14.5 5-5" /><path d="M7.5 16.5 6 18a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 7.5 18 6a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    menu: <><path d="M5 7h14M5 12h14M5 17h14" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="m18.5 2.5 2 2L12 13l-3 1 1-3z" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    note: <><path d="M5 3.5h14v17H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    reply: <><path d="m10 8-5 4 5 4" /><path d="M5 12h8c4 0 6 2 6 6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
    send: <><path d="m3 4 18 8-18 8 3-8z" /><path d="M6 12h15" /></>,
    refresh: <><path d="M21 12a9 9 0 1 1-2.1-5.8" /><path d="M21 3v4h-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></>,
    spark: <><path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    star: <path d="m12 3 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.3-4.2 6-.9z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.6-4.5 3.1-7 7.5-7s6.9 2.5 7.5 7" /></>,
    waiting: <><path d="M5 5h14M5 19h14M7 5c0 4 2 5 5 7-3 2-5 3-5 7M17 5c0 4-2 5-5 7 3 2 5 3 5 7" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Avatar({
  initials,
  accent,
  size = "normal",
}: {
  initials: string;
  accent: string;
  size?: "small" | "normal" | "large";
}) {
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ "--avatar-accent": accent } as React.CSSProperties}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function sectionTitle(view: WorkspaceView) {
  const names: Record<WorkspaceView, string> = {
    priority: "Priority",
    inbox: "Inbox",
    waiting: "Waiting",
    snoozed: "Snoozed",
    archived: "Archive",
    contacts: "Contacts",
  };
  return names[view];
}

export default function StandingWorkspace({
  displayName,
  email,
}: {
  displayName: string;
  email: string | null;
}) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [view, setView] = useState<WorkspaceView>("priority");
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreads[0].id);
  const [selectedContactId, setSelectedContactId] = useState(contacts[0].id);
  const [composeOpen, setComposeOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [imapFormOpen, setImapFormOpen] = useState(false);
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapUser, setImapUser] = useState("");
  const [imapPass, setImapPass] = useState("");
  const [imapConnecting, setImapConnecting] = useState(false);
  const [mailboxStatus, setMailboxStatus] = useState<MailboxStatus>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncSummary, setSyncSummary] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [drafts, setDrafts] = useState(0);
  const [draftTo, setDraftTo] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [contactNotes, setContactNotes] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState("Loading private workspace state…");
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editNoteDraft, setEditNoteDraft] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/workspace/mailbox/status", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          accounts: MailboxAccount[];
          cursors: Array<{ syncedAt: string; folderId: number }>;
        };
        if (!active) return;
        const account = data.accounts[0] ?? null;
        if (!account) return;
        const lastSyncedAt = data.cursors.length
          ? data.cursors.reduce((latest, c) =>
              c.syncedAt > latest ? c.syncedAt : latest, data.cursors[0].syncedAt)
          : null;
        setMailboxStatus({ account, messageCount: 0, lastSyncedAt });
      })
      .catch(() => undefined);

    fetch("/api/workspace", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`workspace state ${response.status}`);
        return (await response.json()) as StoredWorkspace;
      })
      .then((stored) => {
        if (!active) return;
        const stateByThread = new Map(
          stored.threadStates.map((state) => [state.threadId, state]),
        );
        setThreads((current) =>
          current.map((thread) => {
            const saved = stateByThread.get(thread.id);
            return saved
              ? {
                  ...thread,
                  state: saved.state,
                  starred: saved.starred,
                  unread: saved.unread,
                }
              : thread;
          }),
        );
        setContactNotes(
          stored.contactNotes.reduce<Record<string, string[]>>((all, note) => {
            all[note.contactId] = [...(all[note.contactId] ?? []), note.body];
            return all;
          }, {}),
        );
        setDrafts(stored.draftCount);
        setToast("Example workspace — private changes are durable");
      })
      .catch(() => {
        if (active) setToast("Example workspace — session changes only");
      });

    return () => {
      active = false;
    };
  }, []);

  const refreshWorkspace = async () => {
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      if (!response.ok) throw new Error(`workspace state ${response.status}`);
      const stored = (await response.json()) as StoredWorkspace;
      const stateByThread = new Map(
        stored.threadStates.map((state) => [state.threadId, state]),
      );
      setThreads((current) =>
        current.map((thread) => {
          const saved = stateByThread.get(thread.id);
          return saved
            ? { ...thread, state: saved.state, starred: saved.starred, unread: saved.unread }
            : thread;
        }),
      );
      setContactNotes(
        stored.contactNotes.reduce<Record<string, string[]>>((all, note) => {
          all[note.contactId] = [...(all[note.contactId] ?? []), note.body];
          return all;
        }, {}),
      );
      setDrafts(stored.draftCount);
      setToast("Priority refreshed");
    } catch {
      setToast("Refresh failed; session state preserved");
    }
  };

  const refreshMailboxStatus = async () => {
    try {
      const res = await fetch("/api/workspace/mailbox/status", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        accounts: MailboxAccount[];
        cursors: Array<{ syncedAt: string; folderId: number }>;
      };
      const account = data.accounts[0] ?? null;
      if (!account) return;
      const lastSyncedAt = data.cursors.length
        ? data.cursors.reduce((latest, c) =>
            c.syncedAt > latest ? c.syncedAt : latest, data.cursors[0].syncedAt)
        : null;
      setMailboxStatus((prev) => ({ account, messageCount: prev?.messageCount ?? 0, lastSyncedAt }));
    } catch {
      // preserve existing connected state on refresh failure
    }
  };

  const triggerSync = async () => {
    if (!mailboxStatus || syncState === "syncing") return;
    setSyncState("syncing");
    setToast("Syncing mailbox…");
    try {
      const res = await fetch("/api/workspace/mailbox/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId: mailboxStatus.account.id }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setSyncState("failed");
        setSyncSummary(data.error ?? "Sync failed");
        setToast(data.error ?? "Sync failed");
        return;
      }
      const data = (await res.json()) as { results: Array<{ folder: string; ingested: number; skipped: number }> };
      const total = data.results.reduce((n, r) => n + r.ingested, 0);
      setSyncState("synced");
      setSyncSummary(`Synced · ${total} new`);
      setToast(`Sync complete — ${total} new message${total === 1 ? "" : "s"}`);
      await refreshMailboxStatus();
    } catch {
      setSyncState("failed");
      setSyncSummary("Sync failed · network error");
      setToast("Sync failed; check network");
    }
  };

  const visibleThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return threads.filter((thread) => {
      const sectionMatch =
        view === "priority"
          ? thread.priority === "high" && thread.state !== "archived"
          : view === "waiting"
            ? thread.owner === "them" && thread.state !== "archived"
            : view === "contacts"
              ? false
              : thread.state === view;

      const filterMatch =
        filter === "all" ||
        (filter === "unread" && thread.unread) ||
        (filter === "reply" && thread.owner === "me") ||
        (filter === "starred" && thread.starred);

      const queryMatch =
        !normalized ||
        `${thread.sender} ${thread.company} ${thread.subject} ${thread.preview} ${thread.tags.join(" ")}`
          .toLowerCase()
          .includes(normalized);

      return sectionMatch && filterMatch && queryMatch;
    });
  }, [threads, view, filter, query]);

  const visibleContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return contacts.filter((contact) =>
      !normalized
        ? true
        : `${contact.name} ${contact.role} ${contact.company} ${contact.email} ${contact.tags.join(" ")}`
            .toLowerCase()
            .includes(normalized),
    );
  }, [query]);

  const selectedThread =
    view === "contacts"
      ? threads.find((thread) => thread.id === selectedThreadId) ?? threads[0]
      : visibleThreads.find((thread) => thread.id === selectedThreadId) ??
        visibleThreads[0] ??
        threads.find((thread) => thread.id === selectedThreadId) ??
        threads[0];
  const selectedContact =
    contacts.find((contact) =>
      contact.id ===
      (view === "contacts" ? selectedContactId : selectedThread?.contactId),
    ) ?? contacts[0];

  const counts = useMemo(
    () => ({
      priority: threads.filter(
        (thread) => thread.priority === "high" && thread.state !== "archived",
      ).length,
      inbox: threads.filter((thread) => thread.state === "inbox").length,
      waiting: threads.filter(
        (thread) => thread.owner === "them" && thread.state !== "archived",
      ).length,
      snoozed: threads.filter((thread) => thread.state === "snoozed").length,
      archived: threads.filter((thread) => thread.state === "archived").length,
      contacts: contacts.length,
    }),
    [threads],
  );

  const persistThreadState = async (thread: Thread) => {
    const response = await fetch("/api/workspace/thread-state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        threadId: thread.id,
        state: thread.state,
        starred: thread.starred,
        unread: thread.unread,
      }),
    });
    if (!response.ok) throw new Error(`thread state ${response.status}`);
  };

  const commitThread = (
    thread: Thread,
    changes: Partial<Pick<Thread, "state" | "starred" | "unread">>,
    successMessage?: string,
  ) => {
    const updated = { ...thread, ...changes };
    setThreads((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    void persistThreadState(updated)
      .then(() => {
        if (successMessage) setToast(successMessage);
      })
      .catch(() => setToast("Change kept in this session; durable sync is unavailable"));
  };

  const moveThread = (state: Thread["state"], message: string) => {
    if (!selectedThread) return;
    commitThread(selectedThread, { state, unread: false }, message);
    setMobileDetailOpen(false);
  };

  const toggleThread = (key: "starred" | "unread") => {
    if (!selectedThread) return;
    commitThread(selectedThread, { [key]: !selectedThread[key] });
  };

  const openReply = () => {
    if (!selectedThread || !selectedContact) return;
    setDraftTo(selectedContact.email);
    setDraftSubject(
      selectedThread.subject.toLowerCase().startsWith("re:")
        ? selectedThread.subject
        : `Re: ${selectedThread.subject}`,
    );
    setDraftBody("");
    setComposeOpen(true);
  };

  const openNewMessage = () => {
    setDraftTo("");
    setDraftSubject("");
    setDraftBody("");
    setComposeOpen(true);
  };

  const saveDraft = async (event: FormEvent) => {
    event.preventDefault();
    setComposeOpen(false);
    try {
      const response = await fetch("/api/workspace/drafts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipient: draftTo,
          subject: draftSubject,
          body: draftBody,
        }),
      });
      if (!response.ok) throw new Error(`draft ${response.status}`);
      setDrafts((value) => value + 1);
      setToast("Draft saved privately");
    } catch {
      setDrafts((value) => value + 1);
      setToast("Draft kept in this session; durable sync is unavailable");
    }
  };

  const addContactNote = async (event: FormEvent) => {
    event.preventDefault();
    const note = noteDraft.trim();
    if (!note) return;
    setContactNotes((current) => ({
      ...current,
      [selectedContact.id]: [...(current[selectedContact.id] ?? []), note],
    }));
    setNoteDraft("");
    try {
      const response = await fetch("/api/workspace/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contactId: selectedContact.id, body: note }),
      });
      if (!response.ok) throw new Error(`note ${response.status}`);
      setToast(`Private note added to ${selectedContact.name}`);
    } catch {
      setToast("Note kept in this session; durable sync is unavailable");
    }
  };

  const persistNote = async (contactId: string, note: string) => {
    const response = await fetch("/api/workspace/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactId, body: note }),
    });
    if (!response.ok) throw new Error(`note ${response.status}`);
  };

  const archiveContact = (contact: Contact) => {
    const contactThreads = threads.filter((t) => t.contactId === contact.id && t.state !== "archived");
    if (!contactThreads.length) {
      setToast(`No active threads to archive for ${contact.name}`);
      return;
    }
    contactThreads.forEach((thread) => commitThread(thread, { state: "archived", unread: false }));
    setToast(`${contact.name}’s threads archived`);
  };

  const copyContactEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setToast(`Copied ${email}`);
    } catch {
      setToast("Clipboard unavailable — copy manually: " + email);
    }
  };

  const saveEditNote = async (event: FormEvent) => {
    event.preventDefault();
    const note = editNoteDraft.trim();
    if (!note) return;
    setContactNotes((current) => ({
      ...current,
      [selectedContact.id]: [...(current[selectedContact.id] ?? []), note],
    }));
    setEditNoteDraft("");
    setEditContactOpen(false);
    try {
      await persistNote(selectedContact.id, note);
      setToast(`Note added to ${selectedContact.name}`);
    } catch {
      setToast("Note kept in this session; durable sync is unavailable");
    }
  };

  const connectImap = async (event: FormEvent) => {
    event.preventDefault();
    const port = parseInt(imapPort, 10);
    setImapConnecting(true);
    setToast("Connecting to IMAP server…");
    try {
      const res = await fetch("/api/workspace/mailbox/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ host: imapHost, port, username: imapUser, password: imapPass }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setToast(data.error ?? "IMAP connection failed");
        return;
      }
      const data = (await res.json()) as { account: MailboxAccount };
      setMailboxStatus({ account: data.account, messageCount: 0, lastSyncedAt: null });
      setSyncState("idle");
      setImapFormOpen(false);
      setConnectOpen(false);
      setImapPass("");
      setToast("IMAP account connected — sync to import mail");
    } catch {
      setToast("IMAP connect request failed; check network");
    } finally {
      setImapConnecting(false);
    }
  };

  const selectView = (next: WorkspaceView) => {
    setView(next);
    setFilter("all");
    setQuery("");
    setMobileNavOpen(false);
    setMobileDetailOpen(false);
  };

  return (
    <main className="signal-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/standing_man_logo.png" alt="Standing" className="brand-logo" />
          <button
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <label className="nav-search">
          <Icon name="search" size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, threads…"
            aria-label="Search people, threads, facts"
          />
          <kbd>⌘K</kbd>
        </label>

        <nav className="primary-nav" aria-label="Standing workspace">
          <p className="nav-label">Relationships</p>
          {relationshipNavItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => selectView(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              <small>{counts[item.id]}</small>
            </button>
          ))}
          <button onClick={() => setToast("Signals view is queued after live ingestion")}>
            <Icon name="spark" />
            <span>Signals</span>
            <em>soon</em>
          </button>

          <p className="nav-label nav-label-spaced">Workspace</p>
          {workspaceNavItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => selectView(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              <small>{counts[item.id]}</small>
            </button>
          ))}
        </nav>

        <button className="compose-button" onClick={openNewMessage}>
          <Icon name="compose" />
          <span>Compose</span>
          <kbd>C</kbd>
        </button>

        <div className="sidebar-spacer" />

        {mailboxStatus ? (
          <div className="connect-card connected">
            <span className="connection-orb connected"><span /></span>
            <span>
              <strong>{mailboxStatus.account.username}</strong>
              <small>
                {syncState === "syncing" ? "Syncing…"
                  : syncState === "synced" ? syncSummary
                  : syncState === "failed" ? syncSummary
                  : mailboxStatus.lastSyncedAt ? `Last sync ${new Date(mailboxStatus.lastSyncedAt).toLocaleTimeString()}`
                  : "Connected · not yet synced"}
              </small>
            </span>
            <button
              className="icon-button"
              aria-label="Sync mailbox"
              onClick={triggerSync}
              disabled={syncState === "syncing"}
              title="Sync now"
            >
              <Icon name="send" size={15} />
            </button>
          </div>
        ) : (
          <button className="connect-card" onClick={() => setConnectOpen(true)}>
            <span className="connection-orb"><span /></span>
            <span>
              <strong>Mailbox offline</strong>
              <small>Connect the first provider</small>
            </span>
            <Icon name="chevron-down" size={15} />
          </button>
        )}

        <div className="account-row">
          <span className="account-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{email ?? "Private operator"}</small>
          </span>
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={() => setToast("Settings are not wired in this slice")}
          >
            <Icon name="settings" size={17} />
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <section className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="signal-strip">
            <span className="signal-strip-date">TODAY</span>
            {counts.priority > 0 && (
              <span className="signal-chip attention">
                {counts.priority} NEED ATTENTION
              </span>
            )}
            {counts.waiting > 0 && (
              <span className="signal-chip">
                {counts.waiting} WAITING
              </span>
            )}
            {(() => {
              const loops = contacts.reduce((n, c) => n + c.openLoops.length, 0);
              return loops > 0 ? (
                <span className="signal-chip">{loops} OPEN LOOPS</span>
              ) : null;
            })()}
          </div>
          <div className="topbar-end">
            {mailboxStatus && (
              <span className={`sync-badge ${syncState === "syncing" ? "syncing" : syncState === "failed" ? "failed" : "ok"}` }>
                <span />
                {syncState === "syncing" ? "SYNCING…"
                  : syncState === "synced" ? `SYNCED`
                  : syncState === "failed" ? "SYNC FAILED"
                  : mailboxStatus.lastSyncedAt
                    ? `SYNCED ${Math.round((Date.now() - new Date(mailboxStatus.lastSyncedAt).getTime()) / 60000)}m AGO`
                    : "CONNECTED"}
              </span>
            )}
            <button className="compact-compose" onClick={openNewMessage}>
              <Icon name="compose" size={17} />
            </button>
          </div>
        </header>

        <div className={`content-grid ${view === "contacts" ? "contacts-mode" : ""}`}>
          {view === "contacts" ? (
            <ContactsList
              contacts={visibleContacts}
              selectedId={selectedContact.id}
              onSelect={(id) => {
                setSelectedContactId(id);
                setMobileDetailOpen(true);
              }}
            />
          ) : (
            <section className={`thread-list-pane ${mobileDetailOpen ? "mobile-hidden" : ""}`}>
              <div className="pane-heading">
                <div>
                  <p>Correspondence</p>
                  <h1>{sectionTitle(view)}</h1>
                </div>
                {view === "priority" ? (
                  <PriorityOverflowMenu
                    visibleThreads={visibleThreads}
                    onRefresh={refreshWorkspace}
                    onReviewSignals={() => setToast("Signals view is queued after live ingestion")}
                    onMarkVisibleRead={() => {
                      visibleThreads
                        .filter((t) => t.unread)
                        .forEach((t) => commitThread(t, { unread: false }));
                      setToast("Marked visible as read");
                    }}
                  />
                ) : (
                  <button className="icon-button" aria-label="More list actions">
                    <Icon name="more" />
                  </button>
                )}
              </div>

              <div className="filter-row" role="tablist" aria-label="Thread filters">
                {filterItems.map((item) => (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={filter === item.id}
                    className={filter === item.id ? "active" : ""}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="list-summary">
                <span>{visibleThreads.length} conversations</span>
                <span><i /> ranked by signal</span>
              </div>

              <div className="thread-list">
                {visibleThreads.length ? (
                  visibleThreads.map((thread) => (
                    <ThreadRow
                      key={thread.id}
                      thread={thread}
                      selected={selectedThread?.id === thread.id}
                      onSelect={() => {
                        setSelectedThreadId(thread.id);
                        setMobileDetailOpen(true);
                        if (thread.unread) {
                          commitThread(thread, { unread: false });
                        }
                      }}
                      onStar={(event) => {
                        event.stopPropagation();
                        commitThread(thread, { starred: !thread.starred });
                      }}
                    />
                  ))
                ) : (
                  <div className="empty-list">
                    <span><Icon name="check" size={23} /></span>
                    <strong>Nothing demanding attention</strong>
                    <p>That is either excellent or suspicious. Try another filter.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={`detail-pane ${mobileDetailOpen ? "mobile-visible" : ""}`}>
            <button
              className="mobile-back"
              onClick={() => setMobileDetailOpen(false)}
            >
              <Icon name="arrow-left" size={17} />
              {view === "contacts" ? "Contacts" : sectionTitle(view)}
            </button>

            {view === "contacts" ? (
              <ContactDetail
                contact={selectedContact}
                notes={contactNotes[selectedContact.id] ?? []}
                noteDraft={noteDraft}
                onNoteDraft={setNoteDraft}
                onAddNote={addContactNote}
                onCompose={() => {
                  setDraftTo(selectedContact.email);
                  setDraftSubject("");
                  setDraftBody("");
                  setComposeOpen(true);
                }}
              />
            ) : selectedThread ? (
              <ThreadDetail
                thread={selectedThread}
                onReply={openReply}
                onArchive={() => moveThread("archived", "Conversation archived")}
                onSnooze={() => moveThread("snoozed", "Conversation snoozed")}
                onToggleRead={() => toggleThread("unread")}
                onToggleStar={() => toggleThread("starred")}
              />
            ) : null}
          </section>

          <aside className={`intelligence-pane ${mobileDetailOpen ? "mobile-visible" : ""}`}>
            <RelationshipPanel
              contact={selectedContact}
              thread={view === "contacts" ? undefined : selectedThread}
              notes={contactNotes[selectedContact.id] ?? []}
              onOpenContact={() => {
                setSelectedContactId(selectedContact.id);
                setView("contacts");
              }}
              onEditContact={() => {
                setEditNoteDraft("");
                setEditContactOpen(true);
              }}
              onAddNote={() => {
                setEditNoteDraft("");
                setEditContactOpen(true);
              }}
              onArchiveContact={() => archiveContact(selectedContact)}
              onCopyEmail={() => copyContactEmail(selectedContact.email)}
            />
          </aside>
        </div>
      </section>

      <div className="toast" role="status" aria-live="polite">
        <span />
        {toast}
      </div>

      {drafts > 0 && <span className="draft-count" aria-label={`${drafts} saved drafts`}>{drafts}</span>}

      {composeOpen && (
        <div className="modal-layer" role="presentation">
          <button
            className="modal-backdrop"
            aria-label="Close compose window"
            onClick={() => setComposeOpen(false)}
          />
          <form className="compose-modal" onSubmit={saveDraft}>
            <header>
              <div>
                <p>New correspondence</p>
                <h2>Compose</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close compose window"
                onClick={() => setComposeOpen(false)}
              >
                <Icon name="close" />
              </button>
            </header>
            <label>
              <span>To</span>
              <input
                type="email"
                value={draftTo}
                onChange={(event) => setDraftTo(event.target.value)}
                placeholder="name@company.com"
              />
            </label>
            <label>
              <span>Subject</span>
              <input
                value={draftSubject}
                onChange={(event) => setDraftSubject(event.target.value)}
                placeholder="What is this about?"
              />
            </label>
            <textarea
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              placeholder="Write with context. Standing will eventually surface the useful bits before you hit send."
              aria-label="Message body"
            />
            <div className="compose-context">
              <Icon name="spark" size={16} />
              <span>Live context and send authority arrive with the mailbox adapter.</span>
            </div>
            <footer>
              <button type="button" className="text-button" onClick={() => setComposeOpen(false)}>
                Discard
              </button>
              <div>
                <button type="submit" className="quiet-button">Save draft</button>
                <button type="button" className="send-button" disabled title="Connect a mailbox to send">
                  <Icon name="send" size={16} />
                  Send
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}

      {connectOpen && (
        <div className="modal-layer" role="presentation">
          <button
            className="modal-backdrop"
            aria-label="Close connection window"
            onClick={() => setConnectOpen(false)}
          />
          <section className="connect-modal" role="dialog" aria-modal="true" aria-labelledby="connect-title">
            <header>
              <div className="connection-glyph"><Icon name="link" /></div>
              <div>
                <p>Provider boundary</p>
                <h2 id="connect-title">Choose the first live adapter</h2>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setConnectOpen(false)}>
                <Icon name="close" />
              </button>
            </header>
            <p className="connect-copy">
              The interface is deliberately provider-neutral. Credentials stay server-side; imported messages retain source identity and timestamps.
            </p>
            <div className="provider-list">
              <button onClick={() => setToast("AWS mailbox adapter selected for implementation") }>
                <span className="provider-mark aws">AWS</span>
                <span><strong>SES inbound + outbound</strong><small>Best match for the current mail infrastructure</small></span>
                <em>Recommended</em>
              </button>
              <button onClick={() => { setConnectOpen(false); setImapFormOpen(true); }} disabled={!!mailboxStatus}>
                <span className="provider-mark imap">✉</span>
                <span>
                  <strong>Generic Mail — IMAP sync</strong>
                  <small>{mailboxStatus ? `Connected · ${mailboxStatus.account.username}` : "Any IMAP server over TLS (port 993)"}</small>
                </span>
                {mailboxStatus ? <Icon name="check" size={15} /> : <Icon name="chevron-down" size={15} />}
              </button>
              <button onClick={() => setToast("Microsoft 365 adapter noted") }>
                <span className="provider-mark microsoft">M</span>
                <span><strong>Microsoft 365</strong><small>Graph-based mail and contact sync</small></span>
                <Icon name="chevron-down" size={15} />
              </button>
              <button onClick={() => setToast("Gmail adapter noted") }>
                <span className="provider-mark gmail">G</span>
                <span><strong>Gmail</strong><small>Mail, labels, drafts, and contacts</small></span>
                <Icon name="chevron-down" size={15} />
              </button>
            </div>
            <footer>
              No provider is connected in this review build. Nothing here can send, delete, or mutate external mail.
            </footer>
          </section>
        </div>
      )}
      {imapFormOpen && (
        <div className="modal-layer" role="presentation">
          <button
            className="modal-backdrop"
            aria-label="Close IMAP form"
            onClick={() => setImapFormOpen(false)}
          />
          <form
            className="compose-modal"
            onSubmit={connectImap}
            role="dialog"
            aria-modal="true"
            aria-labelledby="imap-form-title"
          >
            <header>
              <div>
                <p>Generic Mail</p>
                <h2 id="imap-form-title">Connect IMAP account</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close"
                onClick={() => setImapFormOpen(false)}
              >
                <Icon name="close" />
              </button>
            </header>
            <label>
              <span>IMAP host</span>
              <input
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                placeholder="imap.example.com"
                required
                autoComplete="off"
              />
            </label>
            <label>
              <span>Port</span>
              <input
                value={imapPort}
                onChange={(e) => setImapPort(e.target.value)}
                placeholder="993"
                required
              />
            </label>
            <label>
              <span>Username</span>
              <input
                value={imapUser}
                onChange={(e) => setImapUser(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="username"
              />
            </label>
            <label>
              <span>Password / app password</span>
              <input
                type="password"
                value={imapPass}
                onChange={(e) => setImapPass(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </label>
            <div className="compose-context">
              <Icon name="spark" size={16} />
              <span>TLS only. Credentials are encrypted server-side and never returned to the browser.</span>
            </div>
            <footer>
              <button type="button" className="text-button" onClick={() => setImapFormOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="quiet-button" disabled={imapConnecting}>
                {imapConnecting ? "Connecting…" : "Connect"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {editContactOpen && (
        <div className="modal-layer" role="presentation">
          <button
            className="modal-backdrop"
            aria-label="Close edit relationship window"
            onClick={() => setEditContactOpen(false)}
          />
          <form
            className="compose-modal edit-relationship-modal"
            onSubmit={saveEditNote}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-relationship-title"
          >
            <header>
              <div>
                <p>User-authored memory</p>
                <h2 id="edit-relationship-title">Edit relationship — {selectedContact.name}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close"
                onClick={() => setEditContactOpen(false)}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="edit-relationship-facts">
              <p className="edit-relationship-provenance">
                <Icon name="spark" size={13} />
                Source-derived facts below are read-only. Only user-authored notes can be added here.
              </p>
              <ul>
                {selectedContact.facts.map((fact) => (
                  <li key={fact}><span /><p>{fact}</p></li>
                ))}
              </ul>
            </div>
            <div className="edit-relationship-note-section">
              <label htmlFor="edit-note-input">Add a private note</label>
              <textarea
                id="edit-note-input"
                value={editNoteDraft}
                onChange={(e) => setEditNoteDraft(e.target.value)}
                placeholder={`Add context about ${selectedContact.name.split(" ")[0]}…`}
                maxLength={2000}
              />
              <span className="edit-note-count">{editNoteDraft.length}/2000</span>
            </div>
            <footer>
              <button type="button" className="text-button" onClick={() => setEditContactOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="quiet-button" disabled={!editNoteDraft.trim()}>
                Save note
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}

function ThreadRow({
  thread,
  selected,
  onSelect,
  onStar,
}: {
  thread: Thread;
  selected: boolean;
  onSelect: () => void;
  onStar: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <article className={`thread-row ${selected ? "selected" : ""}`}>
      <button className="thread-select" onClick={onSelect} aria-label={`Open ${thread.subject}`}>
      <span className="thread-leading">
        {thread.unread ? <i className="unread-dot" /> : <i />}
        <Avatar initials={thread.initials} accent={thread.accent} />
      </span>
      <span className="thread-content">
        <span className="thread-sender-line">
          <strong>{thread.sender}</strong>
          <time>{thread.time}</time>
        </span>
        <b>{thread.subject}</b>
        <span className="thread-preview">{thread.preview}</span>
        <span className="thread-tags">
          {thread.tags.slice(0, 2).map((tag) => <em key={tag}>{tag}</em>)}
        </span>
      </span>
      </button>
      <span className="thread-actions">
        <button
          className={thread.starred ? "starred" : ""}
          aria-label={thread.starred ? "Unstar conversation" : "Star conversation"}
          onClick={onStar}
        >
          <Icon name="star" size={15} />
        </button>
      </span>
    </article>
  );
}

function ThreadDetail({
  thread,
  onReply,
  onArchive,
  onSnooze,
  onToggleRead,
  onToggleStar,
}: {
  thread: Thread;
  onReply: () => void;
  onArchive: () => void;
  onSnooze: () => void;
  onToggleRead: () => void;
  onToggleStar: () => void;
}) {
  return (
    <div className="thread-detail">
      <header className="detail-header">
        <div className="detail-kicker">
          <span>{thread.signal}</span>
          <time>{thread.fullDate}</time>
        </div>
        <h2>{thread.subject}</h2>
        <div className="detail-toolbar">
          <button onClick={onArchive} title="Archive"><Icon name="archive" size={17} /><span>Archive</span></button>
          <button onClick={onSnooze} title="Snooze"><Icon name="clock" size={17} /><span>Snooze</span></button>
          <button onClick={onToggleRead} title="Toggle unread"><Icon name="mail" size={17} /><span>Unread</span></button>
          <button onClick={onToggleStar} className={thread.starred ? "active" : ""} title="Star"><Icon name="star" size={17} /></button>
          <button title="More actions"><Icon name="more" size={17} /></button>
        </div>
      </header>

      <div className="message-stack">
        {thread.messages.map((message) => (
          <article key={message.id} className={`message-card ${message.direction}`}>
            <header>
              <Avatar
                initials={message.author === "You" ? "AM" : thread.initials}
                accent={message.author === "You" ? "#f5f2e9" : thread.accent}
              />
              <span>
                <strong>{message.author}</strong>
                <small>{message.email}</small>
              </span>
              <time>{message.sentAt}</time>
            </header>
            <div>
              {message.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </div>

      <div className="reply-dock">
        <button onClick={onReply}>
          <Icon name="reply" size={18} />
          Reply to {thread.sender.split(" ")[0]}
        </button>
        <button className="icon-button" aria-label="More reply options">
          <Icon name="chevron-down" size={16} />
        </button>
      </div>
    </div>
  );
}

function RelationshipOverflowMenu({
  contact,
  onEdit,
  onAddNote,
  onArchive,
  onCopyEmail,
}: {
  contact: Contact;
  onEdit: () => void;
  onAddNote: () => void;
  onArchive: () => void;
  onCopyEmail: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close on click-away
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape, return focus to trigger
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const invoke = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="overflow-menu-anchor" ref={menuRef}>
      <button
        ref={triggerRef}
        className="icon-button"
        aria-label="More contact actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="more" />
      </button>

      {open && (
        <div className="overflow-menu" role="menu" aria-label={`Actions for ${contact.name}`}>
          <button role="menuitem" onClick={() => invoke(onEdit)}>
            <Icon name="edit" size={14} />
            Edit relationship
          </button>
          <button role="menuitem" onClick={() => invoke(onAddNote)}>
            <Icon name="note" size={14} />
            Add private note
          </button>
          <button
            role="menuitem"
            disabled
            title="Priority signals require a contact state write path — coming in Phase 4"
            className="overflow-menu-disabled"
          >
            <Icon name="bolt" size={14} />
            Mark as priority
          </button>
          <button role="menuitem" onClick={() => invoke(onCopyEmail)}>
            <Icon name="copy" size={14} />
            Copy email
          </button>
          <div className="overflow-menu-separator" role="separator" />
          <button role="menuitem" className="overflow-menu-destructive" onClick={() => invoke(onArchive)}>
            <Icon name="archive" size={14} />
            Archive relationship
          </button>
        </div>
      )}
    </div>
  );
}

function PriorityOverflowMenu({
  visibleThreads,
  onRefresh,
  onMarkVisibleRead,
  onReviewSignals,
}: {
  visibleThreads: Thread[];
  onRefresh: () => void;
  onMarkVisibleRead: () => void;
  onReviewSignals: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const invoke = (action: () => void) => {
    setOpen(false);
    action();
  };

  const hasUnread = visibleThreads.some((t) => t.unread);

  return (
    <div className="overflow-menu-anchor" ref={menuRef}>
      <button
        ref={triggerRef}
        className="icon-button"
        aria-label="Priority actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="more" />
      </button>

      {open && (
        <div className="overflow-menu" role="menu" aria-label="Priority actions">
          <button role="menuitem" onClick={() => invoke(onRefresh)}>
            <Icon name="refresh" size={14} />
            Refresh priority
          </button>
          <button
            role="menuitem"
            onClick={() => invoke(onMarkVisibleRead)}
            disabled={!hasUnread}
            className={!hasUnread ? "overflow-menu-disabled" : ""}
            title={!hasUnread ? "No unread conversations visible" : undefined}
          >
            <Icon name="check" size={14} />
            Mark visible as read
          </button>
          <button role="menuitem" onClick={() => invoke(onReviewSignals)}>
            <Icon name="spark" size={14} />
            Review signals
          </button>
          <div className="overflow-menu-separator" role="separator" />
          <button
            role="menuitem"
            disabled
            title="Priority rules are coming in a future release"
            className="overflow-menu-disabled"
          >
            <Icon name="settings" size={14} />
            Priority rules
          </button>
        </div>
      )}
    </div>
  );
}

function RelationshipPanel({
  contact,
  thread,
  notes,
  onOpenContact,
  onEditContact,
  onAddNote,
  onArchiveContact,
  onCopyEmail,
}: {
  contact: Contact;
  thread?: Thread;
  notes: string[];
  onOpenContact: () => void;
  onEditContact: () => void;
  onAddNote: () => void;
  onArchiveContact: () => void;
  onCopyEmail: () => void;
}) {
  return (
    <div className="relationship-panel">
      <header className="relationship-header">
        <Avatar initials={contact.initials} accent={contact.accent} size="large" />
        <div>
          <h3>{contact.name}</h3>
          <p>{contact.role} · {contact.company}</p>
        </div>
        <RelationshipOverflowMenu
          contact={contact}
          onEdit={onEditContact}
          onAddNote={onAddNote}
          onArchive={onArchiveContact}
          onCopyEmail={onCopyEmail}
        />
      </header>

      <button className="contact-link" onClick={onOpenContact}>
        Open full relationship record
        <span>→</span>
      </button>

      {thread && (
        <section className="signal-summary">
          <header><span><Icon name="spark" size={15} /></span><strong>Thread signal</strong></header>
          <p>{thread.summary}</p>
          <div>
            <small>Next best action</small>
            <strong>{thread.nextAction}</strong>
          </div>
        </section>
      )}

      <section className="relationship-score">
        <header><span>Relationship strength</span><strong>{contact.relationship}</strong></header>
        <div><span style={{ width: `${contact.relationship}%` }} /></div>
        <p>{contact.lastTouch} · {contact.status.toLowerCase()}</p>
      </section>

      <section className="intel-section">
        <header><h4>Known facts</h4><span>{contact.facts.length}</span></header>
        <ul>
          {contact.facts.map((fact) => <li key={fact}><span /><p>{fact}</p></li>)}
        </ul>
      </section>

      <section className="intel-section open-loops">
        <header><h4>Open loops</h4><span>{contact.openLoops.length}</span></header>
        {contact.openLoops.length ? (
          <ul>
            {contact.openLoops.map((loop) => <li key={loop}><Icon name="clock" size={14} /><p>{loop}</p></li>)}
          </ul>
        ) : <p className="no-loops">No unresolved commitments.</p>}
      </section>

      {notes.length > 0 && (
        <section className="intel-section">
          <header><h4>Notes from this session</h4><span>{notes.length}</span></header>
          <ul>{notes.map((note, index) => <li key={`${note}-${index}`}><span /><p>{note}</p></li>)}</ul>
        </section>
      )}
    </div>
  );
}

function ContactsList({
  contacts: items,
  selectedId,
  onSelect,
}: {
  contacts: Contact[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="contacts-list-pane">
      <div className="pane-heading contacts-heading">
        <div><p>Relationship memory</p><h1>Contacts</h1></div>
        <span>{items.length} people</span>
      </div>
      <div className="contact-column-labels">
        <span>Person</span><span>Relationship</span>
      </div>
      <div className="contacts-list">
        {items.map((contact) => (
          <button
            key={contact.id}
            className={`contact-row ${selectedId === contact.id ? "selected" : ""}`}
            onClick={() => onSelect(contact.id)}
          >
            <Avatar initials={contact.initials} accent={contact.accent} />
            <span className="contact-main">
              <strong>{contact.name}</strong>
              <small>{contact.role} · {contact.company}</small>
              <span>{contact.tags.slice(0, 2).map((tag) => <em key={tag}>{tag}</em>)}</span>
            </span>
            <span className="contact-health">
              <strong>{contact.relationship}</strong>
              <span><i style={{ width: `${contact.relationship}%` }} /></span>
              <small>{contact.lastTouch}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ContactDetail({
  contact,
  notes,
  noteDraft,
  onNoteDraft,
  onAddNote,
  onCompose,
}: {
  contact: Contact;
  notes: string[];
  noteDraft: string;
  onNoteDraft: (value: string) => void;
  onAddNote: (event: FormEvent) => void;
  onCompose: () => void;
}) {
  return (
    <div className="contact-detail">
      <header className="contact-detail-hero">
        <Avatar initials={contact.initials} accent={contact.accent} size="large" />
        <div>
          <span>{contact.status} relationship</span>
          <h2>{contact.name}</h2>
          <p>{contact.role} at {contact.company}</p>
        </div>
        <button onClick={onCompose}><Icon name="mail" size={17} />Message</button>
      </header>

      <section className="contact-coordinates">
        <a href={`mailto:${contact.email}`}><span><Icon name="mail" size={16} /></span><small>Email</small><strong>{contact.email}</strong></a>
        <div><span><Icon name="user" size={16} /></span><small>Location</small><strong>{contact.location}</strong></div>
      </section>

      <section className="contact-note">
        <header><Icon name="note" size={16} /><h3>Working note</h3></header>
        <p>{contact.note}</p>
      </section>

      <section className="timeline-section">
        <header><h3>Relationship timeline</h3><span>Latest first</span></header>
        <div className="timeline-item current"><i /><span><strong>Most recent touch</strong><small>{contact.lastTouch}</small></span><p>Correspondence captured in the active workspace.</p></div>
        <div className="timeline-item"><i /><span><strong>Relationship classified</strong><small>{contact.status}</small></span><p>{contact.tags.join(" · ")}</p></div>
        <div className="timeline-item"><i /><span><strong>Contact created</strong><small>Imported</small></span><p>Source identity retained for later provider sync.</p></div>
      </section>

      <form className="add-note-form" onSubmit={onAddNote}>
        <label htmlFor="contact-note-input">Add a private note</label>
        <textarea
          id="contact-note-input"
          value={noteDraft}
          onChange={(event) => onNoteDraft(event.target.value)}
          placeholder={`Remember something useful about ${contact.name.split(" ")[0]}…`}
        />
        <div><span>{notes.length} session notes</span><button type="submit" disabled={!noteDraft.trim()}>Add note</button></div>
      </form>
    </div>
  );
}
