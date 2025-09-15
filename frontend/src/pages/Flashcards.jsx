// frontend/src/pages/Flashcards.jsx
import { useState } from "react";
import { API, getUserId } from "../config";

export default function Flashcards() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [generatedCards, setGeneratedCards] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateFlashcards = async () => {
    try {
      if (!content || !content.trim()) {
        alert("Please paste your notes/content first.");
        return;
      }
      setLoading(true);

      const res = await fetch(`${API}/flashcards/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId(), subject, content }),
      });

      // read text first to handle non-JSON error pages
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response from server:", text);
        alert("Server error (see console). Check backend logs or quota.");
        return;
      }

      // support different backend shapes:
      // { flashcards: { cards: [...] } } OR { flashcards: [...] } OR { cards: [...] } OR saved doc
      const cards =
        json.cards ||
        (json.flashcards && (Array.isArray(json.flashcards) ? json.flashcards : json.flashcards.cards)) ||
        (Array.isArray(json) ? json : null);

      if (!cards || !Array.isArray(cards) || cards.length === 0) {
        console.warn("No cards returned:", json);
        alert("No flashcards returned. See console for details.");
        return;
      }

      setGeneratedCards(cards);

      // notify app to update counts on dashboard
      window.dispatchEvent(new Event("data-changed"));

      // optional: if backend returned id, save it or show success
      alert("Flashcards generated successfully!");
    } catch (err) {
      console.error("generateFlashcards error:", err);
      alert("Failed to generate flashcards. See console.");
    } finally {
      setLoading(false);
    }
  };

  const savePreview = () => {
    // optional: call backend to save again if needed
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">AI Flashcard Generator</h2>
      <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter subject" className="border p-2 w-full mb-3" />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Paste your notes here..." className="border p-2 w-full" />
      <div className="mt-4">
        <button onClick={generateFlashcards} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>
      </div>

      {generatedCards && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Preview</h3>
          <div className="grid gap-3">
            {generatedCards.map((c, i) => (
              <div key={i} className="p-3 border rounded bg-yellow-50">
                <p className="font-semibold">Q: {c.question}</p>
                <p className="text-green-700 mt-1">A: {c.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
