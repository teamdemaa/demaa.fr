type DemaaWordmarkProps = {
  className?: string;
  colorClassName?: string;
};

export default function DemaaWordmark({
  className = "",
  colorClassName = "text-brand-blue/86",
}: DemaaWordmarkProps) {
  return (
    <span
      className={`demaa-brand-logo inline-flex items-center leading-none tracking-tight ${colorClassName} ${className}`.trim()}
    >
      Demaa
    </span>
  );
}
