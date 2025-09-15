// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { API, getUserId, getToken, setAuth, clearAuth } from "../config";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // अगर localStorage में userId/token है तो "logged in" मानो
    const uid = getUserId();
    const tk = getToken();
    if (uid && tk) setUser({ id: uid });
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold text-indigo-600">AI Study Assistant</div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button
                className="px-3 py-1.5 rounded bg-indigo-600 text-white"
                onClick={() => { setErr(""); setShowLogin(true); }}
              >
                Log in
              </button>
              <button
                className="px-3 py-1.5 rounded border border-indigo-600 text-indigo-600"
                onClick={() => { setErr(""); setShowRegister(true); }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">Signed in</span>
              <button
                className="px-3 py-1.5 rounded bg-gray-800 text-white"
                onClick={logout}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---- Login Modal ---- */}
      {showLogin && (
        <AuthModal
          title="Log in"
          fields={[{ name: "email", type: "email" }, { name: "password", type: "password" }]}
          submitText="Log in"
          onClose={() => setShowLogin(false)}
          onSubmit={async (values) => {
            try {
              setErr("");
              const r = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data?.error || "Login failed");
              // Save auth & mark logged in
              setAuth({ token: data.token, userId: data.user.id });
              setUser({ id: data.user.id, name: data.user.name });
              setShowLogin(false);
            } catch (e) {
              setErr(e.message);
            }
          }}
          error={err}
        />
      )}

      {/* ---- Register Modal ---- */}
      {showRegister && (
        <AuthModal
          title="Register"
          fields={[
            { name: "name", type: "text" },
            { name: "email", type: "email" },
            { name: "password", type: "password" },
          ]}
          submitText="Sign up"
          onClose={() => setShowRegister(false)}
          onSubmit={async (values) => {
            try {
              setErr("");
              const r = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data?.error || "Registration failed");

              // registration ok → auto login
              const r2 = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email, password: values.password }),
              });
              const d2 = await r2.json();
              if (!r2.ok) throw new Error(d2?.error || "Auto-login failed");
              setAuth({ token: d2.token, userId: d2.user.id });
              setUser({ id: d2.user.id, name: d2.user.name });
              setShowRegister(false);
            } catch (e) {
              setErr(e.message);
            }
          }}
          error={err}
        />
      )}
    </header>
  );
}

function AuthModal({ title, fields, submitText, onClose, onSubmit, error }) {
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
  );
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(values);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
      <div className="bg-white w-full max-w-sm rounded-xl p-5 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm mb-1 capitalize">{f.name}</label>
              <input
                type={f.type}
                className="w-full border rounded p-2"
                value={values[f.name]}
                onChange={(e) => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                required
              />
            </div>
          ))}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : submitText}
          </button>
        </form>
      </div>
    </div>
  );
}
