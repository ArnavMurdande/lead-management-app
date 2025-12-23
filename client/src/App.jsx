import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api'; // Import your API utility

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Users from './pages/Users';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Guide from './pages/Guide';

import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';

// --- NEW: Heartbeat Component ---
// This runs inside AuthProvider to access the user context
const Heartbeat = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only ping if user is logged in
    if (!user) return;

    const pingServer = async () => {
      try {
        await api.post('/users/ping');
      } catch (error) {
        // Silently fail if ping fails (don't annoy user)
        console.error('Heartbeat failed:', error); 
      }
    };

    // 1. Ping immediately upon mount/login
    pingServer();

    // 2. Set up interval to ping every 2 minutes
    const intervalId = setInterval(pingServer, 2 * 60 * 1000);

    // 3. Cleanup interval on unmount/logout
    return () => clearInterval(intervalId);
  }, [user]);

  return null; // This component renders nothing
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Run Heartbeat to track active status */}
        <Heartbeat />
        
        <CustomCursor />
        <ScrollProgress />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/guide" element={<Guide />} />
          
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;