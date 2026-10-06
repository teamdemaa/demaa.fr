import { DEMAA_PUBLISHED_STUDIO_PROJECTS as frenchProjects, type DemaaStudioProject } from "./demaa-studio-projects";
export type { DemaaStudioProject };
const copy: Record<string, Pick<DemaaStudioProject, "summary" | "problem" | "solution" | "pole" | "imageAlt">> = {
  jagoya: {
    pole: "Tech & services",
    summary: "A wholesale sourcing service for shops, grocers and resellers looking for African products.",
    problem: "Finding the right products and suppliers, then organising a wholesale order, often takes many separate conversations.",
    solution: "Jago gathers customers’ requirements, finds suitable suppliers and manages the commercial relationship and order follow-up.",
    imageAlt: "Jago concept image: African products in a professional stockroom",
  },
  tiimora: {
    pole: "Tech & services",
    summary: "Operations software for accounting firms: clients, requests, documents and deadlines in one place.",
    problem: "Client requests, documents and deadlines are scattered across tools. Keeping track of them too often depends on manual reminders.",
    solution: "A shared workspace to track clients, next steps, and tax and payroll deadlines.",
    imageAlt: "Tiimora concept image: an accounting office with client tracking on screen",
  },
  "dumaan-food": {
    pole: "Food",
    summary: "West African food preparations that make everyday family meals easier.",
    problem: "Preparing dinner every evening takes time and energy for families.",
    solution: "Ready-to-cook preparations in formats suited to meals at home.",
    imageAlt: "Dumaan concept image: preparing tuna pastels at home, with a Dumaan pouch and a hibiscus drink",
  },
  mnd: {
    pole: "Media & commerce",
    summary: "A media platform to discover West African products and how to use them, with e-commerce planned as a later step.",
    problem: "Products are scattered and their uses can be hard to discover. Putting together all the ingredients for a recipe often means shopping in several places.",
    solution: "Content introducing the products and recipe kits that bring ingredients together, followed by curated selections for style, personal care and the home.",
    imageAlt: "MND concept image: preparing a meal with fonio and bissap",
  },
  tendera: {
    pole: "Tech & services",
    summary: "Making construction tenders easier to find and respond to, with support from AI.",
    problem: "Finding relevant tenders and preparing submissions takes considerable time for construction businesses.",
    solution: "A service to identify opportunities, understand the documents required and help prepare responses.",
    imageAlt: "Tendera concept image: construction tender opportunities",
  },
  kahe: {
    pole: "Franchise concepts",
    summary: "A Mandé-inspired coffee shop concept designed to grow through franchising.",
    problem: "Mandé flavours and cultures are still rarely represented in everyday coffee shops.",
    solution: "A place for coffee and conversation, with a Mandé-inspired identity and an offer designed to work across multiple locations.",
    imageAlt: "Kahé coffee shop concept in wood and sand tones",
  },
  mandya: {
    pole: "Franchise concepts",
    summary: "A premium Mandé-inspired spa concept designed to grow through franchising.",
    problem: "Mandé traditions of personal care are rarely represented in contemporary wellness experiences.",
    solution: "A spa experience combining these influences with consistent service and an operating model that can be replicated.",
    imageAlt: "Mandya spa concept image",
  },
  lafiasso: {
    pole: "Property",
    summary: "A platform for buying land in West Africa, with homes to follow.",
    problem: "Land listings are scattered, and essential information is difficult to gather and compare.",
    solution: "Structured land listings with the information buyers need and introductions to help move purchases forward.",
    imageAlt: "Lafiasso concept image: land and site visits in West Africa",
  },
  djaty: {
    pole: "Property",
    summary: "A renovation studio specialising in holiday homes.",
    problem: "Renovating a holiday home means coordinating decisions, building work and contractors, often from a distance.",
    solution: "Dedicated renovation support, from defining the project to overseeing delivery.",
    imageAlt: "Djaty concept image: a renovated holiday home",
  },
};
export const DEMAA_PUBLISHED_STUDIO_PROJECTS = frenchProjects.filter(p => copy[p.slug]).map(p => ({ ...p, ...copy[p.slug], need: undefined }));
export const DEMAA_PRIORITY_STUDIO_PROJECTS = ["jagoya", "tiimora", "dumaan-food"].map(slug => DEMAA_PUBLISHED_STUDIO_PROJECTS.find(p => p.slug === slug)!);
export const DEMAA_STUDIO_POLES = ["Tech & services", "Franchise concepts", "E-commerce", "Property"] as const;
