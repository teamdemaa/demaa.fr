"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckSquare2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  FileText,
  Filter,
  GraduationCap,
  Handshake,
  Landmark,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  Mail,
  PackageSearch,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import DemaaWordmark from "@/components/DemaaWordmark";
import type {
  CockpitActivity,
  CockpitKitCategory,
  CockpitPeriod,
  CockpitRemoteState,
  CockpitService,
  CockpitTask,
} from "@/lib/cockpit-types";

type CockpitTab = "tasks" | "kit" | "profile";
type CockpitStage = "activity" | "building" | "app";
type GroupMode = "period" | "pillar";
type TaskStatusFilter = "active" | "completed" | "all";

const ACTIVITY_STORAGE_KEY = "demaa-cockpit-activity";
const TASKS_STORAGE_PREFIX = "demaa-cockpit-tasks:";
const PENDING_TASK_STORAGE_KEY = "demaa-cockpit-pending-task";
const PENDING_SYNC_STORAGE_KEY = "demaa-cockpit-pending-sync";

function subscribeToMount() {
  return () => undefined;
}

const PERIOD_ORDER: CockpitPeriod[] = [
  "overdue",
  "today",
  "week",
  "later",
  "undated",
];

const PERIOD_LABELS: Record<CockpitPeriod, string> = {
  overdue: "En retard",
  today: "Aujourd’hui",
  week: "Cette semaine",
  later: "Plus tard",
  undated: "Sans date",
};

const KIT_CATEGORIES: CockpitKitCategory[] = [
  { id: "tools", label: "Outils", description: "Les logiciels utiles à votre activité.", href: "/annuaire-outils" },
  { id: "suppliers", label: "Fournisseurs", description: "Les partenaires et fournisseurs métier.", href: "/annuaire-fournisseurs" },
  { id: "finance", label: "Financement", description: "Financements, aides et solutions de trésorerie.", href: "/annuaire-financement" },
  { id: "recruitment", label: "Recrutement", description: "Les solutions pour renforcer votre équipe.", href: "/annuaire-recrutement" },
  { id: "training", label: "Formation", description: "Les formations adaptées à votre entreprise.", href: "/annuaire-formations" },
  { id: "network", label: "Réseau pro", description: "Les réseaux et relais professionnels.", href: "/annuaire-reseaux-pro" },
  { id: "documents", label: "Modèles de documents", description: "Modèles, procédures et checklists.", href: "/modeles-de-documents" },
  { id: "services", label: "Services", description: "Un accompagnement lorsque vous en avez besoin." },
];

const KIT_ICONS: Record<string, LucideIcon> = {
  tools: Wrench,
  suppliers: PackageSearch,
  finance: Landmark,
  recruitment: UsersRound,
  training: GraduationCap,
  network: Handshake,
  documents: FileText,
  services: LifeBuoy,
};

function getInitialTasks(activity: CockpitActivity): CockpitTask[] {
  return activity.tasks.map((task) => ({ ...task, completed: false }));
}

function mergeSavedTasks(
  activity: CockpitActivity,
  savedTasks: CockpitTask[],
): CockpitTask[] {
  const recommendedById = new Map(activity.tasks.map((task) => [task.id, task]));
  const savedById = new Map(savedTasks.map((task) => [task.id, task]));
  const recommended = activity.tasks.map((task) => ({
    ...task,
    completed: savedById.get(task.id)?.completed ?? false,
  }));
  const custom = savedTasks.filter(
    (task) => task.custom && !recommendedById.has(task.id),
  );

  return [...recommended, ...custom];
}

function readStoredTasks(activity: CockpitActivity): CockpitTask[] {
  if (typeof window === "undefined") return getInitialTasks(activity);

  try {
    const stored = window.localStorage.getItem(`${TASKS_STORAGE_PREFIX}${activity.slug}`);

    if (!stored) return getInitialTasks(activity);

    return mergeSavedTasks(activity, JSON.parse(stored) as CockpitTask[]);
  } catch {
    return getInitialTasks(activity);
  }
}

function saveStoredTasks(activitySlug: string, tasks: CockpitTask[]) {
  window.localStorage.setItem(
    `${TASKS_STORAGE_PREFIX}${activitySlug}`,
    JSON.stringify(tasks),
  );
}

