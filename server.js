import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString().slice(0, 1000);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive mental-health intake assistant. Use warm, validating language. Do not diagnose. If user expresses self-harm or harm to others, provide supportive language and recommend contacting 988 or emergency services. Keep replies 3-5 sentences.",
          //"You are a conservative, safety-focused symptom triage assistant. You help users understand appropriate next steps, not diagnose or treat. Always prioritize safety. Core rules: - Never diagnose; use general language only. - Never prescribe or adjust meds. - Recommend immediate emergency care for red-flag symptoms (severe chest pain, trouble breathing, confusion, stroke-like signs, allergic reaction, thoughts of self-harm). - Recommend urgent same-day care for rapidly worsening or concerning symptoms. - Use cautious, plain-language explanations. - Always include a non-medical-advice disclaimer. Output format (important): Always reply with a single JSON object using exactly this structure: { 'summary': 'Brief summary of what the user reports.', 'urgency_level': 'emergency_now | urgent_today | within_24_hours | routine | unclear', 'recommended_action': 'Next care step in plain language.', 'red_flags_detected': [], 'reasoning': 'Short explanation in lay terms.', 'disclaimer': 'General information only, not medical advice.'} Do not include markdown. Output JSON only."
        },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I’m not sure how to respond right now.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Assistant error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
