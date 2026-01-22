export default function ProfileInfoSlide({ formData, onChange, onNext, onPrev }) {
  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-white">Tell us about yourself</h2>
        <p className="text-neutral-400 text-sm">Help us personalize your StreetSports experience</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-neutral-300 text-sm font-medium">Age</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            min="13"
            max="100"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-neutral-300 text-sm font-medium">City</label>
          <input
            type="text"
            placeholder="Enter your city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 text-sm"
          />
          <p className="text-neutral-500 text-xs">We'll use this to find matches near you</p>
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
