import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle, Shield, BarChart, Users, Globe, Target, Smartphone } from 'lucide-react';
import Squares from '../components/Squares'; // <--- CHANGED THIS
import MagicBento from '../components/MagicBento';
import Navbar from '../components/Navbar'; 

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      
      {/* Background Animation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {/* REPLACED LIQUID ETHER WITH SQUARES */}
        <Squares 
            speed={0.5} 
            squareSize={40}
            direction='diagonal' 
            borderColor='rgba(255, 255, 255, 0.15)' 
            hoverFillColor='#00fffbff'
        />
      </div>

      {/* --- SHARED NAVBAR --- */}
      <Navbar />

      {/* --- MAIN LANDING CONTENT --- */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Hero Section */}
        <div className="container" style={{ padding: '14rem 1rem 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '80vh' }}>
           
           {/* Logo Animation */}
           <div style={{ position: 'relative', width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
              <div className="animate-spin-slow" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <defs>
                      <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text fontSize="5.7" fill="var(--neon-green)" fontWeight="900" letterSpacing="1.8" fontFamily="Space Grotesk">
                      <textPath xlinkHref="#circle">SMART LEAD • SMOOTHER FLOW • STRONGER GROWTH •</textPath>
                    </text>
                  </svg>
              </div>
              <div className="glass-panel" style={{ width: '180px', height: '180px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(0, 243, 255, 0.25)', border: '2px solid var(--primary)' }}>
                 <h1 className="font-neon" style={{ fontFamily: "Space Grotesk", fontSize: '2.3rem', fontWeight: '900', margin: 0, color: 'white', letterSpacing: '-1px' }}>LeadFlow</h1>
              </div>
           </div>

           <p style={{ fontFamily: "Space Grotesk", fontSize: '1.4rem', color: 'var(--text-bright)', marginBottom: '1rem', maxWidth: '650px', textShadow: '0 0 15px rgba(0,0,0,0.8)' }}>
              The ultimate CRM ecosystem for high-velocity sales teams.
           </p>
           <p style={{fontFamily: "Space Grotesk", color: 'var(--text-muted)', maxWidth: '500px', fontSize: '1.0rem', lineHeight: '1.6' }}>
              Stop losing leads in the chaos. Organize, track, and close deals with a platform designed for speed and clarity.
           </p>
        </div>

        {/* Why LeadFlow Section */}
        <div style={{ padding: '6rem 1rem', background: 'rgba(2, 4, 10, 0.6)', backdropFilter: 'blur(2.5px)' }}>
          <div className="container">
            <h2 className="font-neon" style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '4rem', color: 'var(--text-bright)' }}>
              Why <span style={{ color: 'var(--primary)' }}>LeadFlow?</span>
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2.5rem',
                justifyContent: 'center' 
            }}>
              <MagicBento className="card" glowColor="0, 243, 255">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}><Zap size={48} style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} /></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Instant Velocity</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Built on a high-performance stack to ensure your data loads instantly. No lag, just sales.</p>
                </div>
              </MagicBento>

              <MagicBento className="card" glowColor="188, 19, 254">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}><CheckCircle size={48} style={{ filter: 'drop-shadow(0 0 10px var(--secondary))' }} /></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Precision Tracking</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Never drop the ball. Status tracking, interaction logs, and activity history in one view.</p>
                </div>
              </MagicBento>

              <MagicBento className="card" glowColor="0, 255, 157">
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}><Shield size={48} style={{ filter: 'drop-shadow(0 0 10px var(--success))' }} /></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-bright)' }}>Ironclad Security</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Role-based access control and encrypted data ensures your leads remain yours alone.</p>
                </div>
              </MagicBento>
            </div>
          </div>
        </div>

        {/* Section 3: EXPANDED Content */}
        <div style={{ padding: '8rem 1rem', position: 'relative', backdropFilter: 'blur(1px)' }}>
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
        <footer style={{ padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', background: '#010205', marginTop: 'auto' }}>
          <p>&copy; {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
};

export default Landing;