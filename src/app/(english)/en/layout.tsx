import Script from "next/script";
import DocumentLocale from "@/components/DocumentLocale";

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="demaa-english-document-locale" strategy="beforeInteractive">
        {`document.documentElement.lang="en";`}
      </Script>
      <DocumentLocale localeCode="en" />
      {children}
    </>
  );
}