async function syncRemoteState(activitySlug: string, tasks: CockpitTask[]) {
  const response = await fetch("/api/cockpit/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activitySlug, tasks }),
  });

  if (!response.ok) {
    throw new Error(`Cockpit sync failed with status ${response.status}.`);
  }
}

function queueRemoteState(activitySlug: string, tasks: CockpitTask[]) {
  window.localStorage.setItem(
    PENDING_SYNC_STORAGE_KEY,
    JSON.stringify({ activitySlug, tasks }),
  );
}

async function flushQueuedRemoteState() {
  const queuedState = window.localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
  if (!queuedState) return;

  try {
    const parsed = JSON.parse(queuedState) as {
      activitySlug?: unknown;
      tasks?: unknown;
    };

    if (typeof parsed.activitySlug !== "string" || !Array.isArray(parsed.tasks)) {
      window.localStorage.removeItem(PENDING_SYNC_STORAGE_KEY);
      return;
    }

    await syncRemoteState(parsed.activitySlug, parsed.tasks as CockpitTask[]);

    if (window.localStorage.getItem(PENDING_SYNC_STORAGE_KEY) === queuedState) {
      window.localStorage.removeItem(PENDING_SYNC_STORAGE_KEY);
    }
  } catch {
    // The local copy remains the source of truth until the connection comes back.
  }
}

function persistRemoteState(activitySlug: string, tasks: CockpitTask[]) {
  queueRemoteState(activitySlug, tasks);
  void flushQueuedRemoteState();
}

