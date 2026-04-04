import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/data";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import * as Icons from "lucide-react";
import OrderModal from "@/components/OrderModal";

import Link from "next/link";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const service = await getServiceBySlug(params.slug);
  
  if (!service) return { title: "Service introuvable - Demaa" };

  return {
    title: `${service.name} - Demaa`,
    description: service.description,
    openGraph: {
      title: `${service.name} | Outils & Services Demaa`,
      description: service.description,
    }
  };
}

export default async function ServiceDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const service = await getServiceBySlug(params.slug);
  
  if (!service) {
    notFound();
  }

  // @ts-ignore
  const IconComponent = Icons[service.icon] || Icons.Box;

  return (
    <>
      <Navbar minimal={true} />
      <main className="flex-1 w-full bg-background min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Back Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand-coral transition-colors mb-8 group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Hub de ressources
          </Link>
          
          {/* Header Section */}
          <div className="flex flex-col mb-10 pb-10 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                <IconComponent className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-sm font-semibold text-brand-coral uppercase tracking-wider bg-brand-coral/10 px-3 py-1 rounded-full">
                {service.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-blue mb-4 leading-tight">
              {service.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-brand-coral">
              {service.shortDescription}
            </p>
          </div>

          {/* Details Section (Airbnb Style Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Content */}
            <div className="md:col-span-2 space-y-10">
              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-6">À propos de ce service</h2>
                <div className="prose text-gray-600 leading-relaxed text-lg">
                  <p>
                    {service.description}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-blue mb-4">Mots-clés associés</h2>
                <div className="flex flex-wrap gap-3">
                  {service.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-gray-50 text-brand-blue border border-gray-100 text-sm font-medium rounded-2xl">
                        {tag}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sticky CTA */}
            <div className="md:col-span-1">
              <div className="sticky top-28 bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                 {service.price && (
                   <div className="mb-6 pb-6 border-b border-gray-100">
                     <span className="text-3xl font-bold text-brand-blue">{service.price}</span>
                   </div>
                 )}
                 <h3 className="text-xl font-semibold text-brand-blue mb-2">Prêt à démarrer ?</h3>
                 <p className="text-gray-500 text-sm mb-6">Passez à l'étape supérieure en commandant ce service directement.</p>
                 
                 <OrderModal serviceName={service.name} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
