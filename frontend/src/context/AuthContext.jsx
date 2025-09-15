// frontend/src/context/AuthContext.jsx
import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const login = (userData, token) => {
    // store same keys that rest of app expects
    if (token) localStorage.setItem("token", token);

    // store userId so getUserId() works for other features
    const id = userData?.id ?? userData?._id ?? null;
    if (id) localStorage.setItem("userId", id);

    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
