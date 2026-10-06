import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto w-full max-w-4xl px-5 py-20"><h1 className="demaa-section-title text-5xl">Page not found.</h1><p className="mt-6 text-lg text-dema-muted">This page isn’t available. Explore our latest insights or return to the Studio.</p><Link href="/en/insights" className="mt-8 inline-block underline underline-offset-4">Explore our insights</Link></main>;
}
