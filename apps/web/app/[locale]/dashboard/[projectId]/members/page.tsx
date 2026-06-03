"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api, Project, Member } from "@/lib/api";
import { withLocale } from "@/lib/i18n-path";

const ROLE_COLORS: Record<string, string> = {
  Owner: "#6366F1",
  Developer: "#22C55E",
  ReadOnly: "#8B90A8",
};

const ROLES = ["Owner", "Developer", "ReadOnly"] as const;

export default function MembersPage() {
  const locale = useLocale();
  const common = useTranslations("dashboard.common");
  const projectT = useTranslations("dashboard.project");
  const t = useTranslations("dashboard.members");
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string | null>(null);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Owner" | "Developer" | "ReadOnly">("Developer");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Role change
  const [roleChanging, setRoleChanging] = useState<Record<string, boolean>>({});

  // Remove
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [proj, memberList] = await Promise.all([
          api.projects.get(projectId),
          api.members.list(projectId),
        ]);
        setProject(proj);
        setMembers(memberList);
        setMyRole(proj.role);
      } catch {
        router.push(withLocale("/dashboard", locale));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale, projectId, router]);

  const isOwner = myRole === "Owner";
  const ownerCount = members.filter((m) => m.role === "Owner").length;

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviteLoading(true);
    try {
      const member = await api.members.invite(projectId, inviteEmail.trim(), inviteRole);
      setMembers((prev) => [...prev, member]);
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("Developer");
    } catch (err: any) {
      const code = err?.body?.error ?? err.message;
      if (code === "USER_NOT_FOUND") setInviteError(t("userNotFound"));
      else if (code === "ALREADY_MEMBER") setInviteError(t("alreadyMember"));
      else setInviteError(err.message ?? t("inviteError"));
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setRoleChanging((r) => ({ ...r, [userId]: true }));
    try {
      const updated = await api.members.updateRole(projectId, userId, role);
      setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role: updated.role } : m)));
    } catch (err: any) {
      alert(err?.body?.error === "LAST_OWNER" ? t("cannotDemoteLastOwner") : err.message);
    } finally {
      setRoleChanging((r) => ({ ...r, [userId]: false }));
    }
  }

  async function handleRemove(userId: string) {
    setRemoveLoading(true);
    try {
      await api.members.remove(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setRemoveTarget(null);
    } catch (err: any) {
      alert(err?.body?.error === "LAST_OWNER" ? t("cannotRemoveLastOwner") : err.message);
    } finally {
      setRemoveLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555A70", fontFamily: "Inter, system-ui, sans-serif" }}>
        {common("loading")}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ background: "#0D0F14", minHeight: "100vh", color: "#F0F2F8", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1F2336", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href={withLocale("/dashboard", locale)} style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>{projectT("projects")}</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <Link href={withLocale(`/dashboard/${projectId}`, locale)} style={{ color: "#8B90A8", fontSize: 14, textDecoration: "none" }}>{project.name}</Link>
        <span style={{ color: "#2A2F42" }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{t("title")}</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ color: "#8B90A8", fontSize: 13 }}>{t("count", { count: members.length })}</span>
          {isOwner && (
            <button
              onClick={() => setShowInvite(true)}
              style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              + {t("invite")}
            </button>
          )}
        </div>

        {/* Members table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {members.map((member) => {
            const isLastOwner = member.role === "Owner" && ownerCount <= 1;
            return (
              <div
                key={member.userId}
                style={{ background: "#141720", border: "1px solid #1F2336", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: "#2A2F42",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: "#8B90A8", flexShrink: 0,
                }}>
                  {member.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + email */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#F0F2F8" }}>{member.user.name}</div>
                  <div style={{ fontSize: 12, color: "#555A70", marginTop: 1 }}>{member.user.email}</div>
                </div>

                {/* Role — dropdown for owners, badge for others */}
                {isOwner && !isLastOwner ? (
                  <select
                    value={member.role}
                    disabled={roleChanging[member.userId]}
                    onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                    style={{
                      background: "#1C2030",
                      border: `1px solid ${ROLE_COLORS[member.role] ?? "#2A2F42"}`,
                      borderRadius: 6,
                      padding: "4px 10px",
                      color: ROLE_COLORS[member.role] ?? "#8B90A8",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                  </select>
                ) : (
                  <RoleBadge role={member.role} />
                )}

                {/* Remove */}
                {isOwner && (
                  removeTarget === member.userId ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#EF4444", fontSize: 12 }}>{t("confirmRemove")}</span>
                      <button
                        onClick={() => handleRemove(member.userId)}
                        disabled={removeLoading}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                      >
                        {removeLoading ? "..." : common("yes")}
                      </button>
                      <button
                        onClick={() => setRemoveTarget(null)}
                        style={{ background: "transparent", border: "1px solid #2A2F42", borderRadius: 6, padding: "4px 10px", color: "#8B90A8", fontSize: 12, cursor: "pointer" }}
                      >
                        {common("cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => !isLastOwner && setRemoveTarget(member.userId)}
                      title={isLastOwner ? t("cannotRemoveLastOwner") : undefined}
                      style={{
                        background: "transparent",
                        border: "1px solid #2A2F42",
                        borderRadius: 6,
                        padding: "4px 10px",
                        color: isLastOwner ? "#2A2F42" : "#8B90A8",
                        fontSize: 12,
                        cursor: isLastOwner ? "not-allowed" : "pointer",
                      }}
                    >
                      {common("remove")}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div
          onClick={() => setShowInvite(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#141720", border: "1px solid #2A2F42", borderRadius: 12, padding: "32px 28px", width: 400 }}
          >
            <h2 style={{ color: "#F0F2F8", fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>{t("modalTitle")}</h2>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>{t("email")}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  autoFocus
                  placeholder="teammate@example.com"
                  style={{ background: "#1C2030", border: "1px solid #2A2F42", borderRadius: 8, padding: "9px 12px", color: "#F0F2F8", fontSize: 14, outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>{t("role")}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  style={{ background: "#1C2030", border: "1px solid #2A2F42", borderRadius: 8, padding: "9px 12px", color: "#F0F2F8", fontSize: 14, outline: "none" }}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                </select>
              </div>
              {inviteError && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{inviteError}</p>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => { setShowInvite(false); setInviteError(null); }} style={{ background: "transparent", border: "1px solid #2A2F42", borderRadius: 8, padding: "8px 16px", color: "#8B90A8", fontSize: 14, cursor: "pointer" }}>
                  {common("cancel")}
                </button>
                <button type="submit" disabled={inviteLoading || !inviteEmail.trim()} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: inviteLoading ? "not-allowed" : "pointer" }}>
                  {inviteLoading ? t("inviting") : t("invite")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations("dashboard.members");
  const color = ROLE_COLORS[role] ?? "#8B90A8";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: "#1C2030", border: `1px solid ${color}`, borderRadius: 5, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {role === "Owner" || role === "Developer" || role === "ReadOnly" ? t(`roles.${role}`) : role}
    </span>
  );
}
