"use client";

export default function TagFilters({
  tags,
  selectedTag,
  onSelectTag
}: {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}) {
  return (
    <div className="w-full bg-brand-coral/5 backdrop-blur-md sticky top-20 z-40 border-b border-brand-coral/10 py-3">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="flex overflow-x-auto space-x-3 pb-2 pt-2 no-scrollbar items-center">
          <button 
            onClick={() => onSelectTag(null)}
            className={`whitespace-nowrap rounded-full px-5 py-2 font-medium transition-all ${
              selectedTag === null ? "bg-brand-blue text-white shadow-md scale-105" : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`whitespace-nowrap rounded-full px-5 py-2 font-medium transition-all ${
                selectedTag === tag ? "bg-brand-blue text-white shadow-md scale-105" : "bg-gray-100/80 text-gray-600 hover:bg-gray-200 hover:text-brand-blue"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
