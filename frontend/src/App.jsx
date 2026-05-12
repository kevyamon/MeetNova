import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import News from './pages/News';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Scan from './pages/Scan';
import Navigation from './components/TabBar';
import AdminNavigation from './components/AdminNavigation';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/register/:eventId" element={<Register />} />
              
              {/* Admin Routes */}
              <Route path="/mnccadmin" element={<AdminLogin />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/mnccadmin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mnccadmin/scan" 
                element={
                  <ProtectedRoute>
                    <Scan />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Navigation />
            <AdminNavigation />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
