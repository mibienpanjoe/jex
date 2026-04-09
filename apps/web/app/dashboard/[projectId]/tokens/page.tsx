"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Project, Env, CICDToken } from "@/lib/api";

const ENV_COLORS: Record<string, string> = {
  prod: "#EF4444",
  staging: "#F59E0B",
  dev: "#22C55E",
};

export default function TokensPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [tokens, setTokens] = useState<CICDToken[]>([]);
  const [loading, setLoading] = useState(true);

  // New token modal
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEnv, setNewEnv] = useState("");
  const [newError, setNewError] = useState<string | null>(null);
  const [newLoading, setNewLoading] = useState(false);

  // One-time reveal after creation
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [proj, environments, tokenList] = await Promise.all([
          api.projects.get(projectId),
          api.envs.list(projectId),
          api.tokens.list(projectId),
        ]);
        setProject(proj);
        setEnvs(environments);
        setNewEnv(environments[0]?.name ?? "");
        setTokens(tokenList);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEnv) return;
    setNewError(null);
    setNewLoading(true);
    try {
      const { token, meta } = await api.tokens.create(projectId, newName.trim(), newEnv);
      setTokens((prev) => [meta, ...prev]);
      setCreatedToken(token);
      setShowNew(false);
      setNewName("");
    } catch (err: any) {
      setNewError(err.message ?? "Failed to create token");
    } finally {
      setNewLoading(false);
    }
  }

  async function handleRevoke(tokenId: string) {
    setRevokeLoading(true);
    try {
      await api.tokens.revoke(projectId, tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      setRevokeTarget(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to revoke token");
    } finally {
      setRevokeLoading(false);
    }
  }

  function handleCopy() {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <span style={{ fontWeight: 600, fontSize: 14 }}>CI/CD tokens</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* One-time reveal box */}
        {createdToken && (
          <div style={{
            background: "#0F1E0F",
            border: "1px solid #22C55E",
            borderRadius: 10,
            padding: "20px 24px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#22C55E" }}>Token created — copy it now</span>
              <button
                onClick={() => setCreatedToken(null)}
                style={{ background: "transparent", border: "none", color: "#555A70", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <p style={{ color: "#8B90A8", fontSize: 12, margin: "0 0 12px" }}>
              This token will not be shown again. Store it in a safe place.
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <code style={{
                flex: 1,
                background: "#141720",
                border: "1px solid #2A2F42",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#F0F2F8",
                wordBreak: "break-all",
                fontFamily: "monospace",
              }}>
                {createdToken}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "#22C55E" : "#6366F1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ color: "#8B90A8", fontSize: 13 }}>{tokens.length} active token{tokens.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => setShowNew(true)}
            style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + New token
          </button>
        </div>

        {/* Token table */}
        {tokens.length === 0 ? (
          <div style={{ border: "1px dashed #2A2F42", borderRadius: 10, padding: "48px 32px", textAlign: "center", color: "#555A70" }}>
            <p style={{ fontSize: 14 }}>No active CI/CD tokens.</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Create a token to use in your CI pipeline.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {tokens.map((token) => {
              const envColor = ENV_COLORS[token.scopedEnv] ?? "#6366F1";
              return (
                <div
                  key={token.id}
                  style={{ background: "#141720", border: "1px solid #1F2336", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}
                >
                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#F0F2F8" }}>{token.name}</div>
                    <div style={{ fontSize: 12, color: "#555A70", marginTop: 2 }}>
                      Created {new Date(token.createdAt).toLocaleDateString()}
                      {token.lastUsedAt && ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>

                  {/* Scoped env badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: envColor,
                    background: `${envColor}1A`, border: `1px solid ${envColor}33`,
                    borderRadius: 5, padding: "2px 8px",
                  }}>
                    {token.scopedEnv}
                  </span>

                  {/* Revoke */}
                  {revokeTarget === token.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#EF4444", fontSize: 12 }}>Revoke?</span>
                      <button
                        onClick={() => handleRevoke(token.id)}
                        disabled={revokeLoading}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                      >
                        {revokeLoading ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={() => setRevokeTarget(null)}
                        style={{ background: "transparent", border: "1px solid #2A2F42", borderRadius: 6, padding: "4px 10px", color: "#8B90A8", fontSize: 12, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeTarget(token.id)}
                      style={{ background: "transparent", border: "1px solid #7F1D1D", borderRadius: 6, padding: "4px 10px", color: "#EF4444", fontSize: 12, cursor: "pointer" }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New token modal */}
      {showNew && (
        <div
          onClick={() => setShowNew(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#141720", border: "1px solid #2A2F42", borderRadius: 12, padding: "32px 28px", width: 400 }}
          >
            <h2 style={{ color: "#F0F2F8", fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>New CI/CD token</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>Token name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  placeholder="github-actions-prod"
                  style={{ background: "#1C2030", border: "1px solid #2A2F42", borderRadius: 8, padding: "9px 12px", color: "#F0F2F8", fontSize: 14, outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>Scoped environment</label>
                <select
                  value={newEnv}
                  onChange={(e) => setNewEnv(e.target.value)}
                  style={{ background: "#1C2030", border: "1px solid #2A2F42", borderRadius: 8, padding: "9px 12px", color: "#F0F2F8", fontSize: 14, outline: "none" }}
                >
                  {envs.map((env) => <option key={env.name} value={env.name}>{env.name}</option>)}
                </select>
              </div>
              {newError && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{newError}</p>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => { setShowNew(false); setNewError(null); }} style={{ background: "transparent", border: "1px solid #2A2F42", borderRadius: 8, padding: "8px 16px", color: "#8B90A8", fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={newLoading || !newName.trim()} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: newLoading ? "not-allowed" : "pointer" }}>
                  {newLoading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
