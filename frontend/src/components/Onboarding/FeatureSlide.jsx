export default function FeatureSlide({ title, desc, onNext, onPrev }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
      <p className="text-gray-600">{desc}</p>

      <img
        src="https://cdn-icons-png.flaticon.com/512/1198/1198398.png"
        alt="feature"
        className="w-28 h-28 mx-auto"
      />

      <div className="flex justify-between w-full mt-4">
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
