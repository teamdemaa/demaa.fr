import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { company, sector, email, source } = await request.json();

    if (!company || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL not set");
      return NextResponse.json({ ok: true }); // fail silently for UX
    }

    const payload = {
      text: `📬 Nouvelle demande Team Demaa`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Entreprise* : ${company}\n*Secteur* : ${sector || "_non renseigné_"}\n*Email* : ${email}\n*Source* : ${source || "Modal"}`
          }
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: `⏰ ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}` }]
        }
      ]
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Lead webhook error →", e);
    return NextResponse.json({ ok: true }); // fail silently for UX
  }
}
