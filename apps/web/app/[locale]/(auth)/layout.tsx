import { LanguageToggle } from "../_components/LanguageToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "#0D0F14", minHeight: "100vh" }}
      className="relative flex items-center justify-center"
    >
      <div className="absolute right-6 top-6">
        <LanguageToggle />
      </div>
      {children}
    </div>
  );
}
