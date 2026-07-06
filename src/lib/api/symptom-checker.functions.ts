import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const analyzeSymptoms = createServerFn({ method: "POST" })
  .inputValidator(z.object({ symptoms: z.string().min(3).max(2000) }))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a careful medical information assistant. Given a patient's symptoms, output STRICT JSON with keys: severity ('low'|'moderate'|'high'), conditions (array of {name, likelihood ('low'|'medium'|'high'), description}), advice (array of short strings), redFlags (array of short strings), specialist (string). Never diagnose — always recommend consulting a licensed doctor.",
          },
          { role: "user", content: `Symptoms: ${data.symptoms}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }
    return parsed as {
      severity?: "low" | "moderate" | "high";
      conditions?: Array<{ name: string; likelihood: string; description: string }>;
      advice?: string[];
      redFlags?: string[];
      specialist?: string;
    };
  });
