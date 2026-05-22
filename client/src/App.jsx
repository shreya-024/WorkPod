import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import RoleSelectPage from './pages/RoleSelectPage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import { useSimStore } from './store/useSimStore.js';

function ProtectedSim() {
  const role = useSimStore(s => s.role);
  // roomCode is set asynchronously by socket after joining — don't guard on it
  if (!role) return <Navigate to="/select" replace />;
  return <SimulationPage />;
}

function ProtectedReport() {
  const report = useSimStore(s => s.report);
  if (!report) return <Navigate to="/select" replace />;
  return <ReportPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select" element={<RoleSelectPage />} />
        <Route path="/sim" element={<ProtectedSim />} />
        <Route path="/report" element={<ProtectedReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
