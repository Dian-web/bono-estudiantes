import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';


// Protege la ruta y redirige si no hay sesión
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// Decide qué dashboard mostrar
const DashboardRouter = () => {
  const { profile, loading } = useAuth();
  
  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;
  
  // Si es admin, muestra panel de admin. Si no, panel de estudiante.
  return profile.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />
          {/* Cualquier otra ruta redirige a la principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;