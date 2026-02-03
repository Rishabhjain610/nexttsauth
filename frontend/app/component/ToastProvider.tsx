"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-left"
      hideProgressBar={true}
      autoClose={1000}
      theme="dark"
      toastStyle={{
        background: "#18181b",
        color: "#fafafa",
        borderRadius: "10px",
        fontWeight: "500",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    />
  );
};

export default ToastProvider;