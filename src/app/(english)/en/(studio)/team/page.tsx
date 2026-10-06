import Navbar from "@/components/Navbar";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Our team | DEMAA",
  description: "Two founders with complementary backgrounds, and a trusted team we’ve worked with for many years.",
  path: "/en/team",
});

export default function TeamPage() {
  return <>
    <Navbar localeCode="en" publicNavigationActiveView="none" />
    <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <header className="pb-12 pt-12 text-center md:pt-16">
        <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
          <span className="demaa-hero-title block text-dema-forest">Our team.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-dema-muted">We’ve worked with the same trusted team for many years. That lasting relationship gives us a shared understanding of the markets we work in and how we build together.</p>
      </header>
      <section className="py-8" aria-labelledby="founders-title">
        <h2 id="founders-title" className="demaa-section-title text-3xl sm:text-4xl">Two founders. Complementary experience.</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Aïssata Gory</h3><p className="mt-2 text-sm text-dema-forest">Finance & management</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">A finance director and entrepreneur, Aïssata brings experience in financial management and accounting, including roles at CBRE and Transdev.</p></article>
          <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Oumou Gory</h3><p className="mt-2 text-sm text-dema-forest">Business development & operations</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">Oumou specialises in launching and structuring ventures. She previously served as Country Manager at Heetch and as a senior consultant at Deloitte and PwC.</p></article>
        </div>
      </section>
    </main>
  </>;
}