function DesktopHeader({
  activeTab,
  email,
  onTabChange,
}: {
  activeTab: CockpitTab;
  email: string | null;
  onTabChange: (tab: CockpitTab) => void;
}) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-dema-line/80 bg-dema-cream/92 backdrop-blur-xl md:block">
      <div className="relative mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-8 lg:px-12">
        <button
          type="button"
          className="inline-flex items-center"
          onClick={() => onTabChange("tasks")}
          aria-label="Aller aux tâches"
        >
          <DemaaWordmark className="text-[1.65rem] text-brand-blue/68" />
        </button>

        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-10" aria-label="Navigation principale">
          {([
            ["tasks", "Tâches"],
            ["kit", "Le Kit"],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`relative py-2 text-sm transition after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px ${
                activeTab === tab
                  ? "font-medium text-dema-forest after:bg-dema-forest"
                  : "text-brand-blue/55 after:bg-transparent hover:text-brand-blue"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
            activeTab === "profile"
              ? "border-dema-forest/25 bg-dema-sage text-dema-forest"
              : "border-dema-line bg-dema-paper text-brand-blue/55 hover:text-dema-forest"
          }`}
          aria-label={email ? "Ouvrir le profil" : "Se connecter"}
          title={email ? "Profil" : "Se connecter"}
        >
          <CircleUserRound className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function MobileNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: CockpitTab;
  onTabChange: (tab: CockpitTab) => void;
}) {
  const items: Array<[CockpitTab, string, LucideIcon]> = [
    ["tasks", "Tâches", CheckSquare2],
    ["kit", "Le Kit", BriefcaseBusiness],
    ["profile", "Profil", UserRound],
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-dema-line/80 bg-dema-paper/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {items.map(([tab, label, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] transition ${
              activeTab === tab ? "text-dema-forest" : "text-brand-blue/48"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            <span>{label}</span>
            <span
              className={`h-1 w-1 rounded-full ${activeTab === tab ? "bg-dema-forest" : "bg-transparent"}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </nav>
  );
}

function ActivitySelection({
  activities,
  onSelect,
}: {
  activities: CockpitActivity[];
  onSelect: (activity: CockpitActivity) => void;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    const visible = normalized
      ? activities.filter((activity) =>
          [activity.name, activity.sectorLabel, activity.description]
            .join(" ")
            .toLocaleLowerCase("fr")
            .includes(normalized),
        )
      : activities.filter((activity) =>
          ["cabinet-comptable", "btp", "restaurant", "e-commerce", "agence-web"].includes(activity.slug),
        );

    return visible.slice(0, 6);
  }, [activities, query]);

  return (
    <main className="flex min-h-[calc(100dvh-1px)] items-center bg-dema-cream px-4 py-12 text-brand-blue md:px-8">
      <section className="mx-auto w-full max-w-5xl -translate-y-[6%] text-center md:-translate-y-[10%]">
        <DemaaWordmark className="text-[1.8rem] text-brand-blue/50 md:text-[2.1rem]" />
        <h1 className="mx-auto mt-10 max-w-4xl text-4xl font-light leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
          Les tâches essentielles
          <span className="demaa-section-title mt-1 block text-dema-forest">
            pour faire avancer votre entreprise.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-dema-muted md:text-base">
          Choisissez votre activité. Demaa prépare votre base de tâches et rassemble les ressources utiles.
        </p>

        <div className="relative mx-auto mt-9 max-w-3xl text-left md:mt-12">
          <div className="demaa-search-shell p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Ex. BTP, restaurant, cabinet comptable..."
                className="w-full rounded-full bg-dema-paper py-5 pl-14 pr-6 text-base outline-none placeholder:text-brand-blue/30 md:py-6 md:pl-16 md:text-lg"
                aria-label="Rechercher votre activité"
              />
            </div>
          </div>

          {isFocused ? (
            <div className="absolute inset-x-0 z-20 mt-3 overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper p-2 shadow-[0_24px_58px_rgba(23,35,29,0.1)]">
              {suggestions.length ? (
                suggestions.map((activity) => (
                  <button
                    key={activity.slug}
                    type="button"
                    onClick={() => onSelect(activity)}
                    className="flex w-full items-center justify-between gap-4 rounded-[1rem] px-4 py-3.5 text-left transition hover:bg-dema-sage"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium md:text-base">{activity.name}</span>
                      <span className="mt-1 block truncate text-xs text-dema-muted md:text-sm">{activity.sectorLabel}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-dema-forest/45" aria-hidden="true" />
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-dema-muted">
                  Aucune activité trouvée. Essayez un terme plus large.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-xs text-brand-blue/42">Gratuit · Sans compte pour commencer</p>
      </section>
    </main>
  );
}

function BuildingSpace({ activity }: { activity: CockpitActivity }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-dema-cream px-5 text-center text-brand-blue">
      <section className="w-full max-w-md">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Sparkles className="h-6 w-6 animate-pulse" aria-hidden="true" />
        </span>
        <h1 className="demaa-section-title mt-7 text-4xl text-dema-forest md:text-5xl">
          Nous préparons votre espace…
        </h1>
        <p className="mt-4 text-sm leading-6 text-dema-muted">{activity.name}</p>
        <div className="mx-auto mt-8 max-w-xs space-y-3 text-left text-sm text-brand-blue/70">
          {["Vos tâches essentielles", "Les ressources adaptées", "Les outils et fournisseurs utiles"].map((label) => (
            <p key={label} className="flex items-center gap-3 rounded-full border border-dema-line bg-dema-paper px-4 py-3">
              <Check className="h-4 w-4 text-dema-forest" aria-hidden="true" />
              {label}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}

function TaskRow({ task, onToggle }: { task: CockpitTask; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-dema-line/80 px-1 py-4 last:border-b-0 md:gap-4 md:py-5">
      <button
        type="button"
        onClick={onToggle}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
          task.completed
            ? "border-dema-forest bg-dema-forest text-white"
            : "border-brand-blue/38 bg-transparent text-transparent hover:border-dema-forest"
        }`}
        aria-label={task.completed ? `Rouvrir ${task.title}` : `Terminer ${task.title}`}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] leading-6 md:text-base ${task.completed ? "text-brand-blue/38 line-through" : "text-brand-blue"}`}>
          {task.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-dema-sage px-2.5 py-1 text-[11px] text-dema-forest/78">{task.pillar}</span>
          <span className="rounded-full bg-dema-sage/70 px-2.5 py-1 text-[11px] text-brand-blue/52">{task.scheduleLabel}</span>
          {task.recurrence ? (
            <span className="rounded-full bg-dema-sage/70 px-2.5 py-1 text-[11px] text-brand-blue/52">{task.recurrence}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TasksView({
  activity,
  tasks,
  email,
  onTasksChange,
  onRequireAccount,
}: {
  activity: CockpitActivity;
  tasks: CockpitTask[];
  email: string | null;
  onTasksChange: (tasks: CockpitTask[]) => void;
  onRequireAccount: (taskTitle: string) => void;
}) {
  const [groupMode, setGroupMode] = useState<GroupMode>("period");
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<string | null>(null);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("active");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const pillars = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.pillar))),
    [tasks],
  );
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (pillarFilter && task.pillar !== pillarFilter) return false;
      if (recurringOnly && !task.recurrence) return false;
      if (statusFilter === "active" && task.completed) return false;
      if (statusFilter === "completed" && !task.completed) return false;
      return true;
    });
  }, [pillarFilter, recurringOnly, statusFilter, tasks]);
  const groups = useMemo(() => {
    if (groupMode === "period") {
      return PERIOD_ORDER.map((period) => ({
        key: period,
        label: PERIOD_LABELS[period],
        tasks: filteredTasks.filter((task) => task.period === period),
      })).filter((group) => group.tasks.length > 0);
    }

    return pillars.map((pillar) => ({
      key: pillar,
      label: pillar,
      tasks: filteredTasks.filter((task) => task.pillar === pillar),
    })).filter((group) => group.tasks.length > 0);
  }, [filteredTasks, groupMode, pillars]);
  const activeFilterCount = Number(Boolean(pillarFilter)) + Number(recurringOnly) + Number(statusFilter !== "active");

  function toggleTask(taskId: string) {
    onTasksChange(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();

    if (!title) return;

    if (!email) {
      onRequireAccount(title);
      return;
    }

    const customTask: CockpitTask = {
      id: `custom-${Date.now()}`,
      title,
      pillar: "Direction",
      period: "undated",
      scheduleLabel: "Sans date",
      completed: false,
      custom: true,
    };
    onTasksChange([...tasks, customTask]);
    setNewTaskTitle("");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-8 md:px-6 md:pb-20 md:pt-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="demaa-section-title text-5xl text-dema-forest md:text-6xl">Tâches</h1>
          <p className="mt-2 text-sm text-dema-muted">{activity.name} · {tasks.filter((task) => !task.completed).length} à suivre</p>
        </div>
      </div>

      <div className="relative mt-7 flex gap-2 border-b border-dema-line pb-5">
        <button
          type="button"
          onClick={() => setGroupMenuOpen((open) => !open)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 text-sm text-brand-blue/72"
        >
          <SlidersHorizontal className="h-4 w-4 text-dema-forest" aria-hidden="true" />
          Regrouper · {groupMode === "period" ? "Période" : "Catégorie"}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 text-sm text-brand-blue/72"
        >
          <Filter className="h-4 w-4 text-dema-forest" aria-hidden="true" />
          Filtrer{activeFilterCount ? ` · ${activeFilterCount}` : ""}
        </button>

        {groupMenuOpen ? (
          <div className="absolute left-0 top-12 z-20 w-56 rounded-2xl border border-dema-line bg-dema-paper p-2 shadow-[0_18px_46px_rgba(23,35,29,0.1)]">
            {([
              ["period", "Par période"],
              ["pillar", "Par catégorie"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setGroupMode(value);
                  setGroupMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${groupMode === value ? "bg-dema-sage text-dema-forest" : "text-brand-blue/66 hover:bg-dema-sage/60"}`}
              >
                {label}
                {groupMode === value ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        {groups.length ? groups.map((group) => (
          <section key={group.key} className="pt-7">
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">
              {group.label} · {group.tasks.length}
            </h2>
            <div className="mt-2">
              {group.tasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
              ))}
            </div>
          </section>
        )) : (
          <div className="py-16 text-center">
            <CheckSquare2 className="mx-auto h-8 w-8 text-dema-forest/35" aria-hidden="true" />
            <p className="mt-4 text-sm text-dema-muted">Aucune tâche ne correspond à ces filtres.</p>
          </div>
        )}
      </div>

      <form onSubmit={submitTask} className="mt-9 flex items-center gap-3 rounded-[1.25rem] border border-dema-line bg-dema-paper p-2 shadow-[0_10px_28px_rgba(23,35,29,0.035)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="Ajouter une tâche…"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-brand-blue/35 md:text-base"
          aria-label="Ajouter une tâche"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-dema-forest hover:text-white disabled:opacity-35"
          aria-label="Valider la tâche"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-blue/24 p-0 backdrop-blur-[2px] md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="task-filter-title">
          <div className="w-full max-w-lg rounded-t-[2rem] bg-dema-paper px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl md:rounded-[2rem] md:p-7">
            <div className="mx-auto h-1 w-12 rounded-full bg-brand-blue/18 md:hidden" />
            <div className="mt-4 flex items-center justify-between md:mt-0">
              <h2 id="task-filter-title" className="demaa-section-title text-3xl text-dema-forest">Filtrer les tâches</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue/55" aria-label="Fermer les filtres">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-blue/48">Catégorie</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pillars.map((pillar) => (
                    <button key={pillar} type="button" onClick={() => setPillarFilter((current) => current === pillar ? null : pillar)} className={`rounded-full border px-3 py-2 text-xs transition ${pillarFilter === pillar ? "border-dema-forest/20 bg-dema-sage text-dema-forest" : "border-dema-line text-brand-blue/58"}`}>
                      {pillar}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-blue/48">Type</legend>
                <button type="button" onClick={() => setRecurringOnly((value) => !value)} className={`mt-3 rounded-full border px-3 py-2 text-xs ${recurringOnly ? "border-dema-forest/20 bg-dema-sage text-dema-forest" : "border-dema-line text-brand-blue/58"}`}>
                  Récurrentes
                </button>
              </fieldset>

              <fieldset>
                <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-blue/48">Statut</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([
                    ["active", "À faire"],
                    ["completed", "Terminées"],
                    ["all", "Toutes"],
                  ] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setStatusFilter(value)} className={`rounded-full border px-3 py-2 text-xs ${statusFilter === value ? "border-dema-forest/20 bg-dema-sage text-dema-forest" : "border-dema-line text-brand-blue/58"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={() => { setPillarFilter(null); setRecurringOnly(false); setStatusFilter("active"); }} className="px-2 py-3 text-sm text-dema-forest">Réinitialiser</button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="demaa-primary-button min-h-12 flex-1">Afficher {filteredTasks.length} tâche{filteredTasks.length > 1 ? "s" : ""}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function KitView({
  services,
  servicesOpen,
  onServicesOpenChange,
}: {
  services: CockpitService[];
  servicesOpen: boolean;
  onServicesOpenChange: (open: boolean) => void;
}) {
  if (servicesOpen) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 pb-32 pt-8 md:px-6 md:pb-20 md:pt-14">
        <button type="button" onClick={() => onServicesOpenChange(false)} className="inline-flex items-center gap-2 text-sm text-brand-blue/52 hover:text-dema-forest">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Le Kit
        </button>
        <h1 className="demaa-section-title mt-6 text-5xl text-dema-forest md:text-6xl">Services</h1>
        <p className="mt-3 text-sm text-dema-muted">Un accompagnement lorsque vous en avez besoin.</p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {services.slice(0, 10).map((service) => (
            <Link key={service.slug} href={`/annuaire-services/${service.slug}`} className="group rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 transition hover:border-dema-forest/18">
              <span className="rounded-full bg-dema-sage px-2.5 py-1 text-[11px] text-dema-forest/75">{service.category}</span>
              <h2 className="mt-4 text-lg font-medium text-brand-blue">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-dema-muted">{service.shortDescription}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-dema-forest">
                Voir le service
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-8 md:px-6 md:pb-20 md:pt-14">
      <h1 className="demaa-section-title text-5xl text-dema-forest md:text-6xl">Le Kit</h1>
      <p className="mt-3 text-sm text-dema-muted">Tout ce qui peut aider votre entreprise à avancer.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {KIT_CATEGORIES.map((category) => {
          const Icon = KIT_ICONS[category.id] ?? BookOpenCheck;
          const content = (
            <>
              <Icon className="h-7 w-7 text-dema-forest" strokeWidth={1.45} aria-hidden="true" />
              <h2 className="mt-5 text-[15px] font-medium leading-5 text-brand-blue md:text-base">{category.label}</h2>
              <p className="mt-2 hidden text-xs leading-5 text-dema-muted md:block">{category.description}</p>
            </>
          );
          const className = "min-h-40 rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 text-left transition hover:-translate-y-0.5 hover:border-dema-forest/18 hover:shadow-[0_14px_30px_rgba(23,35,29,0.035)] md:min-h-48";

          if (category.id === "services") {
            return <button key={category.id} type="button" onClick={() => onServicesOpenChange(true)} className={className}>{content}</button>;
          }

          return <Link key={category.id} href={category.href ?? "#"} className={className}>{content}</Link>;
        })}
      </div>
    </main>
  );
}

function ProfileView({
  activity,
  email,
  taskCount,
  onChangeActivity,
  onOpenAccount,
}: {
  activity: CockpitActivity;
  email: string | null;
  taskCount: number;
  onChangeActivity: () => void;
  onOpenAccount: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-8 md:px-6 md:pb-20 md:pt-14">
      <h1 className="demaa-section-title text-5xl text-dema-forest md:text-6xl">Profil</h1>

      {email ? (
        <section className="mt-8 rounded-[1.5rem] border border-dema-line bg-dema-paper p-5 md:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-dema-sage text-xl text-dema-forest">{email.slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-lg font-medium">{email}</p>
              <p className="mt-1 text-sm text-dema-muted">{activity.name}</p>
            </div>
          </div>
          <p className="mt-5 inline-flex rounded-full bg-dema-sage px-3 py-1.5 text-xs text-dema-forest">{taskCount} tâches actives</p>
        </section>
      ) : (
        <section className="mt-8 rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 text-center md:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-medium">Retrouvez votre espace partout.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-dema-muted">Connectez-vous pour ajouter vos propres tâches et personnaliser votre Kit.</p>
          <button type="button" onClick={onOpenAccount} className="demaa-primary-button mt-6 min-h-11 px-6">Se connecter</button>
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper">
        <button type="button" onClick={onChangeActivity} className="flex min-h-16 w-full items-center gap-4 border-b border-dema-line px-5 text-left hover:bg-dema-sage/45">
          <Building2 className="h-5 w-5 shrink-0 text-dema-forest" strokeWidth={1.5} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-brand-blue">Mon activité</span>
            <span className="mt-0.5 block truncate text-xs text-dema-muted">{activity.name}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-brand-blue/35" aria-hidden="true" />
        </button>
        <Link href="mailto:team@demaa.fr" className="flex min-h-16 items-center gap-4 px-5 text-sm text-brand-blue hover:bg-dema-sage/45">
          <LifeBuoy className="h-5 w-5 shrink-0 text-dema-forest" strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1">Assistance</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-brand-blue/35" aria-hidden="true" />
        </Link>
        {email ? (
          <form action="/api/customer-space/logout?returnTo=/cockpit-preview" method="post" className="border-t border-dema-line">
            <button type="submit" className="flex min-h-16 w-full items-center gap-4 px-5 text-sm text-brand-blue hover:bg-dema-sage/45">
              <LogOut className="h-5 w-5 text-dema-forest" strokeWidth={1.5} aria-hidden="true" />
              Déconnexion
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}

function AccountDialog({
  pendingTaskTitle,
  onClose,
}: {
  pendingTaskTitle: string | null;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/customer-space/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, returnTo: "/cockpit-preview" }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; sent?: boolean; devLink?: string | null } | null;

      if (!response.ok || !payload?.sent) {
        throw new Error(payload?.error || "Impossible d’envoyer le lien.");
      }

      setSent(true);
      setDevLink(payload.devLink ?? null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d’envoyer le lien.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-blue/24 backdrop-blur-[2px] md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
      <section className="w-full max-w-md rounded-t-[2rem] bg-dema-paper px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl md:rounded-[2rem] md:p-7">
        <div className="mx-auto h-1 w-12 rounded-full bg-brand-blue/18 md:hidden" />
        <div className="mt-4 flex items-start justify-between md:mt-0">
          <div>
            <h2 id="account-dialog-title" className="demaa-section-title text-3xl text-dema-forest">{pendingTaskTitle ? "Ajoutez vos propres tâches" : "Retrouvez votre espace"}</h2>
            <p className="mt-2 text-sm leading-6 text-dema-muted">Créez gratuitement votre compte pour enregistrer vos tâches et personnaliser votre Kit.</p>
          </div>
          <button type="button" onClick={onClose} className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line text-brand-blue/45" aria-label="Fermer">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {pendingTaskTitle ? (
          <p className="mt-5 rounded-xl bg-dema-sage px-4 py-3 text-sm text-brand-blue/70">“{pendingTaskTitle}”</p>
        ) : null}

        {sent ? (
          <div className="mt-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Check className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-lg font-medium">Lien envoyé.</h3>
            <p className="mt-2 text-sm leading-6 text-dema-muted">Ouvrez votre email pour vous connecter. Votre tâche restera prête.</p>
            {devLink ? <a href={devLink} className="mt-4 inline-flex text-sm text-dema-forest underline">Ouvrir le lien de test</a> : null}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6">
            <label htmlFor="cockpit-account-email" className="text-xs text-brand-blue/60">Votre email professionnel</label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42" aria-hidden="true" />
              <input id="cockpit-account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@entreprise.fr" className="w-full rounded-full border border-dema-line bg-dema-paper py-3.5 pl-11 pr-4 text-sm outline-none placeholder:text-brand-blue/30 focus:border-dema-forest/30" />
            </div>
            {error ? <p className="mt-3 text-sm text-dema-forest">{error}</p> : null}
            <button type="submit" disabled={isSending} className="demaa-primary-button mt-4 min-h-12 w-full disabled:opacity-55">
              {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isSending ? "Envoi…" : "Continuer"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function CockpitPreviewApp({
  activities,
  initialEmail,
  initialRemoteState,
  services,
}: {
  activities: CockpitActivity[];
  initialEmail: string | null;
  initialRemoteState: CockpitRemoteState | null;
  services: CockpitService[];
}) {
  const [stage, setStage] = useState<CockpitStage>("activity");
  const [selectedActivitySlug, setSelectedActivitySlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CockpitTab>("tasks");
  const [tasksByActivity, setTasksByActivity] = useState<Record<string, CockpitTask[]>>({});
  const [accountOpen, setAccountOpen] = useState(false);
  const [pendingTaskTitle, setPendingTaskTitle] = useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const isMounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const storedActivitySlug = isMounted
    ? window.localStorage.getItem(ACTIVITY_STORAGE_KEY)
    : null;
  const remoteActivitySlug = activities.some(
    (activity) => activity.slug === initialRemoteState?.activitySlug,
  )
    ? initialRemoteState?.activitySlug ?? null
    : null;
  const effectiveActivitySlug = selectedActivitySlug ?? remoteActivitySlug ?? storedActivitySlug;
  const selectedActivity = activities.find((activity) => activity.slug === effectiveActivitySlug) ?? null;
  const [recoveredPendingTitle] = useState<string | null>(() => {
    if (typeof window === "undefined" || !initialEmail) return null;
    return window.localStorage.getItem(PENDING_TASK_STORAGE_KEY)?.trim() || null;
  });
  const storedOrInitialTasks = selectedActivity
    ? initialRemoteState?.activitySlug === selectedActivity.slug
      ? mergeSavedTasks(selectedActivity, initialRemoteState.tasks)
      : isMounted
        ? readStoredTasks(selectedActivity)
        : getInitialTasks(selectedActivity)
    : [];
  const baseTasks = selectedActivity
    ? tasksByActivity[selectedActivity.slug] ?? storedOrInitialTasks
    : [];
  const tasks = recoveredPendingTitle && !baseTasks.some((task) => task.custom && task.title === recoveredPendingTitle)
    ? [
        ...baseTasks,
        {
          id: "custom-recovered",
          title: recoveredPendingTitle,
          pillar: "Direction",
          period: "undated" as const,
          scheduleLabel: "Sans date",
          completed: false,
          custom: true,
        },
      ]
    : baseTasks;
  const effectiveStage = stage === "activity" && effectiveActivitySlug && !selectedActivitySlug
    ? "app"
    : stage;

  useEffect(() => {
    if (!initialEmail) return;

    const flush = () => void flushQueuedRemoteState();
    flush();
    window.addEventListener("online", flush);

    return () => window.removeEventListener("online", flush);
  }, [initialEmail]);

  useEffect(() => {
    if (stage !== "building") return;

    const timer = window.setTimeout(() => setStage("app"), 1100);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (!initialEmail || !selectedActivity || !recoveredPendingTitle) return;

    const currentTasks = initialRemoteState?.activitySlug === selectedActivity.slug
      ? mergeSavedTasks(selectedActivity, initialRemoteState.tasks)
      : readStoredTasks(selectedActivity);
    const nextTasks = currentTasks.some(
      (task) => task.custom && task.title === recoveredPendingTitle,
    )
      ? currentTasks
      : [
          ...currentTasks,
          {
            id: "custom-recovered",
            title: recoveredPendingTitle,
            pillar: "Direction",
            period: "undated" as const,
            scheduleLabel: "Sans date",
            completed: false,
            custom: true,
          },
        ];

    window.localStorage.removeItem(PENDING_TASK_STORAGE_KEY);
    saveStoredTasks(selectedActivity.slug, nextTasks);
    persistRemoteState(selectedActivity.slug, nextTasks);
  }, [initialEmail, initialRemoteState, recoveredPendingTitle, selectedActivity]);

  function selectActivity(activity: CockpitActivity) {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, activity.slug);
    setSelectedActivitySlug(activity.slug);
    const nextTasks = readStoredTasks(activity);
    setTasksByActivity((current) => ({
      ...current,
      [activity.slug]: nextTasks,
    }));
    if (initialEmail) {
      persistRemoteState(activity.slug, nextTasks);
    }
    setStage("building");
  }

  function updateTasks(nextTasks: CockpitTask[]) {
    if (!selectedActivity) return;
    setTasksByActivity((current) => ({ ...current, [selectedActivity.slug]: nextTasks }));
    saveStoredTasks(selectedActivity.slug, nextTasks);
    if (initialEmail) {
      persistRemoteState(selectedActivity.slug, nextTasks);
    }
  }

  function requireAccount(taskTitle: string) {
    setPendingTaskTitle(taskTitle);
    window.localStorage.setItem(PENDING_TASK_STORAGE_KEY, taskTitle);
    setAccountOpen(true);
  }

  function changeActivity() {
    window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    setSelectedActivitySlug(null);
    setActiveTab("tasks");
    setServicesOpen(false);
    setStage("activity");
  }

  function changeTab(tab: CockpitTab) {
    setActiveTab(tab);
    if (tab !== "kit") setServicesOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (effectiveStage === "activity" || !selectedActivity) {
    return <ActivitySelection activities={activities} onSelect={selectActivity} />;
  }

  if (effectiveStage === "building") {
    return <BuildingSpace activity={selectedActivity} />;
  }

  return (
    <div className="min-h-[100dvh] bg-dema-cream text-brand-blue">
      <DesktopHeader activeTab={activeTab} email={initialEmail} onTabChange={changeTab} />

      {activeTab === "tasks" ? (
        <TasksView
          activity={selectedActivity}
          tasks={tasks}
          email={initialEmail}
          onTasksChange={updateTasks}
          onRequireAccount={requireAccount}
        />
      ) : null}
      {activeTab === "kit" ? (
        <KitView services={services} servicesOpen={servicesOpen} onServicesOpenChange={setServicesOpen} />
      ) : null}
      {activeTab === "profile" ? (
        <ProfileView
          activity={selectedActivity}
          email={initialEmail}
          taskCount={tasks.filter((task) => !task.completed).length}
          onChangeActivity={changeActivity}
          onOpenAccount={() => {
            setPendingTaskTitle(null);
            setAccountOpen(true);
          }}
        />
      ) : null}

      <MobileNavigation activeTab={activeTab} onTabChange={changeTab} />

      {accountOpen ? (
        <AccountDialog
          pendingTaskTitle={pendingTaskTitle}
          onClose={() => setAccountOpen(false)}
        />
      ) : null}
    </div>
  );
}
