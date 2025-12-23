import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// CONFIGURATION
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 Hours
const HEARTBEAT_INTERVAL = 5 * 60 * 1000;    // 5 Minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Ref to track throttling for local activity updates
  const throttleTimer = useRef(null);

  // Logout Function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity'); 
    setUser(null);
    window.location.href = '/login'; 
  }, []);

  // --- 1. INITIAL LOAD CHECK ---
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token');
      const lastActivity = localStorage.getItem('lastActivity');
      const now = Date.now();

      // Check if session has expired while browser was closed
      if (token && lastActivity) {
        const timePassed = now - parseInt(lastActivity, 10);

        if (timePassed > SESSION_TIMEOUT) {
          console.log("Session expired while browser was closed.");
          logout();
          setLoading(false);
          return;
        }
      }

      if (token) {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
      }
      setLoading(false);
    };

    checkSession();
  }, [logout]);

  // --- 2. SERVER HEARTBEAT (NEW) ---
  // Pings the server every 5 mins to prove "Active" status, 
  // but ONLY if the user has actually moved the mouse recently.
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      const lastLocallyActive = parseInt(localStorage.getItem('lastActivity') || '0');
      const now = Date.now();

      // If user was active locally within the heartbeat interval, tell the server.
      // This prevents "Zombie Tabs" (open but abandoned) from looking Active.
      if (now - lastLocallyActive < HEARTBEAT_INTERVAL) {
        try {
           await api.post('/users/ping');
        } catch (err) {
           // Fail silently so we don't annoy the user if network blips
           console.error("Heartbeat failed silently", err);
        }
      }
    };

    const heartbeatId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeatId);
  }, [user]);

  // --- 3. LOCAL ACTIVITY TRACKER (PERFORMANCE OPTIMIZED) ---
  useEffect(() => {
    if (!user) return;

    // THROTTLED UPDATE FUNCTION
    // Only writes to localStorage once every 5 seconds max to prevent lag
    const updateActivity = () => {
      if (!throttleTimer.current) {
        throttleTimer.current = setTimeout(() => {
          localStorage.setItem('lastActivity', Date.now().toString());
          throttleTimer.current = null; 
        }, 5000);
      }
    };

    // Events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Attach listeners
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Interval to check for hard session timeout periodically
    const intervalId = setInterval(() => {
        const lastActivity = parseInt(localStorage.getItem('lastActivity') || Date.now());
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
            logout();
            alert("Session expired due to inactivity.");
        }
    }, 60000); // Check every 1 minute

    // Cleanup
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(intervalId);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [user, logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('lastActivity', Date.now().toString());
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);