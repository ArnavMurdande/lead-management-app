import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import MagicBento from './MagicBento';

const CustomAlert = ({ isOpen, onClose, title, message, type = 'error' }) => {
  if (!isOpen) return null;

  // Auto-close success messages after 3 seconds, keep errors open until closed
  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={32} color="#4ade80" />;
      case 'warning': return <AlertTriangle size={32} color="#facc15" />;
      case 'security': return <ShieldAlert size={32} color="#ef4444" />;
      default: return <AlertTriangle size={32} color="#ef4444" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '74, 222, 128'; // Green
      case 'warning': return '250, 204, 21'; // Yellow
      case 'security': return '239, 68, 68'; // Red
      default: return '239, 68, 68'; // Red
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      
      <div onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', animation: 'popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <MagicBento glowColor={getColor()}>
          <div style={{ padding: '1.5rem', position: 'relative', border: `1px solid rgba(${getColor()}, 0.3)` }}>
            
            <button 
              onClick={onClose}
              style={{ 
                position: 'absolute', top: '1rem', right: '1rem', 
                background: 'none', border: 'none', color: 'var(--text-muted)', 
                cursor: 'pointer' 
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', borderRadius: '50%', 
                background: `rgba(${getColor()}, 0.1)`,
                boxShadow: `0 0 20px rgba(${getColor()}, 0.2)`
              }}>
                {getIcon()}
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                  {message}
                </p>
              </div>

              <button 
                onClick={onClose}
                style={{
                  marginTop: '0.5rem', padding: '0.6rem 2rem',
                  background: `rgba(${getColor()}, 0.15)`,
                  color: `rgb(${getColor()})`,
                  border: `1px solid rgba(${getColor()}, 0.3)`,
                  borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = `rgba(${getColor()}, 0.25)`}
                onMouseOut={(e) => e.currentTarget.style.background = `rgba(${getColor()}, 0.15)`}
              >
                {type === 'success' ? 'Great!' : 'Understood'}
              </button>
            </div>
          </div>
        </MagicBento>
      </div>
    </div>
  );
};

export default CustomAlert;