"use client";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../lib/redux/userSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthDataContext } from "../../context/AuthDataContext";

const LoginButton: React.FC = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.user.userData);
  const { serverUrl } = useContext(AuthDataContext);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      router.push("/Login");
    } catch (error) {
      console.error("Logout Failed", error);
    }
  };
  const handleLoginSignup = () => router.push("/Login");

  return (
    <div>
      {userData ? (
        <button onClick={handleLogout} className="bg-red-400 rounded-3xl px-4 py-2">
          Logout
        </button>
      ) : (
        <button onClick={handleLoginSignup} className="bg-black text-white rounded-3xl px-4 py-2">
          Login/Signup
        </button>
      )}
    </div>
  );
};

export default LoginButton;