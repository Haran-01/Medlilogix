import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { PatientDetailsPage } from './pages/PatientDetails/PatientDetailsPage';
import { PatientsPage } from './pages/Patients/PatientsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SignupPage } from './pages/Login/SignupPage';

function ProtectedApp() {
  const { isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-app text-base font-bold text-[#07194c]">
        Loading MediLogiX...
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/patients" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/patients" replace /> : <SignupPage />} />
      <Route element={<ProtectedApp />}>
        <Route index element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patient/:id" element={<PatientDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/patients' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
