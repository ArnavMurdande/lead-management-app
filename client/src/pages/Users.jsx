import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Edit, Search, X, Shield, User, Mail, Activity, Clock, FileText } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Activity Logs
  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/users/activity');
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to load activity logs. Are you a Super Admin?');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  // Helper: Check if user is "Active" (logged in last 6h)
  const getUserStatus = (lastLogin) => {
    if (!lastLogin) return 'Inactive';
    const sixHours = 6 * 60 * 60 * 1000;
    const isRecent = (new Date() - new Date(lastLogin)) < sixHours;
    return isRecent ? 'Active' : 'Inactive';
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-page-container">
      
      {/* Header */}
      <div className="page-header">
        <div>
           <h2 className="page-title">Team Management</h2>
           <p style={{ color: 'var(--text-muted)' }}>Manage access and roles for your organization.</p>
        </div>
        
        <div className="header-actions">
            {/* Buttons will be side-by-side on mobile due to flex settings in CSS */}
            <button 
                onClick={() => { setShowActivityModal(true); fetchLogs(); }} 
                className="header-btn"
            >
                <Activity size={18} />
                <span className="btn-text">View Activity</span>
            </button>

            <button 
                onClick={() => { setCurrentUser(null); setShowModal(true); }} 
                className="header-btn primary-btn"
            >
                <Plus size={18} />
                <span className="btn-text">Add User</span>
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card search-card">
        <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
                type="text" 
                className="input search-input" 
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear-btn">
                    <X size={16} />
                </button>
            )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card table-card">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>User Profile</th>
                <th style={{ width: '15%' }}>Role</th>
                <th className="hide-mobile" style={{ width: '25%' }}>Email Address</th>
                <th style={{ width: '15%' }}>Status</th> 
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                 const status = getUserStatus(user.lastLogin);
                 return (
                    <tr key={user._id}>
                    <td>
                        <div className="user-cell">
                            <div className="user-avatar">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt={user.name} />
                                ) : (
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-date">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                <div className="user-email-mobile">{user.email}</div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span className={`role-badge ${user.role}`}>
                            {user.role === 'super-admin' && <Shield size={12} />}
                            {user.role.replace('-', ' ').toUpperCase()}
                        </span>
                    </td>

                    <td className="email-cell hide-mobile">
                        {user.email}
                    </td>

                    <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={`status-dot ${status.toLowerCase()}`}></span>
                            <span style={{ color: status === 'Active' ? '#4ade80' : 'var(--text-muted)' }}>
                                {status}
                            </span>
                        </div>
                    </td>

                    <td>
                        <div className="action-buttons">
                        <button 
                            className="btn-icon edit"
                            onClick={() => { setCurrentUser(user); setShowModal(true); }}
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            className="btn-icon delete"
                            onClick={() => handleDelete(user._id)}
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                 );
              })}
              
              {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan="5" className="empty-state">
                        No team members found matching "{searchQuery}"
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <UserModal 
          user={currentUser} 
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchUsers(); }} 
        />
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <ActivityLogModal 
            logs={logs} 
            onClose={() => setShowActivityModal(false)} 
        />
      )}

      <style>{`
        .users-page-container { width: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 3rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-title { font-size: 1.875rem; font-weight: bold; font-family: var(--font-neon); margin-bottom: 0.5rem; }
        
        .header-actions { display: flex; gap: 1rem; }

        .header-btn {
            display: inline-flex; 
            align-items: center; 
            justify-content: center;
            gap: 0.5rem; 
            height: 48px;   
            padding: 0 1.5rem; 
            background: rgba(255, 255, 255, 0.05); 
            color: white; 
            border: 1px solid rgba(255, 255, 255, 0.2); 
            border-radius: 50px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease;
            font-size: 0.9rem;
            white-space: nowrap;
        }

        .header-btn:hover, .header-btn.primary-btn:hover { 
            background: #ccff00; 
            color: black; 
            border-color: #ccff00;
            box-shadow: 0 0 15px rgba(204, 255, 0, 0.4); 
            transform: translateY(-2px);
        }
        
        /* Table Styles */
        .search-card { margin-bottom: 2rem; padding: 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        .search-wrapper { position: relative; max-width: 400px; width: 100%; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-input { padding-left: 3rem; width: 100%; height: 45px; margin-bottom: 0; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; color: white; }
        .clear-btn { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; }

        .table-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; padding: 0; }
        .table-responsive { width: 100%; overflow-x: auto; }
        .users-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .users-table th { background: rgba(0,0,0,0.2); padding: 1.25rem; text-align: left; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 1.25rem; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .users-table tr:last-child td { border-bottom: none; }
        
        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); min-width: 40px; }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name { font-weight: 600; color: white; font-size: 0.95rem; }
        .user-date { font-size: 0.75rem; color: var(--text-muted); }
        .user-email-mobile { display: none; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem; }
        .email-cell { color: var(--text-bright); font-size: 0.95rem; }
        
        .role-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; }
        .role-badge.super-admin { background: rgba(188, 19, 254, 0.15); color: #d946ef; border: 1px solid rgba(188, 19, 254, 0.3); }
        .role-badge.sub-admin { background: rgba(0, 243, 255, 0.15); color: #22d3ee; border: 1px solid rgba(0, 243, 255, 0.3); }
        .role-badge.support-agent { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }

        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem; }
        .status-dot.active { background: #4ade80; box-shadow: 0 0 5px #4ade80; }
        .status-dot.inactive { background: var(--text-muted); opacity: 0.5; }

        .action-buttons { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .btn-icon { padding: 0.5rem; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon.edit { background: rgba(0, 243, 255, 0.1); color: var(--primary); }
        .btn-icon.edit:hover { background: var(--primary); color: black; }
        .btn-icon.delete { background: rgba(255, 0, 85, 0.1); color: var(--danger); }
        .btn-icon.delete:hover { background: var(--danger); color: white; }
        
        .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); font-size: 1rem; }
        .modal-input { width: 100%; height: 48px; padding-left: 3rem; padding-right: 1rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; font-size: 0.95rem; outline: none; box-sizing: border-box; }
        .modal-input:focus { border-color: var(--primary); background: rgba(0, 0, 0, 0.5); }

        /* --- MOBILE OPTIMIZATION --- */
        @media (max-width: 768px) {
            /* 1. Header Layout */
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .header-actions { width: 100%; display: flex; gap: 0.5rem; }
            
            /* 2. Side-by-Side Buttons */
            .header-btn { flex: 1; padding: 0.8rem 0.5rem; height: 44px; font-size: 0.85rem; }
            
            /* 3. Table to Cards */
            .users-table thead { display: none; }
            .users-table tbody, .users-table tr, .users-table td { display: block; width: 100%; }
            .users-table tr { margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.02); padding: 1rem; box-sizing: border-box; }
            .users-table td { padding: 0.5rem 0; border: none; text-align: left; }
            
            .user-cell { margin-bottom: 0.5rem; }
            .user-email-mobile { display: block; }
            .hide-mobile { display: none; }
            
            .action-buttons { justify-content: flex-start; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8rem; }
            
            .users-table td:nth-child(2), /* Role */
            .users-table td:nth-child(4) /* Status */ {
                display: inline-block;
                width: auto;
                padding-right: 1rem;
            }
        }
      `}</style>    </div>
  );
};

