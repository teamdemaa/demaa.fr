type NumberedSectionHeadingProps = Readonly<{
  id: string;
  number: number;
  title: string;
}>;

export default function NumberedSectionHeading({
  id,
  number,
  title,
}: NumberedSectionHeadingProps) {
  return (
    <div className="flex items-start gap-4 sm:gap-5">
      <span className="mt-1 shrink-0 font-serif text-lg text-dema-forest/60" aria-hidden="true">
        {String(number).padStart(2, "0")}
      </span>
      <h2 id={id} className="text-2xl font-semibold tracking-[-0.025em] text-[#25352C] sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
