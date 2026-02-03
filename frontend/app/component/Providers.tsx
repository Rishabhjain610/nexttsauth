"use client";
import React from "react";
import { Provider } from "react-redux";
import store from "../../lib/store";
import AuthContext from "../../context/AuthDataContext";
import UserDataContext from "../../context/UserDataContext";

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthContext>
        <UserDataContext />
        {children}
      </AuthContext>
    </Provider>
  );
};

export default Providers;