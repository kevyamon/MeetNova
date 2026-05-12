import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Pourquoi : Le gardien des routes administratives. 
 * Il vérifie non seulement l'état local, mais s'assure que le chargement 
 * de la session est terminé avant de rendre quoi que ce soit.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="premium-loader">
          <div className="loader-ring"></div>
          <div className="loader-core"></div>
        </div>
        <p className="loading-text">Vérification de sécurité...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // On redirige vers login en gardant en mémoire la page demandée
    return <Navigate to="/mnccadmin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
