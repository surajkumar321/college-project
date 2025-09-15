import { useState } from "react";
import { API } from "../config";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleRegister = async () => {
    try {
      setErr(""); setLoading(true);
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");
      alert("Registered! Please login.");
      nav("/login");
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <input className="border p-2 w-full my-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border p-2 w-full my-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full my-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleRegister} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded w-full">
        {loading ? "Creating..." : "Register"}
      </button>
      {err && <p className="text-red-600 mt-2">{err}</p>}
      <p className="mt-3 text-sm">Already have an account? <Link className="text-indigo-600" to="/login">Login</Link></p>
    </div>
  );
}

