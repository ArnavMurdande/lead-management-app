import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout Function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect to login or clear other states if needed
  }, []);

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // --- IDLE TIMER / AUTO LOGOUT LOGIC (6 HOURS) ---
  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    const sixHours = 6 * 60 * 60 * 1000;
    let idleTimer;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.log("User idle for 6 hours, logging out...");
        logout();
        alert("You have been logged out due to inactivity.");
      }, sixHours);
    };

    // Events that reset the idle timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Initialize timer
    resetTimer();

    // Attach listeners
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Cleanup
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);


  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);