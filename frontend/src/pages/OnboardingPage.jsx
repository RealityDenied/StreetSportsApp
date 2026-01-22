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
      title="Join Local Street Matches"
      desc="Discover and join street sports events happening in your area. Find pickup games, tournaments, and casual matches near you."
      onNext={next}
      onPrev={prev}
    />,
    <FeatureSlide
      title="Organize Your Own Events"
      desc="Create and manage street sports events. Set up matches, invite players, and build your local sports community."
      onNext={next}
      onPrev={prev}
    />,
    <FeatureSlide
      title="Live Scores & Statistics"
      desc="Track real-time match updates, view live leaderboards, and analyze player performance. Stay connected with every game."
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 px-4 py-8">
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-xl w-full max-w-lg p-8 transition-all duration-300">
        {slides[step]}
      </div>

      {/* Progress Bar */}
      <div className="flex mt-8 gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= step 
                ? "bg-white w-8" 
                : "bg-neutral-700 w-2"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
