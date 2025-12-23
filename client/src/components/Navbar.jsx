import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronDown, User, LogOut, LayoutDashboard, Home, BookOpen, 
  Layers, Users, X, Moon 
} from 'lucide-react';
import textLogo from '../assets/Text.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- STATE ---
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar state moved here
  
  const profileMenuRef = useRef(null);

  // Helper: Check active route
  const isActive = (path) => location.pathname === path;

  // 1. Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Handle Click Outside Profile Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
    setShowSidebar(false);
  };

  return (
    <>
      {/* --- TOP NAVIGATION BAR --- */}
      <nav 
        className="navbar-container"
        style={{ 
          position: 'fixed',
          top: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          borderRadius: '50px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: scrolled ? 'rgba(13, 22, 41, 0.7)' : 'rgba(13, 22, 41, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {/* LEFT: LOGO (Triggers Sidebar) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
             <div 
                onClick={() => setShowSidebar(true)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
             >
                <img 
                  src={textLogo} 
                  alt="LeadFlow" 
                  className="nav-logo-img"
                  style={{ dropShadow: '0 0 8px var(--primary-glow)' }} 
                />
             </div>
        </div>
        
        {/* RIGHT: ACTIONS */}
        <div className="nav-actions">
          

          {!user ? (
            // GUEST VIEW
            <>
              <button className="btn btn-neon" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn btn-neon hide-mobile" onClick={() => navigate('/guide')}>
                Get Started
              </button>
            </>
          ) : (
            // LOGGED IN VIEW
             <div style={{ position: 'relative' }} ref={profileMenuRef}>
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
                      {user.profilePic ? (
                          <img src={user.profilePic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                            {user.name?.[0]}
                          </span>
                      )}
                   </div>
                   <ChevronDown size={18} className="hide-mobile-icon" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                   <div className="glass-dropdown animate-fade-in" style={{ 
                      position: 'absolute', top: '120%', right: 0, width: '220px', 
                      borderRadius: '1.5rem', padding: '0.5rem', display: 'flex',
                      flexDirection: 'column', gap: '0.25rem'
                   }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                         <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.name}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      
                      <button onClick={() => navigate('/profile')} className="hover-bg nav-btn">
                         <User size={18} /> Profile
                      </button>
                      <button onClick={handleLogout} className="hover-bg nav-btn" style={{ color: 'var(--danger)' }}>
                         <LogOut size={18} /> Logout
                      </button>
                   </div>
                )}
             </div>
          )}
        </div>
      </nav>

      {/* --- SIDEBAR OVERLAY (Now Internal) --- */}
      {showSidebar && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
            onClick={() => setShowSidebar(false)}
          />
          <div className="sidebar-popout glass-dropdown" style={{
            position: 'fixed', top: '1.5rem', left: '1.5rem', bottom: '1.5rem',
            width: '280px', borderRadius: '1.5rem', zIndex: 201, padding: '2rem', 
            display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 className="font-neon" style={{ fontSize: '2rem', margin: 0, color: 'var(--text-bright)' }}>Menu</h2>
              <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                <X size={28} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <Link to="/" className={`nav-item-pop ${isActive('/') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                <Home size={24} /> Home
              </Link>
              
              {user && (
                <>
                  <Link to="/dashboard" className={`nav-item-pop ${isActive('/dashboard') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                    <LayoutDashboard size={24} /> Dashboard
                  </Link>
                  <Link to="/leads" className={`nav-item-pop ${isActive('/leads') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                    <Layers size={24} /> Leads
                  </Link>
                </>
              )}

              <Link to="/guide" className={`nav-item-pop ${isActive('/guide') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                <BookOpen size={24} /> Guide
              </Link>
              
              {user && (user.role === 'super-admin' || user.role === 'sub-admin') && (
                <Link to="/users" className={`nav-item-pop ${isActive('/users') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                  <Users size={24} /> Team
                </Link>
              )}

              {!user && (
                 <Link to="/login" className={`nav-item-pop ${isActive('/login') ? 'active-pop' : ''}`} onClick={() => setShowSidebar(false)}>
                    <User size={24} /> Login
                 </Link>
              )}
            </nav>
          </div>
        </>
      )}
      
      {/* Styles local to Navbar */}
      <style>{`
         .navbar-container {
            width: 90%;
            max-width: 1200px;
            padding: 0.5rem 2rem;
         }

         .nav-logo-img {
            height: 50px;
            transition: height 0.3s ease;
         }

         .nav-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
            transition: gap 0.3s ease;
         }

         /* MOBILE ADJUSTMENTS */
         @media (max-width: 768px) {
            .navbar-container {
               width: 95%;
               padding: 0.4rem 1rem !important;
            }
            .nav-logo-img {
               height: 32px !important;
            }
            .nav-actions {
               gap: 0.5rem !important;
            }
            .hide-mobile {
                display: none !important;
            }
            .hide-mobile-icon {
                display: none !important;
            }
         }

         .hover-bg:hover { background: rgba(255,255,255,0.08) !important; }
         .nav-btn { background: transparent; border: none; color: var(--text); padding: 0.75rem 1rem; text-align: left; border-radius: 0.75rem; display: flex; gap: 0.75rem; align-items: center; fontSize: 1rem; cursor: pointer; width: 100%; }
         .glass-dropdown { background: rgba(13, 22, 41, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
         .animate-fade-in { animation: fadeIn 0.2s ease-out; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
         
         .nav-item-pop { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 1.25rem; padding: 0.75rem; transition: 0.2s; border-radius: 12px; text-decoration: none; }
         .nav-item-pop:hover { background: rgba(255,255,255,0.05); color: var(--primary); }
         .active-pop { background: rgba(0, 243, 255, 0.1) !important; color: var(--primary) !important; border: 1px solid rgba(0, 243, 255, 0.2); }

         }
      `}</style>
    </>
  );
};

export default Navbar;