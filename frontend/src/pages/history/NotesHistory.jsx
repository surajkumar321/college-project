// src/pages/history/NotesHistory.jsx
import { useEffect, useState } from "react";
import { API, getUserId } from "../../config";

export default function NotesHistory() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const r = await fetch(`${API}/notes/user/${getUserId()}`);
      if (!r.ok) throw new Error("Fetch failed");
      const d = await r.json();
      setList(d);
    } catch (e) {
      console.error(e);
      setErr("Failed to load");
    }
  }
  useEffect(() => { load(); }, []);

  async function del(id) {
    if (!confirm("Delete this note?")) return;
    try {
      const r = await fetch(`${API}/notes/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      setList(prev => prev.filter(x => x._id !== id));
      window.dispatchEvent(new Event("data-changed"));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  }

  if (!list) return <p className="p-6">Loading...</p>;
  if (err) return <p className="p-6 text-red-600">{err}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Notes History</h2>
      {list.length === 0 ? <p>No notes yet.</p> : (
        <ul className="space-y-4">
          {list.map(n => (
            <li key={n._id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
              <p className="mt-2 font-semibold">Summary</p>
              <p>{n.summary}</p>
              <button onClick={() => del(n._id)} className="mt-3 text-red-600 underline">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
