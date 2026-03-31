import { getAllPosts } from "@/lib/blog";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conseils et Blog | Demaa",
  description: "Découvrez nos meilleurs conseils pour propulser votre entreprise.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <section className="w-full flex flex-col items-center justify-center pt-8 pb-8 md:pt-12 md:pb-10 px-4 text-center bg-brand-coral/5 border-b border-brand-coral/10 mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-brand-blue mb-4">
            Nos <span className="text-brand-coral">conseils</span> & astuces
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Des articles conçus pour vous aider à y voir plus clair dans la gestion de votre activité.
          </p>
        </section>

        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {posts.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                Aucun article publié pour le moment.
              </div>
            )}
            
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <article className="p-8 bg-white border border-gray-100 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all transform group-hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="pr-4">
                      <div className="flex items-center space-x-2 text-sm text-brand-coral font-medium mb-3">
                         <BookOpen className="w-4 h-4" />
                         <span>{new Date(post.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-brand-blue group-hover:text-brand-coral transition-colors mb-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 leading-relaxed max-w-2xl">
                        {post.description}
                      </p>
                    </div>
                    
                    <div className="hidden sm:flex w-12 h-12 rounded-full bg-gray-50 items-center justify-center text-brand-blue group-hover:bg-brand-coral/10 group-hover:text-brand-coral transition-colors shrink-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
