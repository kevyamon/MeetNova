import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pourquoi : Empêcher l'accès aux pages admin si l'utilisateur n'est pas
 * authentifié. Redirige vers la page de login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Vérification de la session...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/mnccadmin" replace />;
  }

  return children;
};

export default ProtectedRoute;
