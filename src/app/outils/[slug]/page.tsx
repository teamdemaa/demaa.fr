import { Metadata } from "next";
import Navbar from "@/components/Navbar";

// Function to reverse engineering the slug into a human readable title
function formatSlugToTitle(slug: string) {
  const text = slug.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const title = formatSlugToTitle(params.slug);
  
  return {
    title: `${title} | Demaa Outils`,
    description: `Découvrez et utilisez notre outil gratuit : ${title}. Une solution minimaliste et ultra-rapide pour vous faire gagner du temps.`,
    openGraph: {
      title: `${title} | Demaa Outils`,
      description: `Découvrez et utilisez notre outil gratuit : ${title}.`,
    }
  };
}

export default async function OutilPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const title = formatSlugToTitle(params.slug);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-brand-coral/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
             <span className="text-4xl">🛠️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed font-light">
            Cet outil exclusif est actuellement en pleine finalisation technique. Une fois mis en ligne, vous pourrez l'utiliser gratuitement pour simplifier votre quotidien sur Demaa !
          </p>
          <button className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-medium hover:bg-brand-coral transition-colors shadow-md transform hover:scale-105">
            Être notifié du lancement
          </button>
        </div>
      </main>
    </>
  );
}
