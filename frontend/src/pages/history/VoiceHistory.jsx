import { useEffect, useState } from "react";
import { API, getUserId } from "../../config";

// helper: chhota/garbage transcript 3 ya usse kam chars ho to blank return karo
const cleanTranscript = (t) => (t && t.length > 3 ? t : "");

export default function VoiceHistory() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const r = await fetch(`${API}/voice/user/${getUserId()}`);
      if (!r.ok) throw new Error("Fetch failed");
      const d = await r.json();

      // Normalize items: ensure transcript cleaned; support audioUrl or audioPath
      const normalized = Array.isArray(d)
        ? d.map((item) => ({
            ...item,
            transcript: cleanTranscript(item.transcript),
            audioUrl: item.audioUrl || item.audioPath || "",
          }))
        : [];
      setList(normalized);
    } catch (e) {
      console.error(e);
      setErr("Failed to load voice notes");
    }
  }

  useEffect(() => {
    load();
    // listen for global updates (other pages dispatch `data-changed`)
    const handler = () => load();
    window.addEventListener("data-changed", handler);
    return () => window.removeEventListener("data-changed", handler);
  }, []);

  async function del(id, publicId) {
    if (!confirm("Delete this voice note?")) return;
    try {
      const r = await fetch(`${API}/voice/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      setList((prev) => prev.filter((x) => x._id !== id));
      window.dispatchEvent(new Event("data-changed"));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  }

  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!list) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Voice Notes History</h2>
      {list.length === 0 ? (
        <p>No voice notes yet.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((n) => (
            <li key={n._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>

                  {/* audioUrl used (fallback audioPath kept for older records) */}
                  {n.audioUrl && (
                    <div className="mt-2">
                      <audio src={n.audioUrl} controls className="w-full" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => del(n._id, n.audioPublicId)}
                    className="ml-4 text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-semibold">Transcript</p>
                <p className="whitespace-pre-wrap">{n.transcript || "—"}</p>

                {n.summary && (
                  <>
                    <p className="mt-2 font-semibold">Summary</p>
                    <p className="whitespace-pre-wrap">{n.summary}</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
