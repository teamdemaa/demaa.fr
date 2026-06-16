type DemaaWordmarkProps = {
  className?: string;
  colorClassName?: string;
};

export default function DemaaWordmark({
  className = "",
  colorClassName = "text-dema-forest",
}: DemaaWordmarkProps) {
  return (
    <span
      className={`demaa-brand-logo inline-flex items-center leading-none tracking-tight ${colorClassName} ${className}`.trim()}
    >
      Demaa
    </span>
  );
}
