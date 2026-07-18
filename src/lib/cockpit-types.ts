export type CockpitPeriod = "overdue" | "today" | "week" | "later" | "undated";

export type CockpitTaskTemplate = {
  id: string;
  title: string;
  pillar: string;
  period: CockpitPeriod;
  scheduleLabel: string;
  recurrence?: string;
};

export type CockpitActivity = {
  slug: string;
  name: string;
  description: string;
  sectorLabel: string;
  tasks: CockpitTaskTemplate[];
};

export type CockpitTask = CockpitTaskTemplate & {
  completed: boolean;
  custom?: boolean;
};

export type CockpitRemoteState = {
  activitySlug: string;
  tasks: CockpitTask[];
  updatedAt: string;
};

export type CockpitKitCategory = {
  id: string;
  label: string;
  description: string;
  href?: string;
};

export type CockpitService = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
};
