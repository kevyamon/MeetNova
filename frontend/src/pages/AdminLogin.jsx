import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import api from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', { password });
      navigate('/mnccadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex-center">
      <form onSubmit={handleLogin} className="login-card glass">
        <div className="login-header">
          <div className="icon-circle"><Lock size={30} /></div>
          <h1>Accès Forteresse</h1>
          <p>Espace réservé aux administrateurs MeetNova</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

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
          {loading ? 'Authentification...' : 'Déverrouiller'} <LogIn size={18} />
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
