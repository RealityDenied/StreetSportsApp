import { Link } from 'react-router-dom';

export default function HomePage() {
  console.log('HomePage is rendering');
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Street Sports</h1>
      <p className="text-gray-600">Find and join street sports events in your area!</p>
      <div className="mt-4">
        <Link to="/auth" className="text-blue-500 hover:text-blue-700">
          Go to Auth Page
        </Link>
      </div>
    </div>
  );
}