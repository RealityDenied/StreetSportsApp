import { useState } from "react";
import api from "../api/api";

// slides
import WelcomeSlide from "../components/Onboarding/WelcomeSlide";
import FeatureSlide from "../components/Onboarding/FeatureSlide";
import ProfileInfoSlide from "../components/Onboarding/ProfileInfoSlide";
import PreferencesSlide from "../components/Onboarding/PreferencesSlide";
import FinalSlide from "../components/Onboarding/FinalSlide";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    city: "",
    favoriteSport: "",
    role: "",
  });

  const next = () => setStep((prev) => Math.min(prev + 1, slides.length - 1));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.put("/user/update-profile", formData);
      alert("🎉 " + res.data.message);
      window.location.href = "/home";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  const slides = [
    <WelcomeSlide onNext={next} />,
    <FeatureSlide
      title="Join Street Matches Instantly"
      desc="Find local street games happening near you and participate in seconds."
      onNext={next}
      onPrev={prev}
    />,
    <FeatureSlide
      title="Book & Watch Live Leaderboards"
      desc="View live match stats, scores, and book seats for ongoing games."
      onNext={next}
      onPrev={prev}
    />,
    <ProfileInfoSlide
      formData={formData}
      onChange={handleChange}
      onNext={next}
      onPrev={prev}
    />,
    <PreferencesSlide
      formData={formData}
      onChange={handleChange}
      onNext={next}
      onPrev={prev}
    />,
    <FinalSlide onPrev={prev} onFinish={handleSubmit} />,
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-11/12 sm:w-[480px] p-8 transition-all duration-500">
        {slides[step]}
      </div>

      {/* Progress Bar */}
      <div className="flex mt-6 gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full ${
              i <= step ? "bg-white" : "bg-white/40"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
