import payload from "@/data/actify-opportunities-idf.normalized.json";

export type ActifyOpportunity = {
  source: "actify";
  source_id: string;
  source_url: string;
  title: string;
  city: string | null;
  postal_code: string | null;
  department: string | null;
  sectors: string[];
  opportunity_type: string | null;
  status: string | null;
  procedure_type: string | null;
  deadline: string | null;
  publication_date: string | null;
  views_count: number | null;
  reference: string | null;
  revenue_range: string | null;
  company_age: string | null;
  employee_count_range: string | null;
  deficit_carryforward: string | null;
  short_description: string | null;
  contact_study_name: string | null;
  documents_available: boolean;
  score: number | null;
  scraped_at: string;
};

type ActifyOpportunitiesPayload = {
  source: string;
  source_home: string;
  scraped_at: string;
  total_available_reported: number;
  count: number;
  opportunities: ActifyOpportunity[];
};

const actifyPayload = payload as ActifyOpportunitiesPayload;

export const actifyOpportunities = actifyPayload.opportunities;
export const actifyOpportunitiesScrapedAt = actifyPayload.scraped_at;
