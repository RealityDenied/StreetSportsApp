import { useEffect, useState } from "react";
import api from "../api/api";
import ProfileCard from "../components/ProfileCard";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert("Session expired, please login again");
        localStorage.removeItem("token");
        window.location.href = "/auth";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading your profile...
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        👋 Welcome back, {user?.name?.split(" ")[0]}!
      </h1>

      <ProfileCard user={user} />

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white transition"
      >
        Logout
      </button>
    </div>
  );
}
