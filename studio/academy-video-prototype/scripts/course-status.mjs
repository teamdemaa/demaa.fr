import path from "node:path";
import {resolveCourse} from "./lib/course.mjs";
import {
  assertCurrentScript,
  loadProduction,
  sha256File,
} from "./lib/production.mjs";

const course = await resolveCourse();
const production = await loadProduction(course);
let scriptState = "non approuvé";
if (production.script?.sha256) {
  try {
    await assertCurrentScript(course, production);
    scriptState = "approuvé et inchangé";
  } catch {
    scriptState = "modifié depuis l’approbation";
  }
}

console.log(`Cours : ${course.slug}`);
console.log(`Statut : ${production.status}`);
console.log(`Script : ${scriptState}`);
if (production.voice) {
  console.log(`Voix approuvée : ${production.voice.approvedAt}`);
}
if (production.render) {
  console.log(`Prêt au rendu : ${production.render.approvedAt}`);
}
if (production.final) {
  const currentOutputHash = await sha256File(course.finalOutput);
  console.log(
    `Master : ${
      currentOutputHash === production.final.sha256 ? "validé" : "modifié"
    }`,
  );
  console.log(
    `Sortie : ${path.relative(process.cwd(), course.finalOutput)}`,
  );
}
