import Image from "next/image";
import { englishLandscape } from "@/lib/english-learning-series";
type Photo = { image: string; imageCaption?: string; imageSource?: string | null; imageCredit?: string; imageProvider?: string; imageLicense?: string | null };
export default function EnglishLandscape({ photo }: { photo: Photo }) {
  const p = englishLandscape(photo);
  return <figure className="mt-8"><div className="relative aspect-video overflow-hidden rounded-2xl">
    <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 896px) 856px, 100vw" className="object-cover" />
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-right text-xs text-white/50">{p.imageCaption}</span>
  </div>{p.imageSource && <figcaption className="mt-3 text-xs text-dema-muted"><a href={p.imageSource} target="_blank" rel="noopener noreferrer" className="underline">Photo: {p.imageCredit} · {p.imageProvider}</a>{p.imageLicense && <> · <a href={p.imageLicense} className="underline">CC BY 2.0</a> · Cropped</>}</figcaption>}</figure>;
}
