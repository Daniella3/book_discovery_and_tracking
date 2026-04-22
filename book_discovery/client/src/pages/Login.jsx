import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const data = await loginUser(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        window.location.assign("/dashboard");
        return;
      }

      alert("Invalid login");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9AB17A]">
      
      <div className="bg-[#FBE8CE] p-8 rounded-xl shadow-md w-full max-w-sm">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to Your Account
        </h2>

        <input
          className="w-full mb-3 p-2 border rounded-lg"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 border rounded-lg"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm">
          Need an account?{" "}
          <Link to="/register" className="text-rose-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
