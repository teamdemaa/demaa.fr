import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Page introuvable - Demaa",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountingDirectorySeoPage() {
  notFound();
}
