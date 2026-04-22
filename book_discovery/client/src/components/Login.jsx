// import { useState } from "react";
// import { loginUser } from "../services/api";

// const Login = ({ setUserId }) => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleLogin = async () => {
//         const data = await loginUser(email, password);

//         if(data.userId) {
//             setUserId(data.userId);
//             localStorage.setItem("userId", data.userId);
//             localStorage.setItem("token", data.token);
//         } else {
//             alert("Login failed: " + (data.error || "Unknown error"));
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-black dark:to-zinc-900">

//             <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md">

//                 <p className="text-center text-gray-500 mb-6">
//                 Sign in to continue your reading journey
//                 </p>

//                 <input
//                 className="w-full mb-3 p-3 border rounded-lg"
//                 placeholder="Email"
//                 onChange={(e) => setEmail(e.target.value)}
//                 />

//                 <input
//                 type="password"
//                 className="w-full mb-4 p-3 border rounded-lg"
//                 placeholder="Password"
//                 onChange={(e) => setPassword(e.target.value)}
//                 />

//                 <button
//                 onClick={handleLogin}
//                 className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
//                 >
//                 Login
//                 </button>
//             </div>
//             </div>
//     );
// };

// export default Login;