import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import EventPage from './pages/EventPage'

export default function App() {
  console.log('App component rendering')
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/event/:eventId" element={<EventPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


