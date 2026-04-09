export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="light" className="min-h-screen bg-[#FAFAFA] text-[#111318]">
      {children}
    </div>
  );
}
