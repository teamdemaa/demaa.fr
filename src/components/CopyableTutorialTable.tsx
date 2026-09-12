"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { TutorialField } from "@/lib/tutorial-catalog";

export default function CopyableTutorialTable({ fields }: { fields: readonly TutorialField[] }) {
  const [copied, setCopied] = useState(false);

  async function copyTable() {
    const table = [
      ["Champ", "Type", "Pourquoi"],
      ...fields.map((field) => [field.name, field.type, field.purpose]),
    ].map((row) => row.join("\t")).join("\n");

    await navigator.clipboard.writeText(table);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper">
      <div className="flex items-center justify-between gap-4 border-b border-dema-line px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-brand-blue">Structure minimale à reproduire</p>
        <button
          type="button"
          onClick={copyTable}
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-dema-forest/15 px-3 text-xs font-medium text-dema-forest transition hover:bg-dema-sage/40"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copié" : "Copier le tableau"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead className="bg-dema-sage/30 text-brand-blue">
            <tr>
              <th className="px-5 py-3 font-medium">Champ</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Pourquoi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dema-line text-dema-muted">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="px-5 py-3 font-medium text-brand-blue">{field.name}</td>
                <td className="px-5 py-3">{field.type}</td>
                <td className="px-5 py-3">{field.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
