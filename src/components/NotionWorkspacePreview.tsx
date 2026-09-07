import { BarChart3, BookOpenText, CalendarDays, CheckSquare2, Compass, Settings2 } from "lucide-react";

const workspaceSections = [
  { label: "Pilotage", Icon: Compass },
  { label: "Tâches en cours", Icon: CheckSquare2 },
  { label: "Réunions", Icon: CalendarDays },
  { label: "Comment on travaille", Icon: BookOpenText },
] as const;

export default function NotionWorkspacePreview() {
  return (
    <div className="h-full p-5 text-[#37352f] sm:p-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-black/10 bg-white px-5 py-7 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:px-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🏢</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/45">Modèle Notion</p>
            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">Mon entreprise</h2>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {workspaceSections.map(({ label, Icon }) => (
            <div key={label} className="flex min-h-20 items-center gap-3 rounded-lg border border-black/10 bg-[#fbfbfa] p-4">
              <Icon className="h-5 w-5 shrink-0 text-black/55" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-lg bg-[#edf3ec] p-4 text-sm">
          <BarChart3 className="h-5 w-5 shrink-0 text-[#4d7552]" aria-hidden="true" />
          <span>Objectifs, indicateurs, décisions et prochaines tâches reliés.</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-black/45">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          Six bases canoniques, sans double saisie.
        </div>
      </div>
    </div>
  );
}
