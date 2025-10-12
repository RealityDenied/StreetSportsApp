export default function ProfileInfoSlide({ formData, onChange, onNext, onPrev }) {
  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center">Tell us about you</h2>
      <p className="text-gray-600 text-center">This helps us personalize your experience</p>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => onChange("age", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
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
