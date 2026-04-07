import Navbar from "@/components/Navbar";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata = {
  title: "Newsletter - Demaa",
  description:
    "Inscrivez-vous à la newsletter Demaa pour recevoir des idées simples d'automatisation adaptées aux petites entreprises.",
};

export default function NewsletterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F8] px-4 py-16 md:py-24">
        <section className="mx-auto w-[70%] max-w-xl rounded-[2.5rem] border border-brand-blue/10 bg-[#FFF3EF] px-6 py-12 text-center shadow-[0_18px_60px_rgba(25,27,48,0.04)] md:w-full md:px-10 md:py-16">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-coral">
            Newsletter
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-brand-blue/65 md:text-base">
            Recevez des exemples concrets, des outils utiles et des pistes adaptées à votre secteur d&apos;activité.
          </p>

          <NewsletterForm />
        </section>
      </main>
    </>
  );
}
