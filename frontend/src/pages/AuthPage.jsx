import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  const renderActiveForm = () => {
    switch (activeTab) {
      case "login":
        return (
          <LoginForm
            onSwitch={() => setActiveTab("signup")}
            onForgot={() => setActiveTab("forgot")}
          />
        );
      case "signup":
        return <SignupForm onSwitch={() => setActiveTab("login")} />;
      case "forgot":
        return <ForgotPasswordForm onBack={() => setActiveTab("login")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="w-full max-w-md px-6">
        {/* Logo/Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">
            Street<span className="text-neutral-400">Sports</span>
          </h1>
          <p className="text-neutral-500 text-sm font-medium mt-2">
            Your competitive sports platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl p-8">
          {/* Tab headers */}
          <div className="flex border-b border-neutral-800 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-4 text-base font-semibold transition-colors duration-200 relative ${
                activeTab === "login"
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-400"
              }`}
            >
              Login
              {activeTab === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 pb-4 text-base font-semibold transition-colors duration-200 relative ${
                activeTab === "signup"
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-400"
              }`}
            >
              Sign Up
              {activeTab === "signup" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>
              )}
            </button>
          </div>

          {renderActiveForm()}
        </div>
      </div>
    </div>
  );
}
