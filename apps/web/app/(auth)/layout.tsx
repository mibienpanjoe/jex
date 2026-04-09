export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "#0D0F14", minHeight: "100vh" }}
      className="flex items-center justify-center"
    >
      {children}
    </div>
  );
}
