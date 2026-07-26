import { buildBtpPublicationStaging } from "@/lib/btp-publication-staging";

const entries = buildBtpPublicationStaging();
const selectedSlug = process.argv
  .find((argument) => argument.startsWith("--slug="))
  ?.slice("--slug=".length);
const selectedEntries = selectedSlug
  ? entries.filter((entry) => entry.slug === selectedSlug)
  : entries;

if (selectedSlug && selectedEntries.length === 0) {
  throw new Error(`Métier BTP inconnu : ${selectedSlug}.`);
}

const summary = {
  profiles: selectedEntries.length,
  readyForHumanApproval: selectedEntries.filter(
    (entry) => entry.readyForHumanApproval,
  ).length,
  synchronized: selectedEntries.filter((entry) => entry.synchronized).length,
  currentContents: selectedEntries.reduce(
    (total, entry) => total + entry.currentContentCount,
    0,
  ),
  targetContents: selectedEntries.reduce(
    (total, entry) => total + entry.targetContentCount,
    0,
  ),
  currentPlaceholders: selectedEntries.reduce(
    (total, entry) => total + entry.currentPlaceholderCount,
    0,
  ),
};

console.log(JSON.stringify({ summary, entries: selectedEntries }, null, 2));
