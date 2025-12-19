import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="brand" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LeadFlow</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Manage Leads Like a Pro
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Streamline your sales process, track every interaction, and close more deals with our intuitive lead management system.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <button className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }} onClick={() => navigate('/login')}>
            Start Free Trial <ArrowRight size={20} />
          </button>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          <div className="card">
            <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Zap size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lightning Fast</h3>
            <p style={{ color: 'var(--text-muted)' }}>Optimized for speed so you never miss a follow-up opportunity.</p>
          </div>
          <div className="card">
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}><CheckCircle size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Task Tracking</h3>
            <p style={{ color: 'var(--text-muted)' }}>Keep track of every call, email, and meeting with built-in activity logging.</p>
          </div>
          <div className="card">
            <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><Shield size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Secure & Reliable</h3>
            <p style={{ color: 'var(--text-muted)' }}>Enterprise-grade security to keep your customer data safe and sound.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
