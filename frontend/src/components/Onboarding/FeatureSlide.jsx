export default function FeatureSlide({ title, desc, onNext, onPrev }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
          {desc}
        </p>
      </div>

      <div className="w-32 h-32 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center my-4">
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <div className="flex justify-between w-full gap-3 pt-4">
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
