import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Calendar, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    status: '', 
    search: '', 
    tags: '',
    assignedTo: '',
    startDate: '',
    endDate: ''
  });
  const [agents, setAgents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const { data } = await api.get(`/leads?${params.toString()}`);
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (user?.role === 'super-admin' || user?.role === 'sub-admin') {
      try {
        const { data } = await api.get('/users');
        // Filter out super-admins if needed, but showing all is fine for assignment usually
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, [filters, user]); // Refetch when filters change

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        alert('Error deleting lead');
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.tags) params.append('tags', filters.tags);
      
      const response = await api.get(`/leads/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert('Error exporting leads');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchLeads();
      alert('Leads imported successfully');
    } catch (error) {
      alert('Error importing leads');
    }
  };

  const clearFilters = () => {
    setFilters({ 
      status: '', 
      search: '', 
      tags: '',
      assignedTo: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Leads Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
            <>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                <Upload size={18} />
                Import
                <input type="file" hidden accept=".xlsx,.xls" onChange={handleImport} />
              </label>
              <button onClick={handleExport} className="btn" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Download size={18} />
                Export
              </button>
            </>
          )}
          <button onClick={() => { setCurrentLead(null); setShowModal(true); }} className="btn btn-primary">
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search leads..."
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <button 
            className={`btn ${showFilters ? 'btn-primary' : ''}`}
            style={{ border: '1px solid var(--border)', backgroundColor: showFilters ? '' : 'var(--background)' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
          </button>

          {(filters.status || filters.tags || filters.assignedTo || filters.startDate) && (
             <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={clearFilters}>
                <X size={18} />
             </button>
          )}
        </div>

        {showFilters && (
          <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status</label>
              <select
                className="input"
                style={{ marginBottom: 0 }}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
                <option value="Won">Won</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tags</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. vip, urgent"
                style={{ marginBottom: 0 }}
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              />
            </div>

            {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Assigned Agent</label>
                <select
                  className="input"
                  style={{ marginBottom: 0 }}
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                >
                  <option value="">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="date"
                  className="input"
                  style={{ marginBottom: 0 }}
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <input
                  type="date"
                  className="input"
                  style={{ marginBottom: 0 }}
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Source</th>
                <th>Tags</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
                  </td>
                  <td>{lead.email}</td>
                  <td>
                    <span className={`badge badge-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.source}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {lead.tags?.map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--border)', borderRadius: '4px' }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {lead.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                           {lead.assignedTo.name.charAt(0)}
                         </div>
                         <span>{lead.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem', color: 'var(--primary)' }}
                        onClick={() => { setCurrentLead(lead); setShowModal(true); }}
                      >
                        <Edit size={18} />
                      </button>
                      {(user?.role === 'super-admin' || user?.role === 'sub-admin') && (
                        <button 
                          className="btn" 
                          style={{ padding: '0.25rem', color: 'var(--danger)' }}
                          onClick={() => handleDelete(lead._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                   <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No leads found matching your criteria.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <LeadModal 
          lead={currentLead} 
          agents={agents}
          currentUser={user}
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchLeads(); }} 
        />
      )}
    </div>
  );
};

const LeadModal = ({ lead, agents, currentUser, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || '',
    status: lead?.status || 'New',
    tags: lead?.tags?.join(', ') || '',
    assignedTo: lead?.assignedTo?._id || lead?.assignedTo || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      
      // Remove assignedTo if empty string to avoid casting error if backend expects ObjectId
      if (!data.assignedTo) delete data.assignedTo;

      if (lead) {
        await api.put(`/leads/${lead._id}`, data);
      } else {
        await api.post('/leads', data);
      }
      onSave();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving lead');
    }
  };

  const isAdmin = currentUser?.role === 'super-admin' || currentUser?.role === 'sub-admin';

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
      <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {lead ? 'Edit Lead' : 'New Lead'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
              <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input className="input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Source</label>
              <input className="input" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
              <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
                <option value="Won">Won</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags (comma separated)</label>
            <input className="input" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. hot, tech, referral" />
          </div>

          {isAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign To</label>
              <select 
                className="input" 
                value={formData.assignedTo} 
                onChange={e => setFormData({...formData, assignedTo: e.target.value})}
              >
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>{agent.name} ({agent.role})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Leads;
