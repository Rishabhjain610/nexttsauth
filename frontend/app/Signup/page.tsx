"use client";
import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AuthDataContext } from "../../context/AuthDataContext";
import { Lock, Mail, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../lib/redux/userSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.user.userData);
  const { serverUrl } = useContext(AuthDataContext);

  useEffect(() => {
    if (userData) router.replace("/");
  }, [userData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      dispatch(setUserData(res.data.user));
      toast.success("Signup Successful");
      router.push("/");
    } catch (err: any) {
      toast.error("Signup Failed");
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const name = user.displayName;
      const email = user.email;
      const res = await axios.post(
        `${serverUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );
      dispatch(setUserData(res.data.user));
      toast.success("Google Sign-Up Successful");
      router.push("/");
    } catch (err) {
      console.error("Google Sign-Up Failed", err);
      toast.error("Google Sign-Up Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none text-black focus:border-black transition"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-black" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none text-black focus:border-black transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-black" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none text-black focus:border-black transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-black transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <FcGoogle className="w-4 h-4" />
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <p className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/Login" className="text-black font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;