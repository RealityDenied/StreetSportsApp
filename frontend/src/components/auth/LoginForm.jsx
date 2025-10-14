import { useState } from "react";
import api from "../../api/api";

export default function LoginForm({ onSwitch, onForgot }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/auth/login", form);
    localStorage.setItem("token", res.data.token);

    // fetch user info
    const me = await api.get("/user/me");
    if (!me.data.profileCompleted) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/home";
    }
  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <form
      onSubmit={handleLogin}
      className="w-full flex flex-col gap-4 mt-6"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Login
      </button>

      <div className="flex justify-between text-sm text-gray-600">
        <button
          type="button"
          onClick={onForgot}
          className="hover:text-blue-600"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onSwitch}
          className="hover:text-blue-600"
        >
          Create account
        </button>
      </div>
    </form>
  );
}
