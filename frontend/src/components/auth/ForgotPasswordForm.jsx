import { useState } from "react";

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Password reset link sent to ${email}`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
        <p className="text-neutral-500 text-sm">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-neutral-300 text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3.5 rounded-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
        style={{ aspectRatio: '2.618 / 1' }}
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200 text-center"
      >
        ← Back to Login
      </button>
    </form>
  );
}
