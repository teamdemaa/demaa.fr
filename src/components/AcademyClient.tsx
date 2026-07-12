"use client";

import { useState } from "react";
import { BookOpen, Files } from "lucide-react";
import CoursesIndexClient from "@/components/CoursesIndexClient";
import ResourcesIndexClient from "@/components/ResourcesIndexClient";
import type { CourseEntry } from "@/lib/course-content";
import type { DocumentModel } from "@/lib/document-models";

type AcademySection = "cours" | "ressources";

type AcademyClientProps = {
  courses: CourseEntry[];
  resources: DocumentModel[];
};

export default function AcademyClient({ courses, resources }: AcademyClientProps) {
  const [activeSection, setActiveSection] = useState<AcademySection>("cours");

  return (
    <div className="w-full">
      <section className="bg-dema-cream px-4 pb-3 pt-10 sm:px-6 sm:pb-4 sm:pt-14">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-[clamp(2.8rem,8vw,5.4rem)] leading-[0.94] tracking-tight text-brand-blue">
            <span className="demaa-hero-title text-dema-forest">
              Apprendre et comprendre
            </span>
            <br />
            <span className="font-sans font-light not-italic text-brand-blue/62">
              la gestion d’entreprise
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-dema-muted">
            Retrouvez les cours Demaa et les ressources pratiques dans un même espace, sans perdre l’accès aux catalogues complets existants.
          </p>

          <div className="mt-8 flex justify-center">
            <div
              className="inline-flex rounded-full border border-dema-line bg-dema-paper/70 p-1"
              role="tablist"
              aria-label="Sections de l’Academy"
            >
              <button
                type="button"
                id="academy-cours-tab"
                role="tab"
                aria-selected={activeSection === "cours"}
                aria-controls="academy-content-panel"
                onClick={() => setActiveSection("cours")}
                className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-medium transition ${
                  activeSection === "cours"
                    ? "bg-dema-forest text-dema-paper"
                    : "text-brand-blue/65 hover:text-brand-blue"
                }`}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Cours
              </button>
              <button
                type="button"
                id="academy-ressources-tab"
                role="tab"
                aria-selected={activeSection === "ressources"}
                aria-controls="academy-content-panel"
                onClick={() => setActiveSection("ressources")}
                className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-medium transition ${
                  activeSection === "ressources"
                    ? "bg-dema-forest text-dema-paper"
                    : "text-brand-blue/65 hover:text-brand-blue"
                }`}
              >
                <Files className="h-4 w-4" aria-hidden="true" />
                Ressources
              </button>
            </div>
          </div>
        </div>
      </section>

      <div
        id="academy-content-panel"
        role="tabpanel"
        aria-labelledby={
          activeSection === "cours" ? "academy-cours-tab" : "academy-ressources-tab"
        }
      >
        {activeSection === "cours" ? (
          <CoursesIndexClient entries={courses} headingAs="h2" embedded />
        ) : (
          <ResourcesIndexClient entries={resources} headingAs="h2" embedded />
        )}
      </div>
    </div>
  );
}
