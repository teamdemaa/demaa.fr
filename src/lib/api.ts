import { Tool, Service, Template, ContentType } from './types';
import { database, searchIndexes } from './database';

// Fonction générique optimisée pour récupérer les données
export async function getData<T extends Tool | Service | Template>(type: ContentType): Promise<T[]> {
  return database[type] as T[];
}

// Fonctions spécifiques pour maintenir la compatibilité
export async function getTools(): Promise<Tool[]> {
  return getData<Tool>('tools');
}

export async function getServices(): Promise<Service[]> {
  return getData<Service>('services');
}

export async function getTemplates(): Promise<Template[]> {
  return getData<Template>('templates');
}

// Fonctions de recherche optimisées
export async function searchTools(query: string): Promise<Tool[]> {
  if (!query) return database.tools;
  
  const q = query.toLowerCase();
  return database.tools.filter(tool => 
    tool.name.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.category.toLowerCase().includes(q) ||
    tool.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export async function searchServices(query: string): Promise<Service[]> {
  if (!query) return database.services;
  
  const q = query.toLowerCase();
  return database.services.filter(service => 
    service.name.toLowerCase().includes(q) ||
    service.description.toLowerCase().includes(q) ||
    service.category.toLowerCase().includes(q) ||
    service.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export async function searchTemplates(query: string): Promise<Template[]> {
  if (!query) return database.templates;
  
  const q = query.toLowerCase();
  return database.templates.filter(template => 
    template.name.toLowerCase().includes(q) ||
    template.description.toLowerCase().includes(q) ||
    template.category.toLowerCase().includes(q)
  );
}

// Fonctions de recherche par slug (compatibilité)
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  return database.tools.find(tool => tool.slug === slug) || null;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return database.services.find(service => service.slug === slug) || null;
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  return database.templates.find(template => template.slug === slug) || null;
}
