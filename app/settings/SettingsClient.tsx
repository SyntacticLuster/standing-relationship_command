"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type MailboxAccount = {
  id: number;
  host: string;
  port: number;
  username: string;
  status: string;
  createdAt: string;
};

type MailboxData = {
  accounts: MailboxAccount[];
  cursors: Array<{ accountId: number; syncedAt: string; folderId: number }>;
};

function lastSyncFor(data: MailboxData, accountId: number): string | null {
  const relevant = data.cursors.filter((c) => c.accountId === accountId);
  if (!relevant.length) return null;
  return relevant.reduce((latest, c) =>
    c.syncedAt > latest ? c.syncedAt : latest,
    relevant[0].syncedAt,
  );
}

function Icon({ name, size = 18 }: { name: "close" | "link" | "check" | "chevron-down" | "spark" | "settings" | "arrow-left"; size?: number }) {
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
  const paths: Record<string, React.ReactNode> = {
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    link: <><path d="m9.5 14.5 5-5" /><path d="M7.5 16.5 6 18a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 7.5 18 6a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    "chevron-down": <path d="m7 10 5 5 5-5" />,
    spark: <><path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /></>,
    "arrow-left": <><path d="m14.5 5-7 7 7 7" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function SettingsClient({
  displayName,
  email,
}: {
  displayName: string;
  email: string | null;
}) {
  const [data, setData] = useState<MailboxData>({ accounts: [], cursors: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Connect flow state
  const [connectOpen, setConnectOpen] = useState(false);
  const [imapFormOpen, setImapFormOpen] = useState(false);
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapUser, setImapUser] = useState("");
  const [imapPass, setImapPass] = useState("");
  const [imapConnecting, setImapConnecting] = useState(false);

  // Edit flow state
  const [editAccount, setEditAccount] = useState<MailboxAccount | null>(null);
  const [editHost, setEditHost] = useState("");
  const [editPort, setEditPort] = useState("");
  const [editUser, setEditUser] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workspace/mailbox/status", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const d = (await res.json()) as MailboxData;
        setData(d);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const res = await fetch("/api/workspace/mailbox/status", { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as MailboxData;
      setData(d);
    }
  };

  const connectImap = async (event: FormEvent) => {
    event.preventDefault();
    setImapConnecting(true);
    setToast("Connecting…");
    try {
      const res = await fetch("/api/workspace/mailbox/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ host: imapHost, port: parseInt(imapPort, 10), username: imapUser, password: imapPass }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setToast(d.error ?? "Connection failed");
        return;
      }
      setImapFormOpen(false);
      setConnectOpen(false);
      setImapPass("");
      setToast("Mailbox connected");
      await refreshData();
    } catch {
      setToast("Connection request failed; check network");
    } finally {
      setImapConnecting(false);
    }
  };

  const openEdit = (account: MailboxAccount) => {
    setEditAccount(account);
    setEditHost(account.host);
    setEditPort(String(account.port));
    setEditUser(account.username);
    setEditPass("");
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editAccount) return;
    setEditSaving(true);
    setToast("Saving…");
    try {
      const body: Record<string, string | number> = {
        host: editHost,
        port: parseInt(editPort, 10),
        username: editUser,
      };
      if (editPass) body.password = editPass;
      const res = await fetch(`/api/workspace/mailbox/${editAccount.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setToast(d.error ?? "Update failed");
        return;
      }
      setEditAccount(null);
      setEditPass("");
      setToast("Connection updated");
      await refreshData();
    } catch {
      setToast("Update request failed; check network");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="settings-shell">
      <header className="settings-header">
        <Link href="/" className="settings-back" aria-label="Back to workspace">
          <Icon name="arrow-left" size={16} />
          Workspace
        </Link>
        <div>
          <p className="settings-eyebrow">Standing</p>
          <h1>Settings</h1>
        </div>
      </header>

      <div className="settings-body">
        <section className="settings-section">
          <h2>Account</h2>
          <div className="settings-card">
            <div className="settings-identity">
              <span className="settings-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{displayName}</strong>
                <small>{email ?? "Private operator"}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Connections</h2>

          {loading ? (
            <p className="settings-loading">Loading…</p>
          ) : data.accounts.length === 0 ? (
            <div className="settings-card settings-empty-connections">
              <p>No mailboxes connected.</p>
              <button className="settings-add-btn" onClick={() => setConnectOpen(true)}>
                Add mailbox
              </button>
            </div>
          ) : (
            <>
              {data.accounts.map((account) => {
                const lastSync = lastSyncFor(data, account.id);
                return (
                  <div key={account.id} className="settings-card settings-mailbox-row">
                    <div className="settings-mailbox-info">
                      <span className={`settings-orb ${account.status === "active" ? "active" : "error"}`} />
                      <div>
                        <strong>{account.username}</strong>
                        <small>
                          {account.host}:{account.port} ·{" "}
                          {account.status === "active" ? "Connected" : account.status}
                          {lastSync
                            ? ` · Last sync ${new Date(lastSync).toLocaleTimeString()}`
                            : " · Not yet synced"}
                        </small>
                      </div>
                    </div>
                    <button
                      className="settings-edit-btn"
                      onClick={() => openEdit(account)}
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
              <button className="settings-add-btn settings-add-btn-inline" onClick={() => setConnectOpen(true)}>
                Add mailbox
              </button>
            </>
          )}
        </section>
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span />
          {toast}
        </div>
      )}

      {/* Provider chooser — reuses existing connect flow */}
      {connectOpen && (
        <div className="modal-layer" role="presentation">
          <button className="modal-backdrop" aria-label="Close" onClick={() => setConnectOpen(false)} />
          <section className="connect-modal" role="dialog" aria-modal="true" aria-labelledby="settings-connect-title">
            <header>
              <div className="connection-glyph"><Icon name="link" /></div>
              <div>
                <p>Provider boundary</p>
                <h2 id="settings-connect-title">Choose the first live adapter</h2>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setConnectOpen(false)}>
                <Icon name="close" />
              </button>
            </header>
            <p className="connect-copy">
              The interface is deliberately provider-neutral. Credentials stay server-side; imported messages retain source identity and timestamps.
            </p>
            <div className="provider-list">
              <button onClick={() => setToast("AWS mailbox adapter selected for implementation")}>
                <span className="provider-mark aws">AWS</span>
                <span><strong>SES inbound + outbound</strong><small>Best match for the current mail infrastructure</small></span>
                <em>Recommended</em>
              </button>
              <button onClick={() => { setConnectOpen(false); setImapFormOpen(true); }}>
                <span className="provider-mark imap">✉</span>
                <span><strong>Generic Mail — IMAP sync</strong><small>Any IMAP server over TLS (port 993)</small></span>
                <Icon name="chevron-down" size={15} />
              </button>
              <button onClick={() => setToast("Microsoft 365 adapter noted")}>
                <span className="provider-mark microsoft">M</span>
                <span><strong>Microsoft 365</strong><small>Graph-based mail and contact sync</small></span>
                <Icon name="chevron-down" size={15} />
              </button>
              <button onClick={() => setToast("Gmail adapter noted")}>
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

      {/* IMAP connect form */}
      {imapFormOpen && (
        <div className="modal-layer" role="presentation">
          <button className="modal-backdrop" aria-label="Close IMAP form" onClick={() => setImapFormOpen(false)} />
          <form
            className="compose-modal"
            onSubmit={connectImap}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-imap-title"
          >
            <header>
              <div><p>Generic Mail</p><h2 id="settings-imap-title">Connect IMAP account</h2></div>
              <button type="button" className="icon-button" aria-label="Close" onClick={() => setImapFormOpen(false)}>
                <Icon name="close" />
              </button>
            </header>
            <label><span>IMAP host</span><input value={imapHost} onChange={(e) => setImapHost(e.target.value)} placeholder="imap.example.com" required autoComplete="off" /></label>
            <label><span>Port</span><input value={imapPort} onChange={(e) => setImapPort(e.target.value)} placeholder="993" required /></label>
            <label><span>Username</span><input value={imapUser} onChange={(e) => setImapUser(e.target.value)} placeholder="you@example.com" required autoComplete="username" /></label>
            <label>
              <span>Password / app password</span>
              <input type="password" value={imapPass} onChange={(e) => setImapPass(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </label>
            <div className="compose-context">
              <Icon name="spark" size={16} />
              <span>TLS only. Credentials are encrypted server-side and never returned to the browser.</span>
            </div>
            <footer>
              <button type="button" className="text-button" onClick={() => setImapFormOpen(false)}>Cancel</button>
              <button type="submit" className="quiet-button" disabled={imapConnecting}>
                {imapConnecting ? "Connecting…" : "Connect"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* Edit connection form */}
      {editAccount && (
        <div className="modal-layer" role="presentation">
          <button className="modal-backdrop" aria-label="Close edit form" onClick={() => setEditAccount(null)} />
          <form
            className="compose-modal"
            onSubmit={saveEdit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-edit-title"
          >
            <header>
              <div>
                <p>Edit connection</p>
                <h2 id="settings-edit-title">{editAccount.username}</h2>
              </div>
              <button type="button" className="icon-button" aria-label="Close" onClick={() => setEditAccount(null)}>
                <Icon name="close" />
              </button>
            </header>
            <label><span>IMAP host</span><input value={editHost} onChange={(e) => setEditHost(e.target.value)} required autoComplete="off" /></label>
            <label><span>Port</span><input value={editPort} onChange={(e) => setEditPort(e.target.value)} required /></label>
            <label><span>Username</span><input value={editUser} onChange={(e) => setEditUser(e.target.value)} required autoComplete="username" /></label>
            <label>
              <span>New password</span>
              <input
                type="password"
                value={editPass}
                onChange={(e) => setEditPass(e.target.value)}
                placeholder="Leave blank to keep existing"
                autoComplete="new-password"
              />
            </label>
            <div className="compose-context">
              <Icon name="spark" size={16} />
              <span>Stored credentials are never returned to the browser. Leave password blank to preserve the existing credential.</span>
            </div>
            <footer>
              <button type="button" className="text-button" onClick={() => setEditAccount(null)}>Cancel</button>
              <button type="submit" className="quiet-button" disabled={editSaving}>
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