// --- ACTIVITY LOG MODAL (Mobile Optimized) ---
const ActivityLogModal = ({ logs, onClose }) => {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem' // Added padding for mobile safety
        }}>
            <div style={{ 
                width: '100%', maxWidth: '700px', maxHeight: '90vh', // Increased max-height
                backgroundColor: '#0d1629', border: '1px solid rgba(255,255,255,0.15)', 
                borderRadius: '16px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} color="var(--primary)" /> Activity Logs
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                        <X size={24} />
                    </button>
                </div>
                
                <div style={{ overflowY: 'auto', padding: '1rem' }}>
                    {logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No activity recorded yet.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} style={{ 
                                display: 'flex', gap: '0.75rem', padding: '0.75rem', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)' 
                            }}>
                                <div style={{ paddingTop: '0.2rem' }}>
                                    {log.action.includes('DELETE') ? <Trash2 size={16} color="var(--danger)" /> :
                                     log.action.includes('CREATE') ? <Plus size={16} color="var(--success)" /> :
                                     log.action.includes('LOGIN') ? <Clock size={16} color="var(--primary)" /> :
                                     <FileText size={16} color="var(--text-muted)" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                                            {log.user ? log.user.name : 'Unknown User'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', wordBreak: 'break-word' }}>{log.details}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- USER MODAL (Mobile Optimized) ---
const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'support-agent'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await api.put(`/users/${user._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      onSave();
    } catch (error) {
      alert('Error saving user: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem' // Added safe area for mobile
    }}>
      <div style={{ 
          width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', // Scrollable on small screens
          backgroundColor: '#0d1629', 
          border: '1px solid rgba(255,255,255,0.15)', 
          borderRadius: '16px',
          padding: '1.5rem', // Reduced padding
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-neon)', margin: 0, color: 'white' }}>
              {user ? 'Edit Member' : 'Add Member'}
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input className="modal-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Jane Doe" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input className="modal-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="e.g. jane@company.com" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500' }}>
                    Password {user && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Leave blank to keep current)</span>}
                </label>
                <input className="modal-input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!user} placeholder="••••••••" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500' }}>Role</label>
                <select className="modal-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="support-agent">Support Agent</option>
                  <option value="sub-admin">Sub Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;