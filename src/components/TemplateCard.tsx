import { TemplateRecord } from "@/lib/templates";

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
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_45px_rgb(0,0,0,0.08)] transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col">
        
        {/* Image Preview Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100">
          <img 
            src={template.image} 
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-300" />
          
          {/* External Link Indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <svg className="w-4 h-4 text-brand-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <div className="mb-4">
            <span className="px-3 py-1 bg-brand-coral/5 text-brand-coral text-[10px] font-bold uppercase tracking-widest rounded-full">
              {template.category}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-brand-blue group-hover:text-brand-coral transition-colors mb-3 leading-tight">
            {template.name}
          </h3>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6 italic">
            "{template.shortDescription}"
          </p>
          
          <p className="text-gray-600 text-sm leading-relaxed flex-1">
            {template.description}
          </p>

          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-widest group-hover:text-brand-coral transition-colors">
              Accéder au modèle
            </span>
            <div className="w-8 h-8 rounded-full bg-brand-blue/5 flex items-center justify-center group-hover:bg-brand-coral/10 transition-colors">
              <svg className="w-4 h-4 text-brand-blue group-hover:text-brand-coral transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
