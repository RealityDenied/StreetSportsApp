import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'

export default function App() {
  console.log('App component rendering')
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <div className="p-4">
          {/* Fallback content to verify render */}
          <h1 className="text-2xl">Loading...</h1>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


