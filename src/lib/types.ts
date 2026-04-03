// Interfaces spécialisées et optimisées

export interface Tool {
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

export interface Service {
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

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  link: string;
  image: string;
}

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

export type ContentType = 'tools' | 'services' | 'templates' | 'systems';
