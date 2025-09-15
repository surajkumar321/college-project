// frontend/src/pages/history/FlashcardsHistory.jsx
import { useEffect, useState } from "react";
import { API, getUserId } from "../../config";

export default function FlashcardsHistory() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const userId = getUserId();
      if (!userId) {
        setErr("User not logged in");
        setList([]);
        return;
      }

      const r = await fetch(`${API}/flashcards/user/${userId}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("load flashcards error:", e);
      setErr("Failed to load flashcards");
      setList([]);
    }
  }

  useEffect(() => {
    load();

    // optional: listen for global event when something changed (generate/delete)
    const onChange = () => load();
    window.addEventListener("data-changed", onChange);
    return () => window.removeEventListener("data-changed", onChange);
  }, []);

  async function del(id) {
    try {
      const r = await fetch(`${API}/flashcards/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Delete failed ${r.status}`);
      setList(prev => prev.filter(x => x._id !== id));
      window.dispatchEvent(new Event("data-changed"));
    } catch (e) {
      console.error("delete error:", e);
      alert("Delete failed. Check console for details.");
    }
  }

  if (!list) return <p className="p-6">Loading...</p>;
  if (err) return <p className="p-6 text-red-600">{err}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Flashcards History</h2>
      {list.length === 0 ? <p>No flashcards yet.</p> : list.map(fc => (
        <div key={fc._id} className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between">
            <p className="font-semibold">{fc.subject || "Untitled"}</p>
            <button onClick={() => del(fc._id)} className="text-red-600 underline">Delete</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {(fc.cards || []).map((c, i) => (
              <div key={i} className="p-3 border rounded bg-yellow-50">
                <p className="font-semibold">Q: {c.question}</p>
                <p className="text-green-700 mt-1">A: {c.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
