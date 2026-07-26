import { buildTechServicesPublicationStaging } from "@/lib/tech-services-publication-staging";

const entries = buildTechServicesPublicationStaging();

console.log(
  JSON.stringify(
    {
      summary: {
        profiles: entries.length,
        readyForHumanApproval: entries.filter(
          (entry) => entry.readyForHumanApproval,
        ).length,
        synchronized: entries.filter((entry) => entry.synchronized).length,
        currentContents: entries.reduce(
          (total, entry) => total + entry.currentContentCount,
          0,
        ),
        targetContents: entries.reduce(
          (total, entry) => total + entry.targetContentCount,
          0,
        ),
        currentPlaceholders: entries.reduce(
          (total, entry) => total + entry.currentPlaceholderCount,
          0,
        ),
      },
      waves: Object.fromEntries(
        ["managed", "product"].map((wave) => [
          wave,
          entries.filter((entry) => entry.wave === wave),
        ]),
      ),
    },
    null,
    2,
  ),
);
