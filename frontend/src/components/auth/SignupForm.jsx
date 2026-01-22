import { useState } from "react";
import api from "../../api/api";

export default function SignupForm({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ...form,
        roles: ["player"],
      });
      alert(res.data.message);
      onSwitch(); // go back to login after signup
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="w-full flex flex-col gap-6"
    >
      <div className="space-y-2">
        <label className="text-neutral-300 text-sm font-medium">
          Full Name
        </label>
        <input
          name="name"
          type="text"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-neutral-300 text-sm font-medium">
          Email
        </label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-neutral-300 text-sm font-medium">
          Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
      >
        {isLoading ? "Creating account..." : "Sign up"}
      </button>

      <p
        className="text-sm text-neutral-500 text-center mt-2 cursor-pointer hover:text-neutral-300 transition-colors duration-200"
        onClick={onSwitch}
      >
        Already have an account? <span className="text-white font-medium">Log in</span>
      </p>
    </form>
  );
}
