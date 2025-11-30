import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const router = Router();

/**
 * Ruta que envia mensajes a slack, en caso de exito devuelve success: true
 */
router.post("/", async (req: Request, res: Response) => {

  const webhookURL = process.env.SLACK_WEBHOOK_URL;

  if (!webhookURL) {
    console.error("SLACK_WEBHOOK_URL missing");
    return res.status(500).json({ error: "SLACK_WEBHOOK_URL not configured" });
  }

  try {

    const { nombre, email, telefono, asunto, mensaje } = req.body;

    const text = `📩 Nuevo mensaje:
      • *Nombre:* ${nombre}
      • *Email:* ${email}
      • *Teléfono:* ${telefono || "No proporcionado"}
      • *Asunto:* ${asunto}
      • *Mensaje:* ${mensaje}
      `;

    const slackResponse = await axios.post(webhookURL, { text }); // Enviar mensaje a Slack

    return res.status(200).json({ success: true }); 

  } catch (error: any) {
    console.error("Slack response error:",  error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to send message to Slack" });
  }
});

export default router;
