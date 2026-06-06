"use client";

import { useTranslations } from "next-intl";

export function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const t = useTranslations("dashboard.common");

  return (
    <div
      style={{
        border: "1px solid #7F1D1D",
        background: "#1F1215",
        borderRadius: 12,
        padding: "28px 32px",
        color: "#FCA5A5",
      }}
    >
      <p style={{ fontSize: 14, margin: "0 0 16px" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          background: "#EF4444",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 18px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {t("retry")}
      </button>
    </div>
  );
}
