// frontend/src/lib/api.js
import { API, getUserId } from "../config";

// helper to call endpoints which return JSON
async function callJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  // If backend responded with HTML error page (e.g. 404 from dev server), return text message
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    const txt = contentType.includes("application/json") ? await res.json() : await res.text();
    throw new Error(typeof txt === "string" ? txt : JSON.stringify(txt));
  }
  // parse JSON if available
  if (contentType.includes("application/json")) return res.json();
  // otherwise return raw text
  return res.text();
}

/* -------- NOTES -------- */
export const createSummary = (content) =>
  callJSON(`${API}/notes/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, userId: getUserId() })
  });

export const fetchNotes = () =>
  callJSON(`${API}/notes/user/${getUserId()}`);

// delete
export const deleteNote = (id) =>
  callJSON(`${API}/notes/${id}`, { method: "DELETE" });

/* -------- QUIZ -------- */
export const generateQuiz = (content, subject = "") =>
  callJSON(`${API}/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, subject, userId: getUserId() })
  });

export const fetchQuizzes = () =>
  callJSON(`${API}/quiz/user/${getUserId()}`);

export const deleteQuiz = (id) =>
  callJSON(`${API}/quiz/${id}`, { method: "DELETE" });

/* -------- FLASHCARDS -------- */
export const generateFlashcards = (content, subject = "") =>
  callJSON(`${API}/flashcards/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, subject, userId: getUserId() })
  });

export const fetchFlashcards = () =>
  callJSON(`${API}/flashcards/user/${getUserId()}`);

export const deleteFlashcard = (id) =>
  callJSON(`${API}/flashcards/${id}`, { method: "DELETE" });

/* -------- VOICE -------- */
export const uploadVoice = async (file) => {
  const userId = getUserId();
  if (!userId) throw new Error("No userId (set localStorage userId before uploading).");

  const fd = new FormData();
  fd.append("audio", file, file.name);
  fd.append("userId", userId);

  const res = await fetch(`${API}/voice/upload`, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Voice upload failed");
  }
  return res.json();
};

export const fetchVoices = () =>
  callJSON(`${API}/voice/user/${getUserId()}`);

export const deleteVoice = (id) =>
  callJSON(`${API}/voice/${id}`, { method: "DELETE" });

/* -------- STATS (dashboard counts) -------- */
export const fetchStats = () =>
  callJSON(`${API}/stats/${getUserId()}`);
