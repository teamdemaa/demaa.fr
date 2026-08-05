import {elevenLabsRequest} from "./lib/config.mjs";

const url = new URL("https://api.elevenlabs.io/v2/voices");
url.searchParams.set("page_size", "100");
url.searchParams.set("include_total_count", "false");
url.searchParams.set("sort", "name");
url.searchParams.set("sort_direction", "asc");

const response = await elevenLabsRequest(url);
const payload = await response.json();
const voices = payload.voices ?? [];

const french = voices.filter((voice) => {
  const searchable = JSON.stringify({
    name: voice.name,
    description: voice.description,
    labels: voice.labels,
  }).toLocaleLowerCase("fr");
  return searchable.includes("french") || searchable.includes("français");
});

const selected = french.length > 0 ? french : voices;
console.log(
  JSON.stringify(
    selected.map((voice) => ({
      name: voice.name,
      voiceId: voice.voice_id,
      category: voice.category,
      description: voice.description,
      labels: voice.labels,
      previewUrl: voice.preview_url,
    })),
    null,
    2,
  ),
);

if (french.length === 0) {
  console.error(
    "\nAucune voix explicitement étiquetée « French » dans les voix du compte : la liste complète est affichée.",
  );
}
