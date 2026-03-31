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
    : "flex-none w-[85vw] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] snap-always snap-center md:snap-start";

  return (
    <Link href={`${baseUrl}/${service.slug}`} className={`block group ${widthClasses}`}>
      <div className="w-full h-full min-h-[340px] bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_45px_rgb(0,0,0,0.08)] transition-all duration-300 transform group-hover:-translate-y-1 overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-coral/5 rounded-full blur-2xl -mt-10 -mr-10 transition-opacity opacity-0 group-hover:opacity-100"></div>

        <div>
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand-coral/10 transition-colors">
            <IconComponent className="w-6 h-6 text-brand-blue group-hover:text-brand-coral transition-colors" />
          </div>
          <h3 className="text-2xl font-semibold text-brand-blue group-hover:text-brand-coral transition-colors leading-tight mb-3">
            {service.name}
          </h3>
          <p className="text-brand-blue text-base font-medium mb-2 line-clamp-1">
            {service.shortDescription}
          </p>
          <p className="text-gray-500 text-base line-clamp-2 leading-relaxed mb-4">
            {service.description}
          </p>
          {service.price && (
            <p className="font-semibold text-brand-coral text-base">
              {service.price}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {service.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-500 text-sm font-medium rounded-full">
              {tag}
            </span>
          ))}
          {service.tags.length > 2 && (
             <span className="px-3 py-1.5 bg-gray-50 text-gray-500 text-sm font-medium rounded-full">
               +{service.tags.length - 2}
             </span>
          )}
        </div>
      </div>
    </Link>
  );
}
