export default function FinalSlide({ onPrev, onFinish }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-semibold text-white">You're all set!</h2>
        <p className="text-neutral-400 text-sm max-w-sm mx-auto">
          Your profile is complete. Start discovering matches, organizing events, and connecting with your local sports community.
        </p>
      </div>

      <div className="w-full space-y-3 pt-4">
        <div className="flex items-center space-x-3 text-neutral-300 text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Profile created successfully</span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-300 text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Preferences saved</span>
        </div>
        <div className="flex items-center space-x-3 text-neutral-300 text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ready to explore</span>
        </div>
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
          onClick={onFinish}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-amber-500/20"
          style={{ aspectRatio: '2.618 / 1' }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
