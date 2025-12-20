/* */
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Layers, X, LogOut, ChevronDown, User, BookOpen 
} from 'lucide-react';
import DotGrid from './DotGrid'; // Import DotGrid
import waveLogo from '../assets/Wave.png';
import textLogo from '../assets/Text.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* --- BACKGROUND EFFECT --- */}
      <DotGrid />

      {/* --- SIDEBAR OVERLAY --- */}
      {showSidebar && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
            onClick={() => setShowSidebar(false)}
          />
          <div className="sidebar-popout glass-dropdown" style={{
            position: 'fixed', 
            top: '1.5rem', 
            left: '1.5rem', 
            bottom: '1.5rem',
            width: '280px',
            borderRadius: '1.5rem',
            zIndex: 201, 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            borderRight: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 className="font-neon" style={{ fontSize: '2rem', margin: 0, color: 'var(--text-bright)' }}>Menu</h2>
              <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                <X size={28} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <Link to="/dashboard" className={`nav-item-pop ${isActive('/dashboard') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                <LayoutDashboard size={24} /> Dashboard
              </Link>
              <Link to="/leads" className={`nav-item-pop ${isActive('/leads') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                <Layers size={24} /> Leads
              </Link>
              <Link to="/guide" className={`nav-item-pop ${isActive('/guide') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                <BookOpen size={24} /> Guide
              </Link>
              {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
                <Link to="/users" className={`nav-item-pop ${isActive('/users') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                  <Users size={24} /> Team
                </Link>
              )}
            </nav>
          </div>
          <style>{`
            .nav-item-pop { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 1.25rem; padding: 0.75rem; transition: 0.2s; border-radius: 12px; text-decoration: none; }
            .nav-item-pop:hover { background: rgba(255,255,255,0.05); color: var(--primary); }
            .active-pop { background: rgba(0, 243, 255, 0.1) !important; color: var(--primary) !important; border: 1px solid rgba(0, 243, 255, 0.2); }
            .glass-dropdown { background: rgba(13, 22, 41, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          `}</style>
        </>
      )}

      {/* --- FLOATING NAVBAR --- */}
      <nav style={{ 
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        padding: '0.5rem 2rem', 
        zIndex: 100,
        borderRadius: '50px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: scrolled ? 'rgba(13, 22, 41, 0.7)' : 'rgba(13, 22, 41, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div 
                onClick={() => setShowSidebar(true)}
                style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }}
             >
                <img src={waveLogo} alt="Logo" style={{ width: '60px', height: '60px' }} />
             </div>
             <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                <img src={textLogo} alt="LeadFlow" style={{ height: '50px', filter: 'brightness(1.5)' }} />
             </div>
        </div>
        
        {/* Right Side - User Profile */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
                background: 'transparent', border: 'none', display: 'flex',
                alignItems: 'center', gap: '0.75rem', color: 'white', cursor: 'pointer'
            }}
          >
              <div style={{ 
                width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', 
                background: 'var(--surface)', border: '2px solid var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {user?.profilePic ? (
                    <img src={user.profilePic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                      {user?.name?.[0]}
                    </span>
                )}
              </div>
              <ChevronDown size={18} />
          </button>

          {showProfileMenu && (
              <div className="glass-dropdown animate-fade-in" style={{ 
                position: 'absolute', top: '120%', right: 0, width: '220px', 
                borderRadius: '1.5rem', padding: '0.5rem', display: 'flex',
                flexDirection: 'column', gap: '0.25rem'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
                
                <button 
                    onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text)', padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1rem' }}
                    className="hover-bg"
                >
                    <User size={18} /> Profile
                </button>
                <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1rem' }}
                    className="hover-bg"
                >
                    <LogOut size={18} /> Logout
                </button>
              </div>
          )}
        </div>
      </nav>

      <style>{`
         .hover-bg:hover { background: rgba(255,255,255,0.08) !important; }
         .animate-fade-in { animation: fadeIn 0.2s ease-out; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{ 
        flex: 1, 
        paddingTop: '140px', 
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        paddingBottom: '2rem',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative', // Ensures it stacks above DotGrid
        zIndex: 1
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;