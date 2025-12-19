import { useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Layers, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>LeadFlow</h1>
        </div>

        <nav className="nav-menu">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          
          <Link to="/leads" className={`nav-item ${isActive('/leads') ? 'active' : ''}`}>
            <Layers size={20} />
            Leads
          </Link>

          {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
            <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
              <Users size={20} />
              Users
            </Link>
          )}

          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
             <User size={20} />
             Profile
          </Link>
        </nav>

        <div className="user-profile">
          <div className="user-info">
            <div className="avatar">
              {user?.name?.[0]}
            </div>
            <div className="user-details" style={{ overflow: 'hidden' }}>
              <p className="font-medium" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
