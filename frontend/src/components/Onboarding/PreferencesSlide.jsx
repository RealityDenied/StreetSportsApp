export default function PreferencesSlide({ formData, onChange, onNext, onPrev }) {
  const roles = ["player", "organizer", "viewer"];
  const sports = ["Football", "Cricket", "Basketball", "Volleyball", "Others"];

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center">Choose your preferences</h2>
      <p className="text-gray-600 text-center">Select your role and favorite sport</p>

      <div>
        <h3 className="text-gray-700 mb-2 font-semibold">Role</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onChange("role", r)}
              className={`px-4 py-2 rounded-lg border ${
                formData.role === r
                  ? "bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-gray-700 mb-2 font-semibold">Favorite Sport</h3>
        <select
          value={formData.favoriteSport}
          onChange={(e) => onChange("favoriteSport", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Sport</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
