// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserId, getToken, clearAuth } from "../config";

export default function Navbar() {
  const [user, setUser] = useState(null);

  // On mount + when storage changes → update
  useEffect(() => {
    const checkUser = () => {
      const uid = getUserId();
      const tk = getToken();
      if (uid && tk) {
        setUser({ id: uid });
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for cross-page login/logout
    window.addEventListener("data-changed", checkUser);
    window.addEventListener("storage", checkUser); // if localStorage changes
    return () => {
      window.removeEventListener("data-changed", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    window.dispatchEvent(new Event("data-changed")); // trigger update
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          AI Study Assistant
        </Link>

        <div>
          {!user ? (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded bg-indigo-600 text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded border border-indigo-600 text-indigo-600"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded bg-gray-800 text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
