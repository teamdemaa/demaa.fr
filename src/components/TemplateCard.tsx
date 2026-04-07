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
          
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <span className="px-2.5 py-0.5 bg-[#FFF3EF] text-brand-coral text-[9px] font-bold uppercase tracking-widest rounded-full border border-brand-coral/10">
              {template.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-coral transition-colors mb-2 leading-tight">
            {template.name}
          </h3>
          
          <p className="text-gray-400 text-[13px] leading-relaxed italic line-clamp-2">
            "{template.shortDescription}"
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-blue/40 uppercase tracking-widest group-hover:text-brand-coral transition-colors">
              Modèle gratuit
            </span>
            <div className="w-10 h-10 rounded-full bg-brand-blue/5 flex items-center justify-center group-hover:bg-brand-coral group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-brand-coral/20">
               <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
