import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

router.post("/contact", async (req: Request, res: Response) => {

  const webhookURL = process.env.SLACK_WEBHOOK_URL;

  if (!webhookURL) {
    console.error("SLACK_WEBHOOK_URL missing");
    return res.status(500).json({ error: "SLACK_WEBHOOK_URL not configured" });
  }

  try {
    console.log("BODY RECIBIDO:", req.body); // ← DEBUG

    const { nombre, email, telefono, asunto, mensaje } = req.body;

    const text = `📩 Nuevo mensaje:

• *Nombre:* ${nombre}
• *Email:* ${email}
• *Teléfono:* ${telefono || "No proporcionado"}
• *Asunto:* ${asunto}
• *Mensaje:* ${mensaje}
`;

    const slackResponse = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error("Slack response error:", errorText);
      return res.status(500).json({ error: "Failed to send message to Slack" });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
