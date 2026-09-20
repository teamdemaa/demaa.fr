import SiniFooter from "@/components/SiniFooter";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <SiniFooter />
    </>
  );
}
