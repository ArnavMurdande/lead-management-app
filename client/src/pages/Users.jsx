import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Edit } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>User Management</h2>
        <button onClick={() => { setCurrentUser(null); setShowModal(true); }} className="btn btn-primary">
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem', color: 'var(--primary)' }}
                        onClick={() => { setCurrentUser(user); setShowModal(true); }}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal 
          user={currentUser} 
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchUsers(); }} 
        />
      )}
    </div>
  );
};

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
      alert('Error saving user');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {user ? 'Edit User' : 'New User'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input className="input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password {user && '(leave blank to keep current)'}</label>
            <input className="input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!user} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
            <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="support-agent">Support Agent</option>
              <option value="sub-admin">Sub Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;
