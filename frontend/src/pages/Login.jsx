import { useState } from "react";
import { API, setAuth } from "../config";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      setErr(""); setLoading(true);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");

      setAuth({ token: data.token, userId: data.user.id });
      alert("Logged in ✅");
      nav("/");
      window.dispatchEvent(new Event("data-changed"));
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input className="border p-2 w-full my-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full my-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        {loading ? "Signing in..." : "Login"}
      </button>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      <p className="mt-3 text-sm">No account? <Link className="text-indigo-600" to="/register">Register</Link></p>
    </div>
  );
}
