import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, CheckCircle, Shield, BarChart, Users, Globe, Target, Smartphone, User, LogOut, ChevronDown, LayoutDashboard, Layers, X, BookOpen } from 'lucide-react';
import LiquidEther from '../components/LiquidEther';
import MagicBento from '../components/MagicBento';
import waveLogo from '../assets/Wave.png';
import textLogo from '../assets/Text.png';

const Landing = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setShowSidebar(false);
  };

  const toggleSidebar = () => {
    if (user) {
        setShowSidebar(!showSidebar);
    } else {
        navigate('/login');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      
      {/* Background Animation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }}>
        <LiquidEther
            colors={['#02040a', '#00f3ff', '#bc13fe']}
            mouseForce={20}
            cursorSize={120}
            isViscous={false}
            viscous={20}
            iterationsViscous={20} 
            iterationsPoisson={20} 
            resolution={0.25} 
            autoDemo={true}
            autoSpeed={0.2}
        />
      </div>

      {/* Blur Layer Overlay */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        zIndex: 0, backdropFilter: 'blur(8px)', pointerEvents: 'none'
      }}></div>

      {/* --- SIDEBAR OVERLAY (Pop-out on Wave Logo Click) --- */}
      {showSidebar && user && (
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
              <Link to="/dashboard" className="nav-item-pop" onClick={() => setShowSidebar(false)}>
                <LayoutDashboard size={24} /> Dashboard
              </Link>
              <Link to="/leads" className="nav-item-pop" onClick={() => setShowSidebar(false)}>
                <Layers size={24} /> Leads
              </Link>
              
              {/* ADDED GUIDE HERE */}
              <Link to="/guide" className="nav-item-pop" onClick={() => setShowSidebar(false)}>
                <BookOpen size={24} /> Guide
              </Link>

              {user.role !== 'support-agent' && (
                <Link to="/users" className="nav-item-pop" onClick={() => setShowSidebar(false)}>
                  <Users size={24} /> Team
                </Link>
              )}
            </nav>
          </div>
          <style>{`
            .nav-item-pop { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 1.25rem; padding: 0.75rem; transition: 0.2s; border-radius: 12px; text-decoration: none; }
            .nav-item-pop:hover { background: rgba(255,255,255,0.05); color: var(--primary); }
            .glass-dropdown { background: rgba(13, 22, 41, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
          `}</style>
        </>
      )}

      {/* --- FLOATING GLASS NAVBAR --- */}
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
        background: scrolled ? 'rgba(13, 22, 41, 0.7)' : 'rgba(13, 22, 41, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {/* Wave Logo */}
             <div 
                onClick={toggleSidebar}
                style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }}
             >
                <img src={waveLogo} alt="Logo" style={{ width: '60px', height: '60px' }} />
             </div>
             
             {/* Text Logo */}
             <div 
               onClick={() => navigate('/')}
               style={{ cursor: 'pointer' }}
             >
                <img src={textLogo} alt="LeadFlow" style={{ height: '50px', filter: 'brightness(1.5)' }} />
             </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {!user ? (
            <>
              <button 
                className="btn btn-neon" 
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="btn btn-neon" 
                onClick={() => navigate('/guide')} 
              >
                Get Started
              </button>
            </>
          ) : (
             <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ 
                     background: 'transparent',
                     border: 'none',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.75rem',
                     color: 'white',
                     cursor: 'pointer'
                  }}
                >
                   {/* PROFILE PICTURE CHECK */}
                   <div style={{ 
                      width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', 
                      background: 'var(--surface)', border: '2px solid var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                   }}>
                      {user.profilePic ? (
                          <img src={user.profilePic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                            {user.name[0]}
                          </span>
                      )}
                   </div>
                   <ChevronDown size={18} />
                </button>

                {showProfileMenu && (
                   <div className="glass-dropdown animate-fade-in" style={{ 
                      position: 'absolute', 
                      top: '120%', 
                      right: 0, 
                      width: '220px', 
                      borderRadius: '1.5rem', 
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                   }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                         <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.name}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      
                      <button 
                         onClick={() => navigate('/profile')}
                         style={{ 
                            background: 'transparent', border: 'none', color: 'var(--text)', 
                            padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0.75rem',
                            display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1rem' 
                         }}
                         className="hover-bg"
                      >
                         <User size={18} /> Profile
                      </button>
                      <button 
                         onClick={handleLogout}
                         style={{ 
                            background: 'transparent', border: 'none', color: 'var(--danger)', 
                            padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0.75rem',
                            display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1rem' 
                         }}
                         className="hover-bg"
                      >
                         <LogOut size={18} /> Logout
                      </button>
                   </div>
                )}
             </div>
          )}
        </div>
      </nav>

      {/* Internal CSS for dropdown hover */}
      <style>{`
         .hover-bg:hover { background: rgba(255,255,255,0.08) !important; }
         .animate-fade-in { animation: fadeIn 0.2s ease-out; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Section 1: Hero */}
        <div className="container" style={{ 
           padding: '14rem 1rem 6rem', 
           display: 'flex', 
           flexDirection: 'column', 
           alignItems: 'center', 
           justifyContent: 'center',
           textAlign: 'center',
           minHeight: '80vh'
        }}>
           
           {/* Rotating Text Container */}
           <div style={{ position: 'relative', width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
              
              {/* Rotating SVG Ring */}
              <div className="animate-spin-slow" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <defs>
                      <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text fontSize="5.7" fill="var(--neon-green)" fontWeight="900" letterSpacing="1.8" fontFamily="Space Grotesk">
                      <textPath xlinkHref="#circle">
                        SMART LEAD • SMOOTHER FLOW • STRONGER GROWTH •
                      </textPath>
                    </text>
                  </svg>
              </div>

              {/* Central Pill */}
              <div className="glass-panel" style={{ 
                 width: '180px', 
                 height: '180px', 
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 boxShadow: '0 0 60px rgba(0, 243, 255, 0.25)',
                 border: '2px solid var(--primary)'
              }}>
                 <h1 className="font-neon" style={{ 
                    fontFamily: "Space Grotesk",
                    fontSize: '2.3rem', 
                    fontWeight: '900', 
                    margin: 0, 
                    color: 'white',
                    letterSpacing: '-1px'
                 }}>
                    LeadFlow
                 </h1>
              </div>
           </div>

           <p style={{ 
              fontFamily: "Space Grotesk",
              fontSize: '1.4rem', 
              color: 'var(--text-bright)', 
              marginBottom: '1rem', 
              maxWidth: '650px',
              textShadow: '0 0 15px rgba(0,0,0,0.8)'
           }}>
              The ultimate CRM ecosystem for high-velocity sales teams.
           </p>
           <p style={{fontFamily: "Space Grotesk", color: 'var(--text-muted)', maxWidth: '500px', fontSize: '1.0rem', lineHeight: '1.6' }}>
              Stop losing leads in the chaos. Organize, track, and close deals with a platform designed for speed and clarity.
           </p>

        </div>

        {/* Section 2: Why LeadFlow Cards */}
        <div style={{ padding: '6rem 1rem', background: 'rgba(2, 4, 10, 0.6)', backdropFilter: 'blur(10px)' }}>
          <div className="container">
            <h2 className="font-neon" style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '4rem', color: 'var(--text-bright)' }}>
              Why <span style={{ color: 'var(--primary)' }}>LeadFlow?</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
              
              <MagicBento className="card" glowColor="0, 243, 255">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <Zap size={48} style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Instant Velocity</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Built on a high-performance stack to ensure your data loads instantly. No lag, just sales.
                  </p>
                </div>
              </MagicBento>

              <MagicBento className="card" glowColor="188, 19, 254">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    <CheckCircle size={48} style={{ filter: 'drop-shadow(0 0 10px var(--secondary))' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Precision Tracking</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Never drop the ball. Status tracking, interaction logs, and activity history in one view.
                  </p>
                </div>
              </MagicBento>

              <MagicBento className="card" glowColor="0, 255, 157">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
                    <Shield size={48} style={{ filter: 'drop-shadow(0 0 10px var(--success))' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Ironclad Security</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Role-based access control and encrypted data ensures your leads remain yours alone.
                  </p>
                </div>
              </MagicBento>

            </div>
          </div>
        </div>

        {/* Section 3: EXPANDED Content */}
        <div style={{ padding: '8rem 1rem', position: 'relative' }}>
          <div className="container">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
                   <div style={{ flex: 1, minWidth: '300px' }}>
                      <h3 className="font-neon" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '1.5rem' }}>
                        Visual Data <br/>
                        <span style={{ color: 'var(--primary)' }}>Mastery</span>
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Ditch the spreadsheets. Our interactive dashboard gives you a bird's-eye view of your funnel health, agent performance, and conversion metrics in real-time.
                      </p>
                      <ul style={{ marginTop: '1.5rem', color: 'var(--text-muted)', listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)'}}></div> Real-time conversion rates</li>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)'}}></div> Agent leaderboard</li>
                      </ul>
                   </div>
                   <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                      <MagicBento 
                        className="card" 
                        glowColor="0, 243, 255"
                        style={{ padding: '4rem', borderRadius: '50%', border: '2px solid var(--primary)', boxShadow: '0 0 50px rgba(0, 243, 255, 0.1)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                         <BarChart size={100} color="var(--primary)" />
                      </MagicBento>
                   </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap-reverse' }}>
                   <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                      <MagicBento 
                        className="card" 
                        glowColor="188, 19, 254"
                        style={{ padding: '4rem', borderRadius: '50%', border: '2px solid var(--secondary)', boxShadow: '0 0 50px rgba(188, 19, 254, 0.1)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                         <Users size={100} color="var(--secondary)" />
                      </MagicBento>
                   </div>
                   <div style={{ flex: 1, minWidth: '300px' }}>
                      <h3 className="font-neon" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '1.5rem' }}>
                        Team <br/>
                        <span style={{ color: 'var(--secondary)' }}>Synergy</span>
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Assign leads effortlessly. Admins have full control, while agents get a focused view of their tasks. Perfect harmony for your sales floor.
                      </p>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                   <MagicBento className="card" glowColor="204, 255, 0">
                      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Globe size={40} color="var(--neon-green)" style={{ marginBottom: '1.5rem' }} />
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Global Access</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Access your data from anywhere in the world with our cloud-first architecture.</p>
                      </div>
                   </MagicBento>

                   <MagicBento className="card" glowColor="204, 255, 0">
                      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Target size={40} color="var(--neon-green)" style={{ marginBottom: '1.5rem' }} />
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Lead Scoring</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Smart tags help you prioritize the hottest leads first.</p>
                      </div>
                   </MagicBento>

                   <MagicBento className="card" glowColor="204, 255, 0">
                      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Smartphone size={40} color="var(--neon-green)" style={{ marginBottom: '1.5rem' }} />
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Mobile First</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Fully optimized for mobile devices so you can close deals on the go.</p>
                      </div>
                   </MagicBento>
                </div>
             </div>
          </div>
        </div>

        {/* Section 4: Join Now */}
        <div style={{ 
          padding: '8rem 1rem', 
          textAlign: 'center', 
          background: 'linear-gradient(to top, var(--background), rgba(0, 243, 255, 0.05))',
          marginTop: 'auto',
          borderTop: '1px solid var(--border)'
        }}>
          <h2 className="font-neon" style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-bright)' }}>
            Ready to <span style={{ color: 'var(--primary)' }}>Glow Up</span> your Sales?
          </h2>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            Join the professionals who have switched to LeadFlow.
          </p>
          <button 
            className="btn btn-neon" 
            style={{ fontSize: '1.25rem', padding: '1.2rem 4rem' }} 
            onClick={() => navigate('/guide')}
          >
            Start Now <ArrowRight style={{ marginLeft: '10px' }} />
          </button>
        </div>

        {/* Footer */}
        <footer style={{ padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', background: '#010205' }}>
          <p>&copy; {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
};

export default Landing;