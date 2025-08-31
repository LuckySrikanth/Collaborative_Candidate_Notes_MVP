import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      localStorage.setItem("token", response.token);

      // Store full user object
      const userObj = {
        _id: response.user._id,
        email: response.user.email,
        username: response.user.username || response.user.email.split("@")[0],
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      setUser(userObj);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password);
      localStorage.setItem("token", response.token);

      const userObj = {
        _id: response.user._id,
        email: response.user.email,
        username: response.user.username,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      setUser(userObj);
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
