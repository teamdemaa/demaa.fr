import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const socket = createServer();
await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", String(port), "-H", "127.0.0.1"], { env: process.env, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
child.stdout.on("data", chunk => { logs += chunk; });
child.stderr.on("data", chunk => { logs += chunk; });
try {
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { await fetch(`${origin}/favicon.ico`); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  if (!ready) throw new Error(`Production server did not start. ${logs.slice(-1000)}`);
  const checks = [["/studio", 200], ["/projets", 200], ["/equipe", 200], ["/apprentissages", 200], ["/apprentissages/jago", 200], ["/apprentissages/dumaan", 200], ["/apprentissages/tiimora", 200], ["/verification-404-cloture", 404], ["/apprentissages/organiser-entreprise-sans-tout-porter", 404]];
  for (const [route, expected] of checks) {
    const response = await fetch(`${origin}${route}`);
    if (response.status !== expected) throw new Error(`${route}: expected HTTP ${expected}, received ${response.status}`);
    console.log(`${route}: HTTP ${response.status}`);
  }
  for (const route of ["/solutions", "/solutions/restaurant", "/modeles", "/annuaire-outils", "/annuaire-fournisseurs", "/annuaire-financement", "/aides-et-subventions", "/annuaire-reseaux-pro", "/apercu-solutions", "/projets/dumaan"]) {
    const response = await fetch(`${origin}${route}`, { redirect: "manual" });
    const expected = route.startsWith("/projets/") ? "/projets" : "/studio";
    const target = new URL(response.headers.get("location") ?? "/", origin);
    if (response.status !== 307 || target.pathname !== expected) throw new Error(`${route}: invalid archived-route redirect (${response.status}, ${target.pathname})`);
    console.log(`${route}: HTTP 307 → ${expected}`);
  }
} finally {
  child.kill("SIGTERM");
}
