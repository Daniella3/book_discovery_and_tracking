import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEMO_NOTES = {
  OL554614W: "Heard through the grapevine that Gregory has the craziest love story out of all the siblings. Can't wait to continue to see how his story unfolds.",
  OL21745884W: "Science puzzle energy. I want to finish the Rocky chapters this week.",
};

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (data) => {
    if (!data?.token || !data?.userId) {
      return;
    }

    const nextUserId = String(data.userId);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", nextUserId);
    setToken(data.token);
    setUserId(nextUserId);

    if (data.demo) {
      Object.entries(DEMO_NOTES).forEach(([bookId, note]) => {
        localStorage.setItem(`book-note:${bookId}`, note);
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  };

  useEffect(() => {
    const handleExpiredAuth = () => logout();
    window.addEventListener("auth:expired", handleExpiredAuth);
    return () => window.removeEventListener("auth:expired", handleExpiredAuth);
  }, []);

  const value = useMemo(
    () => ({ userId, token, isLoggedIn: Boolean(userId), login, logout }),
    [userId, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
