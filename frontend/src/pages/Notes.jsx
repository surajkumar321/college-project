import { useState } from "react";
import { API, getUserId } from "../config";

export default function Notes() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSummarizeAndSave() {
    try {
      setErr(""); 
      setSaving(true);

      const res = await fetch(`${API}/notes/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId(), content })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Summarization failed");

      // normalize: either direct summary or inside note
      setSummary(data.summary || data.note?.summary || "No summary returned");

      window.dispatchEvent(new Event("data-changed"));
    } catch (e) {
      setErr(e.message || "Failed");
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">AI Note Summarizer</h2>
      <textarea 
        className="border p-2 w-full my-2" 
        value={content} 
        placeholder="Paste your notes here..."
        onChange={e => setContent(e.target.value)} 
      />
      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded" 
        onClick={handleSummarizeAndSave} 
        disabled={saving}
      >
        {saving ? "Summarizing..." : "Summarize & Save"}
      </button>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      {summary && (
        <div className="mt-4 p-4 border bg-gray-100">
          <h3 className="font-bold">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
