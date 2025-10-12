export default function FinalSlide({ onPrev, onFinish }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <h2 className="text-3xl font-bold text-blue-600">You're all set! 🎉</h2>
      <p className="text-gray-600">Let’s start exploring StreetSports and join the fun!</p>

      <img
        src="https://cdn-icons-png.flaticon.com/512/992/992703.png"
        alt="done"
        className="w-32 h-32 mx-auto"
      />

      <div className="flex justify-between w-full mt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
        >
          ← Back
        </button>
        <button
          onClick={onFinish}
          className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Finish →
        </button>
      </div>
    </div>
  );
}
