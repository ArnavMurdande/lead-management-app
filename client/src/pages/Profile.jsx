import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MagicBento from '../components/MagicBento';
import api from '../utils/api';
import { User, Mail, Lock, Phone, MapPin, Calendar, Camera, Save } from 'lucide-react';

// --- INPUT GROUP COMPONENT ---
const InputGroup = ({ icon: Icon, label, name, type = "text", placeholder, value, onChange }) => (
  <div className="input-group-container">
    <label>{label}</label>
    <div className="input-wrapper">
      <Icon size={18} className="input-icon" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      }));
      setPreview(user.profilePic || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('location', formData.location);
      data.append('dob', formData.dob);
      if (formData.password) data.append('password', formData.password);
      
      if (selectedFile) {
        data.append('profilePic', selectedFile);
      }

      const response = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <h2 className="profile-title">Profile Settings</h2>

      {/* USING CSS CLASS FOR PADDING instead of inline style */}
      <MagicBento className="profile-bento-card">
        
        {/* HEADER */}
        <div className="profile-header">
            <div style={{ position: 'relative' }}>
                <div className="profile-avatar">
                    {preview ? (
                        <img src={preview} alt="Profile" />
                    ) : (
                        <div className="avatar-placeholder">
                            <User size={50} color="var(--primary)" />
                        </div>
                    )}
                </div>
                
                <label className="upload-btn hover-scale">
                    <Camera size={20} color="#000" />
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </label>
            </div>
            
            <div className="profile-info">
                <h3>{user?.name}</h3>
                <span className="role-badge">{user?.role?.toUpperCase()}</span>
            </div>
        </div>

        {message.text && (
            <div className={`message-box ${message.type}`}>
                {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            {/* GRID LAYOUT CONTROLLED BY CSS */}
            <div className="form-grid">
                <InputGroup icon={User} label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                <InputGroup icon={Mail} label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                <InputGroup icon={Phone} label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                <InputGroup icon={MapPin} label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
                <InputGroup icon={Calendar} label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="" />
            </div>

            <div className="security-section">
                <h4>Security</h4>
                <div className="form-grid">
                    <InputGroup icon={Lock} label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
                    <InputGroup icon={Lock} label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-neon save-btn" disabled={loading}>
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>

      </MagicBento>
      
      {/* RESPONSIVE CSS STYLES */}
      <style>{`
        /* Container */
        .profile-page-container {
            max-width: 900px;
            margin: 0 auto;
            padding-bottom: 3rem;
            width: 100%;
        }

        .profile-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            font-family: var(--font-neon);
            text-align: center;
        }

        /* Responsive Bento Card */
        .profile-bento-card {
            width: 100%;
            box-sizing: border-box;
            /* Large padding on desktop, Small on mobile */
            padding: 2.5rem; 
        }

        /* Profile Header */
        .profile-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 3rem;
            text-align: center;
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid var(--primary);
            box-shadow: 0 0 20px var(--primary-glow);
            background: var(--surface);
        }
        
        .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .upload-btn {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: var(--primary);
            border-radius: 50%;
            padding: 0.6rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .hover-scale:hover { transform: scale(1.1); }

        .profile-info h3 {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
            color: white;
        }

        .role-badge {
            color: var(--text-muted);
            font-size: 0.9rem;
            background: rgba(255,255,255,0.05);
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }

        /* Message Box */
        .message-box {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .message-box.error {
            background: rgba(255, 0, 85, 0.1);
            border: 1px solid var(--danger);
            color: #ff8ca8;
        }
        .message-box.success {
            background: rgba(0, 255, 157, 0.1);
            border: 1px solid var(--success);
            color: #00ff9d;
        }

        /* --- GRID SYSTEM --- */
        .form-grid {
            display: grid;
            gap: 1.5rem;
            /* Auto-fit with a minimum width ensures responsiveness */
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .security-section {
            margin-top: 2.5rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .security-section h4 {
            margin-bottom: 1.5rem;
            color: var(--text-bright);
            font-size: 1.1rem;
        }

        .form-actions {
            margin-top: 3rem;
            display: flex;
            justify-content: center;
        }

        .save-btn {
            display: flex;
            gap: 0.75rem;
            padding: 1rem 3rem;
            font-size: 1rem;
            width: 100%;
            max-width: 300px;
            justify-content: center;
        }

        /* --- INPUT GROUPS --- */
        .input-group-container {
            margin-bottom: 0.5rem;
            width: 100%;
        }
        .input-group-container label {
            display: block;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .input-wrapper {
            position: relative;
            height: 50px;
            width: 100%;
        }
        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--primary);
            z-index: 2;
            pointer-events: none;
        }
        .input-field {
            padding-left: 3rem;
            padding-right: 1rem;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            width: 100%;
            height: 100%;
            font-size: 0.95rem;
            color-scheme: dark;
            border-radius: 12px;
            outline: none;
            box-sizing: border-box; /* CRITICAL FIX */
            color: white;
        }

        /* --- MOBILE SPECIFIC OVERRIDES --- */
        @media (max-width: 600px) {
            .profile-bento-card {
                padding: 1.5rem !important; /* Smaller padding on mobile */
            }
            .form-grid {
                /* Force 1 column on small screens to prevent squeezing */
                grid-template-columns: 1fr !important;
                gap: 1rem;
            }
            .profile-title {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
            }
            .profile-avatar {
                width: 100px;
                height: 100px;
            }
        }
      `}</style>
    </div>
  );
};

export default Profile;