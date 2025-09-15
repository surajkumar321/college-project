// backend/utils/gemini.js
import fetch from "node-fetch";
import fs from "fs";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// ----- Text generation -----
export async function geminiText(prompt, model = "gemini-1.5-flash") {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const url = `${BASE}/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: prompt }]}],
    generationConfig: { temperature: 0.3 },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// ----- JSON generation (strict) -----
export async function geminiJSON(prompt, model = "gemini-1.5-flash") {
  const wrapped = `Return ONLY valid JSON (no code fences, no extra text).\n${prompt}`;
  const text = await geminiText(wrapped, model);

  const first = Math.min(...[text.indexOf("{"), text.indexOf("[")].filter(i => i >= 0));
  const last = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  const slice = (first >= 0 && last > first) ? text.slice(first, last + 1) : text;
  try { return JSON.parse(slice); }
  catch { return JSON.parse(slice.replace(/```/g, "").trim()); }
}

// ----- 🎤 Audio → Text -----
export async function geminiTranscribeAudio(filePath, mime = "audio/webm", model = "gemini-1.5-flash") {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");

  const bytes = fs.readFileSync(filePath);
  const b64 = Buffer.from(bytes).toString("base64");

  const url = `${BASE}/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{
      parts: [
        { text: "Transcribe the audio to plain text. Output only the transcript." },
        { inline_data: { mime_type: mime, data: b64 } }
      ]
    }],
    generationConfig: { temperature: 0.1 }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`Gemini(audio) ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}
