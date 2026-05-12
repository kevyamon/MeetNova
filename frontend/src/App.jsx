import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Scan from './pages/Scan';
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
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register/:eventId" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/mnccadmin" element={<AdminLogin />} />
          <Route path="/mnccadmin/dashboard" element={<AdminDashboard />} />
          <Route path="/mnccadmin/scan" element={<Scan />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
