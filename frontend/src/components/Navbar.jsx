// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserId, getToken, clearAuth } from "../config";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = getUserId();
    const tk = getToken();
    setLoggedIn(!!(uid && tk));
  }, []);

  const logout = () => {
    clearAuth();
    setLoggedIn(false);
    navigate("/"); // logout ke baad home bhej do
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          AI Study Assistant
        </Link>

        <div className="flex items-center gap-3">
          {!loggedIn ? (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded border border-indigo-600 text-indigo-600 text-sm"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
