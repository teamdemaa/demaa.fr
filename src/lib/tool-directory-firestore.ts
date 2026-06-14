import "server-only";

import { getAdminFirestore } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import {
  toolDirectory,
  type ToolDirectoryItem,
} from "./tool-directory";

const TOOL_DIRECTORY_COLLECTION = "tool_directory";
const TRANSFERRED_SUPPLIER_TOOL_SLUGS = new Set([
  "qonto",
  "revolut-business",
  "wise-business",
  "shine",
  "alan",
  "swile",
]);

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
      .filter((tool) => tool.status !== "hidden" && tool.status !== "deprecated")
      .filter((tool) => !TRANSFERRED_SUPPLIER_TOOL_SLUGS.has(tool.slug ?? ""));

    if (!tools.length) {
      return toolDirectory;
    }

    const toolsBySlug = new Map(
      tools.map((tool) => [tool.slug || tool.name, tool])
    );

    for (const localTool of toolDirectory) {
      const key = localTool.slug || localTool.name;

      if (!toolsBySlug.has(key)) {
        toolsBySlug.set(key, localTool);
      }
    }

    return Array.from(toolsBySlug.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "fr")
    );
  } catch (error) {
    console.warn("[tool-directory] Firestore unavailable, using JSON fallback.", error);
    return toolDirectory;
  }
}

export async function getUnifiedToolDirectoryMeta() {
  const tools = await getUnifiedToolDirectory();

  return {
    tools,
    sectors: ["Tous", ...Array.from(new Set(tools.flatMap((tool) => tool.sectors)))],
    categories: ["Tous", ...Array.from(new Set(tools.map((tool) => tool.category)))],
  };
}
