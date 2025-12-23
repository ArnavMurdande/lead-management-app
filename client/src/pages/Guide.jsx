import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, LayoutDashboard, Database, BarChart, ArrowLeft, Users, Download, Shield, ShieldCheck, Headset } from 'lucide-react';
import MagicBento from '../components/MagicBento';
import DotGrid from '../components/DotGrid';
import { useAuth } from '../context/AuthContext';

const Guide = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const steps = [
    { icon: <UserPlus size={32} color="var(--primary)" />, title: "1. Register/Login", desc: "Create an account. The first user becomes the Super Admin automatically." },
    { icon: <LayoutDashboard size={32} color="var(--secondary)" />, title: "2. Explore Dashboard", desc: "View real-time stats, lead distribution, and recent activities at a glance." },
    { icon: <Database size={32} color="var(--neon-green)" />, title: "3. Manage Leads", desc: "Add, edit, delete, or import leads from Excel. Use tags to organize them." },
    { icon: <BarChart size={32} color="#ff0055" />, title: "4. Track Progress", desc: "Move leads through stages: New -> Contacted -> Qualified -> Won/Lost." },
    { icon: <Users size={32} color="#facc15" />, title: "5. Team Access", desc: "Admins can manage users and assign roles like Support Agent or Sub-Admin." },
    { icon: <Download size={32} color="#38bdf8" />, title: "6. Secure Export", desc: "Export your filtered lead data to Excel for external reporting." },
  ];

  const roles = [
    {
      title: "Super Admin",
      icon: <Shield size={28} color="#d946ef" />,
      color: "rgba(217, 70, 239, 0.1)",
      borderColor: "#d946ef",
      glowRgb: "217, 70, 239", // Magenta Glow
      perms: ["Full System Access", "Create & Delete Users", "View System Activity Logs", "Manage All Leads & Notes", "Import/Export Data"]
    },
    {
      title: "Sub Admin",
      icon: <ShieldCheck size={28} color="#22d3ee" />,
      color: "rgba(34, 211, 238, 0.1)",
      borderColor: "#22d3ee",
      glowRgb: "34, 211, 238", // Cyan Glow
      perms: ["View & Edit All Leads", "Delete Leads", "Import Leads via Excel", "View Team Member List", "Cannot Delete Users"]
    },
    {
      title: "Support Agent",
      icon: <Headset size={28} color="#94a3b8" />,
      color: "rgba(148, 163, 184, 0.1)",
      borderColor: "#94a3b8",
      glowRgb: "148, 163, 184", // Slate/Gray Glow
      perms: ["View Assigned Leads Only", "Update Lead Status", "Add Personal Notes", "Cannot Delete Leads", "Restricted Dashboard View"]
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#02040a', overflowX: 'hidden', color: '#e2e8f0' }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
         <DotGrid />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text-muted)', 
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
              fontSize: '1rem', padding: '0.5rem'
            }}
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
        </header>

        <div className="animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ 
              fontSize: '3.5rem', fontWeight: '800', 
              background: 'linear-gradient(to right, #fff, #94a3b8)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '1rem', letterSpacing: '-0.02em'
            }}>
              User Guide
            </h1>
            <p style={{ 
              color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Master LeadFlow in a few simple steps.
            </p>
          </div>

          {/* Steps Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '5rem'
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

          {/* Roles Breakdown Section (Now with MagicBento) */}
          <div style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', fontWeight: 'bold', color: 'white' }}>
              Roles & Permissions
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem' 
            }}>
              {roles.map((role, i) => (
                <MagicBento key={i} glowColor={role.glowRgb}>
                    <div style={{ padding: '2rem', height: '100%', position: 'relative' }}>
                        {/* Colored Top Border Strip */}
                        <div style={{ 
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', 
                            background: role.borderColor,
                            boxShadow: `0 0 10px ${role.borderColor}`
                        }}></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.8rem', background: role.color, borderRadius: '10px', color: role.borderColor }}>
                                {role.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{role.title}</h3>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {role.perms.map((perm, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: role.borderColor }}></div>
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>
                </MagicBento>
              ))}
            </div>
          </div>

          {/* Conditional Footer Action */}
          <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
            {!user ? (
                <button 
                  className="btn btn-neon" 
                  onClick={() => navigate('/login')}
                  style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}
                >
                  Login to Start <LogIn size={20} style={{ marginLeft: '10px' }} />
                </button>
            ) : (
                <button 
                  className="btn btn-neon" 
                  onClick={() => navigate('/dashboard')}
                  style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}
                >
                  Go to Dashboard <LayoutDashboard size={20} style={{ marginLeft: '10px' }} />
                </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Guide;