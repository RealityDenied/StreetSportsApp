export default function WelcomeSlide({ onNext }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Welcome to <span className="text-neutral-400">StreetSports</span>
        </h1>
        <p className="text-neutral-400 text-base leading-relaxed max-w-sm mx-auto">
          Your platform for organizing, playing, and watching street sports. 
          Connect with local players, join matches, and compete in your community.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6 py-6">
        <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="space-y-3 text-left w-full max-w-xs">
          <div className="flex items-center space-x-3 text-neutral-300">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span className="text-sm">Find local street matches</span>
          </div>
          <div className="flex items-center space-x-3 text-neutral-300">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span className="text-sm">Organize your own events</span>
          </div>
          <div className="flex items-center space-x-3 text-neutral-300">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span className="text-sm">Track live scores & stats</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3.5 rounded-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-amber-500/20"
        style={{ aspectRatio: '2.618 / 1' }}
      >
        Get Started
      </button>
    </div>
  );
}
