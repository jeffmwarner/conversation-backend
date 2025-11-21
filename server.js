import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default system prompt if caller doesn't specify one
const DEFAULT_SYSTEM_PROMPT = `
You are a supportive, safety-focused assistant. Use warm, validating language.
Do not diagnose or prescribe. If the user expresses self-harm or harm to others,
encourage contacting crisis services or emergency care. Keep responses concise and clear.
`.trim();

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString().slice(0, 2000);

    // allow caller to override system instructions
    //const systemPrompt = (req.body.systemPrompt || DEFAULT_SYSTEM_PROMPT).toString();
    const systemPrompt = SYSTEM_PROFILES[req.body.profile] || SYSTEM_PROFILES.default;


    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Sorry, I’m not sure how to respond right now.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Assistant error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
