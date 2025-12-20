import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LiquidEther from '../components/LiquidEther';
import MagicBento from '../components/MagicBento';
import textLogo from '../assets/Text.png';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const { data } = await api.post('/auth/google', {
            token: credentialResponse.credential
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/dashboard'; 
    } catch (err) {
        console.error("Google Auth Error:", err);
        setError('Google Login Failed. Please try again.');
    }
  };

  // Shared Styles for the Input Box Container
  const inputBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    height: '50px',
    padding: '0 12px', // Padding around the whole box
    marginBottom: '1.25rem',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      
      {/* Background Animation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.6 }}>
        <LiquidEther
            colors={['#02040a', '#00f3ff', '#bc13fe']}
            mouseForce={20}
            cursorSize={120}
            isViscous={false}
        />
      </div>

      {/* Centered Card */}
      <div style={{ 
          position: 'relative', zIndex: 10, minHeight: '100vh', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
      }}>
        <MagicBento className="card" glowColor="0, 243, 255" style={{ width: '100%', maxWidth: '400px', padding: '0' }}>
            <div style={{ padding: '2.5rem 2rem' }}>
                
                {/* Header Image */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img 
                        src={textLogo} 
                        alt="LeadFlow" 
                        style={{ 
                            height: '80px', 
                            objectFit: 'contain',
                            filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(0,243,255,0.3))' 
                        }} 
                    />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Welcome back, Commander.
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        background: 'rgba(255, 0, 85, 0.15)', border: '1px solid var(--danger)',
                        color: '#ff8ca8', padding: '0.75rem', borderRadius: '0.5rem',
                        marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* EMAIL INPUT - Flexbox Layout */}
                    <div style={inputBoxStyle}>
                        <Mail size={20} style={{ color: 'var(--text-muted)', minWidth: '24px' }} />
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 12px' }}></div>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email address"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                width: '100%',
                                height: '100%',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    {/* PASSWORD INPUT - Flexbox Layout */}
                    <div style={{ ...inputBoxStyle, marginBottom: '2rem' }}>
                        <Lock size={20} style={{ color: 'var(--text-muted)', minWidth: '24px' }} />
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 12px' }}></div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                width: '100%',
                                height: '100%',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                background: 'none', border: 'none', 
                                color: 'var(--text-muted)', cursor: 'pointer',
                                padding: '4px', display: 'flex'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button type="submit" className="btn btn-neon" style={{ width: '100%', height: '48px', borderRadius: '8px', fontSize: '1rem' }}>
                        Login to Dashboard <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    {/* GOOGLE BUTTON - Centered and Safe Width */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="260" /* Reduced to 260px to prevent mobile clipping */
                        />
                    </div>
                </form>
            </div>
        </MagicBento>
      </div>
    </div>
  );
};

export default Login;