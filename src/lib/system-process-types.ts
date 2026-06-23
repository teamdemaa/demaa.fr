export type SystemPillar =
  | "Stratégie"
  | "Marketing & Vente"
  | "Opérations"
  | "Finance & administration"
  | "Équipe";

export type SystemProcessTemplate = {
  id: string;
  pillar: Exclude<SystemPillar, "Opérations">;
  title: string;
  description: string;
  sort_order?: number;
};
