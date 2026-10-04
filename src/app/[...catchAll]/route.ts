// A non-streamed fallback guarantees HTTP 404 even with parallel modal routes.
const document = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page introuvable | DEMAA</title><link rel="icon" href="/favicon.ico"><style>body{margin:0;background:#F5F1EA;color:#171411;font-family:Arial,sans-serif}nav{padding:24px 7%}a{color:inherit}nav a{font:italic 30px Georgia,serif;text-decoration:none}main{min-height:75vh;display:grid;place-items:center;padding:24px}section{text-align:center;max-width:650px}h1{font:italic clamp(40px,7vw,72px) Georgia,serif}p{color:#716B64;line-height:1.8}section a{display:inline-block;margin:20px 10px;padding:14px 24px;border:1px solid #79553E;border-radius:30px;text-decoration:none}</style></head><body><nav aria-label="Accueil"><a href="/studio">DEMAA</a></nav><main><section><h1>Cette page n’existe pas.</h1><p>Le lien est peut-être ancien ou la page a été déplacée.</p><a href="/studio">Retour au Studio</a><a href="/projets">Voir les projets</a></section></main></body></html>`;

export function GET() {
  return new Response(document, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, follow" },
  });
}
