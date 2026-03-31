import Navbar from "@/components/Navbar";

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen pb-20">
        <section className="w-full pt-16 pb-12 px-4 text-center bg-brand-coral/5 border-b border-brand-coral/10 mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-brand-blue mb-4">
            Informations <span className="text-brand-coral">Légales</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Mentions légales et politique de confidentialité de Demaa.fr
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-4 prose prose-slate">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-blue mb-4">1. Édition du site</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site Demaa.fr est édité par l'entreprise Demaa, dont le siège social est situé en France. 
              Pour toute question, vous pouvez nous contacter via notre interface de consultation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-blue mb-4">2. Hébergement</h2>
            <p className="text-gray-600 leading-relaxed">
              Le site est hébergé par Vercel Inc., situé au 340 S Lemon Ave #1135 Walnut, CA 91789, USA.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-blue mb-4">3. Propriété intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              L'ensemble du contenu (textes, images, structure) de ce site est la propriété exclusive de Demaa, sauf mention contraire. 
              Toute reproduction est interdite sans accord préalable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-brand-blue mb-4">4. Protection des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Demaa s'engage à ce que la collecte et le traitement de vos données soient conformes au RGPD. 
              Les informations collectées via nos formulaires (Prénom, Email, Téléphone) sont uniquement utilisées pour répondre à vos demandes de services.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
