import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import Search from "./pages/Search";
import { useAuth } from "./context/AuthContext";
import { warmBackend } from "./services/api";

const KEEP_ALIVE_INTERVAL_MS = 8 * 60 * 1000;

function App() {
  const { userId } = useAuth();

  useEffect(() => {
    warmBackend();
    const keepAlive = setInterval(warmBackend, KEEP_ALIVE_INTERVAL_MS);
    return () => clearInterval(keepAlive);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/search" />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={userId ? <Dashboard /> : <Navigate to="/login"/>} />
        <Route path="/book/:id" element={<BookDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
