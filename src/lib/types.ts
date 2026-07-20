export interface System {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  icon: string;
  price: string;
}
