import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/mnccadmin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/mnccadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex-center">
      <form onSubmit={handleLogin} className="login-card glass">
        <div className="login-header">
          <div className="icon-circle"><Lock size={30} /></div>
          <h1>Accès Admin</h1>
          <p>Saisissez vos accès pour gérer MeetNova</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="form-group">
          <label>Email Administrateur</label>
          <div className="input-with-icon">
            <Mail size={18} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@meetnova.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mot de passe Maître</label>
          <div className="input-with-icon">
            <Lock size={18} />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter / S\'inscrire'} <LogIn size={18} />
        </button>
        
        <p className="login-note">
          Note : Si c'est votre première fois, votre email sera automatiquement inscrit si le mot de passe est bon.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
