import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  
  if (!post) return { title: "Article introuvable - Demaa" };

  return {
    title: `${post.title} | Demaa Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          
          <Link href="/blog" className="inline-flex items-center text-brand-blue hover:text-brand-coral font-medium mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux articles
          </Link>

          <header className="mb-12 border-b border-gray-100 pb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center text-sm font-medium text-brand-coral bg-brand-coral/10 w-fit px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4 mr-2" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </div>
          </header>

          {/* Simple custom styling replacing the need for @tailwindcss/typography */}
          <div className="[&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-gray-600 [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h2]:mt-12 [&>h2]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-600 [&>strong]:text-brand-blue [&>strong]:font-semibold [&_img]:rounded-3xl [&_img]:shadow-sm [&_img]:my-10 [&_img]:mx-auto [&_img]:max-w-full">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

        </article>
      </main>
    </>
  );
}
