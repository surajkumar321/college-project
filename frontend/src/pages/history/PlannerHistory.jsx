import { useEffect, useState } from "react";
import { API, getUserId } from "../../config";

export default function PlannerHistory() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const userId = getUserId() || "123"; // dev fallback

  useEffect(() => {
    (async () => {
      try {
        // Try /user/:userId first, fallback to /:userId
        let r = await fetch(`${API}/planner/user/${userId}`);
        if (r.status === 404) r = await fetch(`${API}/planner/${userId}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
        setState("ready");
      } catch (e) {
        console.error("Planner history load error:", e);
        setState("error");
      }
    })();
  }, [userId]);

  const del = async (id) => {
    try {
      await fetch(`${API}/planner/${id}`, { method: "DELETE" });
      setItems((x) => x.filter((i) => i._id !== id));
      // Let dashboard update if it listens to this event
      window.dispatchEvent(new Event("data-changed"));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Planner History</h2>

      {state === "loading" && <p>Loading…</p>}
      {state === "error" && <p className="text-red-600">Failed to load.</p>}
      {state === "ready" && items.length === 0 && <p>No plans yet.</p>}

      {state === "ready" && items.length > 0 && (
        <div className="space-y-6">
          {items.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500 mb-2">
                {p.subject || "General"} • Exam: {p.examDate ? new Date(p.examDate).toLocaleDateString() : "N/A"}
              </p>
              <ul className="list-disc pl-5">
                {(p.plan || []).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <button
                onClick={() => del(p._id)}
                className="mt-3 px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
