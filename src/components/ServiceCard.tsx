import Link from "next/link";
import { ServiceRecord } from "@/lib/data";
import * as Icons from "lucide-react";

export default function ServiceCard({ 
  service, 
  fullWidth = false,
  baseUrl = "/services"
}: { 
  service: ServiceRecord, 
  fullWidth?: boolean,
  baseUrl?: string
}) {
  // Try to find the icon from lucide-react dynamically, or fallback to 'Box'
  // @ts-ignore
  const IconComponent = Icons[service.icon] || Icons.Box;

  const widthClasses = fullWidth 
    ? "w-full" 
    : "flex-none w-[85vw] md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1rem)] snap-always snap-center md:snap-start";

  const isService = baseUrl === "/services";
  
  return (
    <Link href={`${baseUrl}/${service.slug}`} className={`block group ${widthClasses}`}>
      <div className="w-full h-full min-h-[300px] bg-white rounded-[1.5rem] border border-gray-100 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_45px_rgb(0,0,0,0.08)] transition-all duration-300 transform group-hover:-translate-y-1 overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full blur-2xl -mt-8 -mr-8 transition-opacity opacity-0 group-hover:opacity-100"></div>

        {/* Improved Trust Badge for Services */}
        {isService && (
          <div className="absolute top-5 right-5 flex items-center space-x-1.5 px-3 py-1 bg-brand-coral/10 rounded-full border border-brand-coral/15 animate-in fade-in zoom-in duration-500">
             <Icons.ShieldCheck className="w-3 h-3 text-brand-coral mb-0.5" />
             <span className="text-[10px] font-bold text-brand-coral tracking-tight whitespace-nowrap">
               Approuvé par Demaa
             </span>
          </div>
        )}

        <div>
          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-brand-coral/10 transition-colors">
            <IconComponent className="w-5 h-5 text-brand-blue group-hover:text-brand-coral transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-coral transition-colors leading-tight mb-2">
            {service.name}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3 mt-4">
            {service.description}
          </p>
          {service.price && (
            <p className="font-bold text-brand-blue text-sm">
              {service.price}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 bg-brand-blue/5 text-brand-blue/60 text-[11px] font-medium tracking-wide rounded-full">
            {service.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
