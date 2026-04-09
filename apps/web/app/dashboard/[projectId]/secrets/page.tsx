"use client";

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Project, Env, SecretMeta } from "@/lib/api";

const ENV_COLORS: Record<string, string> = {
  prod: "#EF4444",
  staging: "#F59E0B",
  dev: "#22C55E",
};

export default function SecretsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [activeEnv, setActiveEnv] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<SecretMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [secretsLoading, setSecretsLoading] = useState(false);

  // Reveal state: key → plain text value (null = hidden)
  const [revealed, setRevealed] = useState<Record<string, string | null>>({});
  const [revealing, setRevealing] = useState<Record<string, boolean>>({});

  // Add secret form
  const [showAdd, setShowAdd] = useState(false);
  const [addKey, setAddKey] = useState("");
  const [addValue, setAddValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Edit state: key → new value (only one at a time)
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [proj, environments] = await Promise.all([
          api.projects.get(projectId),
          api.envs.list(projectId),
        ]);
        setProject(proj);
        setEnvs(environments);
        if (environments.length > 0) setActiveEnv(environments[0].name);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, router]);

  useEffect(() => {
    if (!activeEnv) return;
    setSecretsLoading(true);
    setRevealed({});
    api.secrets
      .list(projectId, activeEnv)
      .then(setSecrets)
      .catch(() => setSecrets([]))
      .finally(() => setSecretsLoading(false));
  }, [activeEnv, projectId]);

  async function handleReveal(key: string) {
    if (revealed[key] !== undefined) {
      setRevealed((r) => ({ ...r, [key]: revealed[key] === null ? null : null }));
      if (revealed[key] !== null) {
        setRevealed((r) => ({ ...r, [key]: null }));
        return;
      }
    }
    setRevealing((r) => ({ ...r, [key]: true }));
    try {
      const { value } = await api.secrets.get(projectId, activeEnv!, key);
      setRevealed((r) => ({ ...r, [key]: value }));
    } finally {
      setRevealing((r) => ({ ...r, [key]: false }));
    }
  }

  function handleHide(key: string) {
    setRevealed((r) => ({ ...r, [key]: null }));
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!addKey.trim() || !addValue.trim()) return;
    setAddError(null);
    setAddLoading(true);
    try {
      await api.secrets.create(projectId, activeEnv!, addKey.trim(), addValue.trim());
      setSecrets((s) => [
        ...s,
        { key: addKey.trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
      setAddKey("");
      setAddValue("");
      setShowAdd(false);
    } catch (err: any) {
      setAddError(err.message ?? "Failed to create secret");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEdit(key: string) {
    if (!editValue.trim()) return;
    setEditLoading(true);
    try {
      await api.secrets.update(projectId, activeEnv!, key, editValue.trim());
      setEditKey(null);
      setEditValue("");
      setRevealed((r) => ({ ...r, [key]: null }));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(key: string) {
    setDeleteLoading(true);
    try {
      await api.secrets.delete(projectId, activeEnv!, key);
      setSecrets((s) => s.filter((sec) => sec.key !== key));
      setDeleteKey(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const pairs: Record<string, string> = {};
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const k = trimmed.slice(0, eq).trim();
        let v = trimmed.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        pairs[k] = v;
      }
      if (Object.keys(pairs).length === 0) {
        setImportError("No valid KEY=VALUE pairs found in file");
        return;
      }
      const { imported } = await api.secrets.import(projectId, activeEnv!, pairs);
      const now = new Date().toISOString();
      setSecrets((s) => {
        const existing = new Set(s.map((sec) => sec.key));
        const newKeys = Object.keys(pairs)
          .filter((k) => !existing.has(k))
          .map((k) => ({ key: k, createdAt: now, updatedAt: now }));
        return [...s, ...newKeys];
      });
      alert(`Imported ${imported} secret${imported !== 1 ? "s" : ""}`);
    } catch (err: any) {
      setImportError(err.message ?? "Import failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555A70", fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1F2336", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>Projects</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <Link href={`/dashboard/${projectId}`} style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>{project.name}</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Secrets</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* Environment tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1F2336", marginBottom: 28 }}>
          {envs.map((env) => (
            <button
              key={env.name}
              onClick={() => setActiveEnv(env.name)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeEnv === env.name ? `2px solid ${ENV_COLORS[env.name] ?? "#6366F1"}` : "2px solid transparent",
                padding: "10px 18px",
                color: activeEnv === env.name ? "#F0F2F8" : "#8B90A8",
                fontSize: 13,
                fontWeight: activeEnv === env.name ? 600 : 400,
                cursor: "pointer",
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              <EnvDot color={ENV_COLORS[env.name] ?? "#6366F1"} />
              {env.name}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ color: "#8B90A8", fontSize: 13 }}>
            {secretsLoading ? "Loading…" : `${secrets.length} secret${secrets.length !== 1 ? "s" : ""}`}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <label
              style={{
                background: "transparent",
                border: "1px solid #2A2F42",
                borderRadius: 8,
                padding: "7px 14px",
                color: "#8B90A8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Import .env
              <input ref={fileRef} type="file" accept=".env,text/plain" style={{ display: "none" }} onChange={handleImport} />
            </label>
            <button
              onClick={() => setShowAdd((v) => !v)}
              style={{
                background: "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add secret
            </button>
          </div>
        </div>

        {importError && (
          <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{importError}</p>
        )}

        {/* Add secret form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            style={{
              background: "#141720",
              border: "1px solid #2A2F42",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 12,
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 160px" }}>
              <label style={{ color: "#8B90A8", fontSize: 11, fontWeight: 500 }}>KEY</label>
              <input
                value={addKey}
                onChange={(e) => setAddKey(e.target.value)}
                placeholder="DATABASE_URL"
                autoFocus
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "2 1 260px" }}>
              <label style={{ color: "#8B90A8", fontSize: 11, fontWeight: 500 }}>VALUE</label>
              <input
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                placeholder="postgres://…"
                style={inputStyle}
              />
            </div>
            {addError && <p style={{ color: "#EF4444", fontSize: 12, width: "100%", margin: 0 }}>{addError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => { setShowAdd(false); setAddKey(""); setAddValue(""); }} style={cancelBtnStyle}>Cancel</button>
              <button type="submit" disabled={addLoading || !addKey.trim() || !addValue.trim()} style={primaryBtnStyle}>
                {addLoading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Secrets table */}
        {secretsLoading ? null : secrets.length === 0 ? (
          <div style={{ border: "1px dashed #2A2F42", borderRadius: 10, padding: "48px 32px", textAlign: "center", color: "#555A70" }}>
            <p style={{ fontSize: 14 }}>No secrets in <strong style={{ color: "#8B90A8" }}>{activeEnv}</strong>.</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Click "Add secret" or import a .env file.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {secrets.map((sec) => (
              <SecretRow
                key={sec.key}
                secret={sec}
                revealedValue={revealed[sec.key] ?? null}
                isRevealing={revealing[sec.key] ?? false}
                isEditing={editKey === sec.key}
                editValue={editValue}
                editLoading={editLoading}
                isDeleting={deleteKey === sec.key}
                deleteLoading={deleteLoading}
                onReveal={() => handleReveal(sec.key)}
                onHide={() => handleHide(sec.key)}
                onEditStart={() => { setEditKey(sec.key); setEditValue(revealed[sec.key] ?? ""); }}
                onEditChange={(v) => setEditValue(v)}
                onEditSave={() => handleEdit(sec.key)}
                onEditCancel={() => { setEditKey(null); setEditValue(""); }}
                onDeleteRequest={() => setDeleteKey(sec.key)}
                onDeleteConfirm={() => handleDelete(sec.key)}
                onDeleteCancel={() => setDeleteKey(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SecretRowProps {
  secret: SecretMeta;
  revealedValue: string | null;
  isRevealing: boolean;
  isEditing: boolean;
  editValue: string;
  editLoading: boolean;
  isDeleting: boolean;
  deleteLoading: boolean;
  onReveal: () => void;
  onHide: () => void;
  onEditStart: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function SecretRow({
  secret, revealedValue, isRevealing,
  isEditing, editValue, editLoading,
  isDeleting, deleteLoading,
  onReveal, onHide, onEditStart, onEditChange, onEditSave, onEditCancel,
  onDeleteRequest, onDeleteConfirm, onDeleteCancel,
}: SecretRowProps) {
  return (
    <div
      style={{
        background: "#141720",
        border: "1px solid #1F2336",
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Key */}
      <span style={{ fontFamily: "monospace", fontSize: 13, color: "#F0F2F8", flex: "0 0 auto", minWidth: 160 }}>
        {secret.key}
      </span>

      {/* Value / edit */}
      <div style={{ flex: 1, minWidth: 200 }}>
        {isEditing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              autoFocus
              style={{ ...inputStyle, flex: 1, fontFamily: "monospace", fontSize: 13 }}
            />
            <button onClick={onEditSave} disabled={editLoading} style={primaryBtnStyle}>
              {editLoading ? "Saving…" : "Save"}
            </button>
            <button onClick={onEditCancel} style={cancelBtnStyle}>Cancel</button>
          </div>
        ) : revealedValue !== null ? (
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#8B90A8", wordBreak: "break-all" }}>
            {revealedValue}
          </span>
        ) : (
          <span style={{ color: "#2A2F42", fontSize: 13, fontFamily: "monospace", letterSpacing: 2 }}>
            ••••••••
          </span>
        )}
      </div>

      {/* Actions */}
      {isDeleting ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#EF4444", fontSize: 12 }}>Delete {secret.key}?</span>
          <button onClick={onDeleteConfirm} disabled={deleteLoading} style={{ ...primaryBtnStyle, background: "#EF4444" }}>
            {deleteLoading ? "Deleting…" : "Delete"}
          </button>
          <button onClick={onDeleteCancel} style={cancelBtnStyle}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          {revealedValue !== null ? (
            <>
              <ActionBtn onClick={onHide}>Hide</ActionBtn>
              <ActionBtn onClick={onEditStart}>Edit</ActionBtn>
            </>
          ) : (
            <ActionBtn onClick={onReveal} disabled={isRevealing}>
              {isRevealing ? "…" : "Reveal"}
            </ActionBtn>
          )}
          <ActionBtn onClick={onDeleteRequest} danger>Delete</ActionBtn>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick,
  children,
  disabled,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: `1px solid ${danger ? "#7F1D1D" : "#2A2F42"}`,
        borderRadius: 6,
        padding: "4px 10px",
        color: danger ? "#EF4444" : "#8B90A8",
        fontSize: 12,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function EnvDot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

const inputStyle: React.CSSProperties = {
  background: "#1C2030",
  border: "1px solid #2A2F42",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#F0F2F8",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

const primaryBtnStyle: React.CSSProperties = {
  background: "#6366F1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #2A2F42",
  borderRadius: 8,
  padding: "7px 14px",
  color: "#8B90A8",
  fontSize: 13,
  cursor: "pointer",
};
