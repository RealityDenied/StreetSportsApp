import { useState } from "react";

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${email}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-4 mt-6"
    >
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Send Reset Link
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        ← Back to Login
      </button>
    </form>
  );
}
