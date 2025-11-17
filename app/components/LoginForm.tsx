"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import axios from "axios"; // <-- ADD THIS

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      // Save JWT token
      localStorage.setItem("token", res.data.token);

      // Redirect to dashboard
      router.push("/project/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] rounded-2xl p-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-black">Login</h1>

      {/* Email */}
      <div className="mb-5">
        <label className="text-gray-700 text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // <-- STORE VALUE
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="text-gray-700 text-sm font-medium">Password</label>
        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // <-- STORE VALUE
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition"
      >
        Login
      </button>

      <p className="text-center text-sm mt-4 text-indigo-600 hover:underline cursor-pointer">
        Forgot Password?
      </p>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button className="flex items-center justify-center w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
        <FcGoogle size={22} className="mr-2" />
        Sign in with Google
      </button>
    </div>
  );
}
