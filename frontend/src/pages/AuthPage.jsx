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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white w-96 rounded-2xl shadow-lg p-8">
        {/* Tab headers */}
        <div className="flex justify-around border-b mb-4">
          <button
            onClick={() => setActiveTab("login")}
            className={`pb-2 text-lg font-semibold ${
              activeTab === "login"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`pb-2 text-lg font-semibold ${
              activeTab === "signup"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Signup
          </button>
        </div>

        {renderActiveForm()}
      </div>
    </div>
  );
}
