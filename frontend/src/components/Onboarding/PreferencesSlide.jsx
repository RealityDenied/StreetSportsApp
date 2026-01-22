export default function PreferencesSlide({ formData, onChange, onNext, onPrev }) {
  const roles = [
    { value: "player", label: "Player", desc: "Join matches and compete" },
    { value: "organizer", label: "Organizer", desc: "Create and manage events" },
    { value: "viewer", label: "Viewer", desc: "Watch matches and follow stats" }
  ];
  const sports = ["Football", "Cricket", "Basketball", "Volleyball", "Tennis", "Badminton", "Others"];

  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-white">Choose your preferences</h2>
        <p className="text-neutral-400 text-sm">Select how you want to use StreetSports</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-neutral-300 text-sm font-medium">Your Role</label>
          <div className="grid grid-cols-1 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onChange("role", r.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  formData.role === r.value
                    ? "border-white bg-neutral-800"
                    : "border-neutral-700 bg-neutral-800 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium text-sm">{r.label}</div>
                    <div className="text-neutral-500 text-xs mt-1">{r.desc}</div>
                  </div>
                  {formData.role === r.value && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-neutral-950" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-neutral-300 text-sm font-medium">Favorite Sport</label>
          <select
            value={formData.favoriteSport}
            onChange={(e) => onChange("favoriteSport", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
          >
            <option value="" className="bg-neutral-800">Select your favorite sport</option>
            {sports.map((s) => (
              <option key={s} value={s} className="bg-neutral-800">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <button
          onClick={onPrev}
          className="flex-1 border border-neutral-700 text-neutral-300 font-medium py-3 rounded-xl hover:bg-neutral-800 active:scale-[0.99] transition-all duration-200 text-sm"
          style={{ aspectRatio: '2.618 / 1' }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-amber-500/20"
          style={{ aspectRatio: '2.618 / 1' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
