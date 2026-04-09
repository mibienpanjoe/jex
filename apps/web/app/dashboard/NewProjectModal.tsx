"use client";

import { useState, FormEvent } from "react";
import { api, Project } from "@/lib/api";

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function NewProjectModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const project = await api.projects.create(name.trim());
      onCreated(project);
    } catch (err: any) {
      setError(err.message ?? "Failed to create project");
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#141720",
          border: "1px solid #2A2F42",
          borderRadius: 12,
          padding: "32px 28px",
          width: 400,
        }}
      >
        <h2 style={{ color: "#F0F2F8", fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>
          New project
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="my-project"
              style={{
                background: "#1C2030",
                border: "1px solid #2A2F42",
                borderRadius: 8,
                padding: "9px 12px",
                color: "#F0F2F8",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {error && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #2A2F42",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#8B90A8",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                background: loading ? "#4F46E5" : "#6366F1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
