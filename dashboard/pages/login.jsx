// pages/login.js
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Login = () => {
  // State variables to store username and password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Make a POST request to your backend login API
      const response = await axios.post("http://localhost:8000/login/", {
        username,
        password,
      });
      // If login successful, you can redirect or perform any other actions
      console.log("Login successful", response.data);
      setError("");
      const user = response.data.user;
      if (user.role === "teacher") {
        router.push("/teacher/?uid=" + user.uid);
      } else {
        router.push("/student/?uid=" + user.uid);
      }
    } catch (error) {
      // If login fails, display error message
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Login</h1>
        <div>
          <label htmlFor="username" style={{ marginBottom: '0.5rem', display: 'block', color: '#333' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ marginBottom: '0.5rem', display: 'block', color: '#333' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', backgroundColor: '#007BFF', color: '#fff', cursor: 'pointer' }}>Login</button>
      </form>
    </div>

  );
};

export default Login;
