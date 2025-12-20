/* */
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, LayoutDashboard, Database, BarChart, ArrowLeft, Users, Download } from 'lucide-react';
import MagicBento from '../components/MagicBento';
import DotGrid from '../components/DotGrid'; 

const Guide = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: <UserPlus size={32} color="var(--primary)" />, title: "1. Register/Login", desc: "Create an account. The first user becomes the Super Admin automatically." },
    { icon: <LayoutDashboard size={32} color="var(--secondary)" />, title: "2. Explore Dashboard", desc: "View real-time stats, lead distribution, and recent activities at a glance." },
    { icon: <Database size={32} color="var(--neon-green)" />, title: "3. Manage Leads", desc: "Add, edit, delete, or import leads from Excel. Use tags to organize them." },
    { icon: <BarChart size={32} color="#ff0055" />, title: "4. Track Progress", desc: "Move leads through stages: New -> Contacted -> Qualified -> Won/Lost." },
    { icon: <Users size={32} color="#facc15" />, title: "5. Team Access", desc: "Admins can manage users and assign roles like Support Agent or Sub-Admin." },
    { icon: <Download size={32} color="#38bdf8" />, title: "6. Secure Export", desc: "Download your lead data to Excel instantly for offline analysis or reporting." }
  ];

  return (
    // FIXED: Removed "container" class from here so it spans full width
    <div className="guide-page" style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Background now spans full width because parent is full width */}
      <DotGrid />

      {/* Content wrapper: Added "container" here to center the text/cards */}
      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '8rem', paddingBottom: '4rem' }}>
          
          {/* Back to Home Button */}
          <div style={{ position: 'absolute', top: '2rem', left: '0' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem',
                cursor: 'pointer', transition: 'color 0.3s'
              }}
              className="hover-bright"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
          </div>
          <style>{`.hover-bright:hover { color: var(--text-bright) !important; }`}</style>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 className="font-neon" style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-bright)' }}>
              Getting Started
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
              Master LeadFlow in 6 simple steps.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {steps.map((step, index) => (
              <MagicBento key={index} className="card" glowColor="0, 243, 255">
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', width: 'fit-content' }}>
                      {step.icon}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{step.title}</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>{step.desc}</p>
                </div>
              </MagicBento>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-neon" 
              onClick={() => navigate('/login')}
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            >
              <LogIn size={20} style={{ marginRight: '8px' }} />
              Go to Login
            </button>
          </div>
      </div>
    </div>
  );
};

export default Guide;