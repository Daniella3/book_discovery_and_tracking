import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        const result = await registerUser(email, password);
            alert(result.message || "Registration successful.");
            navigate("/login");
        } catch (error) {
        console.error("Error during registration:", error);
        alert(error.message || "An error occurred. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#9AB17A]">
        <div className="bg-[#FBE8CE] p-8 rounded-xl shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">
            Create Your Account
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
            onClick={handleRegister}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition"
            >
            {isSubmitting ? "Creating Account..." : "Register"}
            </button>
            <p className="mt-4 text-sm">Already have an account?{" "}
                <Link to="/login" className="text-rose-500 hover:underline">Login</Link>
            </p>
        </div>
        </div>
    );
}

export default Register;
