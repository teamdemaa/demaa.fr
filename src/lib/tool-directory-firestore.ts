import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import {
  toolDirectory,
  toolDirectoryCategories,
  toolDirectorySectors,
  toolboxToolDirectory,
  type ToolDirectoryItem,
} from "./tool-directory";

const TOOL_DIRECTORY_COLLECTION = "tool_directory";

function normalizeTool(data: DocumentData | undefined): ToolDirectoryItem | null {
  if (!data || !data.slug || !data.name) {
    return null;
  }

  return data as ToolDirectoryItem;
}

export async function getUnifiedToolDirectory(): Promise<ToolDirectoryItem[]> {
  try {
    const firestore = getAdminFirestore();
    const snapshot = await firestore.collection(TOOL_DIRECTORY_COLLECTION).get();

    if (snapshot.empty) {
      return toolDirectory;
    }

    const tools = snapshot.docs
      .map((doc) => normalizeTool(doc.data()))
      .filter((tool): tool is ToolDirectoryItem => Boolean(tool))
      .filter((tool) => tool.status !== "hidden" && tool.status !== "deprecated");

    if (!tools.length) {
      return toolDirectory;
    }

    return tools.sort((left, right) => left.name.localeCompare(right.name, "fr"));
  } catch {
    return toolDirectory;
  }
}

export async function getUnifiedToolDirectoryMeta() {
  const tools = await getUnifiedToolDirectory();

  return {
    tools,
    toolboxTools: tools.filter((tool) => tool.toolbox),
    sectors: ["Tous", ...Array.from(new Set(tools.flatMap((tool) => tool.sectors)))],
    categories: ["Tous", ...Array.from(new Set(tools.map((tool) => tool.category)))],
  };
}

export const fallbackToolDirectoryMeta = {
  tools: toolDirectory,
  toolboxTools: toolboxToolDirectory,
  sectors: toolDirectorySectors,
  categories: toolDirectoryCategories,
};
