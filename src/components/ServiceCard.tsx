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

  return (
    <Link href={`${baseUrl}/${service.slug}`} className={`block group ${widthClasses}`}>
      <div className="w-full h-full min-h-[300px] bg-white rounded-[1.5rem] border border-gray-100 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_45px_rgb(0,0,0,0.08)] transition-all duration-300 transform group-hover:-translate-y-1 overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full blur-2xl -mt-8 -mr-8 transition-opacity opacity-0 group-hover:opacity-100"></div>

        <div>
          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-brand-coral/10 transition-colors">
            <IconComponent className="w-5 h-5 text-brand-blue group-hover:text-brand-coral transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-coral transition-colors leading-tight mb-2">
            {service.name}
          </h3>
          <p className="text-brand-coral text-xs font-bold mb-2 uppercase tracking-wide">
            {service.category}
          </p>
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
            {service.description}
          </p>
          {service.price && (
            <p className="font-bold text-brand-blue text-sm">
              {service.price}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {service.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-tight rounded-full border border-gray-100">
              {tag}
            </span>
          ))}
          {service.tags.length > 2 && (
             <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full border border-gray-100">
               +{service.tags.length - 2}
             </span>
          )}
        </div>
      </div>
    </Link>
  );
}
