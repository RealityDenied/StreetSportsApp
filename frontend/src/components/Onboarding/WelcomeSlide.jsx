export default function WelcomeSlide({ onNext }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Welcome to StreetSports!</h1>
      <p className="text-gray-600">
        Organize, play, or watch street sports right from your phone.  
        Compete with friends and explore your local community.
      </p>

      <img
        src="https://cdn-icons-png.flaticon.com/512/1042/1042339.png"
        alt="welcome"
        className="w-32 h-32 mx-auto"
      />

      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Let’s Get Started →
      </button>
    </div>
  );
}
