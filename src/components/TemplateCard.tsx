import { TemplateRecord } from "@/lib/templates";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function TemplateCard({ 
  template 
}: { 
  template: TemplateRecord 
}) {
  return (
    <a 
      href={template.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block group w-full"
    >
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-700 ease-in-out transform group-hover:-translate-y-2 h-full flex flex-col">
        
        {/* Image Preview Container */}
        <div className="relative aspect-video overflow-hidden bg-gray-50 border-b border-gray-100">
          <img 
            src={template.image} 
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-300" />
          
          {/* External Link Indicator */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <svg className="w-3.5 h-3.5 text-brand-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <span className="px-2.5 py-0.5 bg-brand-coral/5 text-brand-coral text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-coral/10">
              {template.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-coral transition-colors mb-2 leading-tight">
            {template.name}
          </h3>
          
          <p className="text-gray-400 text-[13px] leading-relaxed italic line-clamp-2">
            "{template.shortDescription}"
          </p>

          <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest group-hover:text-brand-coral transition-colors flex items-center gap-2">
              Accéder <ArrowRight className="w-3 h-3" />
            </span>
            <div className="w-7 h-7 rounded-full bg-brand-blue/5 flex items-center justify-center group-hover:bg-brand-coral/10 transition-colors">
               <ChevronRight className="w-3.5 h-3.5 text-brand-blue group-hover:text-brand-coral" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
