import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Lock, Save } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth(); // We might need to update user context after save
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const { data } = await api.put(`/users/${user._id}`, updateData);
      
      // Update local storage user if name/email changed
      const updatedUser = { ...user, name: data.name, email: data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Force reload or update context would be better, but for now reload to reflect changes
      window.location.reload(); 
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Profile</h2>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user?.name?.[0]}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{user?.name}</h3>
            <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>

        {message.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            color: message.type === 'error' ? 'var(--danger)' : 'var(--success)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="input" 
                style={{ paddingLeft: '2.5rem' }} 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="input" 
                style={{ paddingLeft: '2.5rem' }} 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2rem 0', paddingTop: '2rem' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Change Password</h4>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  className="input" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="Leave blank to keep current"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
