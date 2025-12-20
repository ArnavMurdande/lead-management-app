import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, Upload, Download, Search, Filter, Trash2, Edit, X, User, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); 
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  // --- FETCH DATA ---
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      }).toString();

      const { data } = await api.get(`/leads?${query}`);
      
      // Handle response structure (Supports both paginated and non-paginated)
      if (data.leads) {
        setLeads(data.leads);
        setTotalPages(data.pagination.pages);
      } else {
        setLeads(data); // Fallback
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (['super-admin', 'sub-admin'].includes(user.role)) {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (e) { console.error(e); }
    }
  };

  useEffect(() => { fetchLeads(); }, [page, filters]);
  useEffect(() => { fetchUsers(); }, []);

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (window.confirm('Delete this lead permanently?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleExport = async () => {
    try {
        const query = new URLSearchParams(filters).toString();
        const response = await api.get(`/leads/export?${query}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'leads_export.xlsx');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        alert("Export failed");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/leads/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchLeads();
      alert('Import successful!');
    } catch (error) {
      alert('Import failed');
    }
  };

  return (
    <div className="leads-container">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Lead Management</h2>
          <p className="page-subtitle">Manage your pipeline efficiently.</p>
        </div>
        
        <div className="action-bar">
           <label className="btn-secondary">
              <Upload size={16} /> <span className="hide-mobile">Import</span>
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
           </label>
           <button onClick={handleExport} className="btn-secondary">
              <Download size={16} /> <span className="hide-mobile">Export</span>
           </button>
           <button onClick={() => { setCurrentLead(null); setShowModal(true); }} className="btn-primary">
              <Plus size={18} /> Add Lead
           </button>
        </div>
      </div>

      {/* --- FILTER TOGGLE (MOBILE) --- */}
      <div className="mobile-filter-toggle">
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary full-width">
            <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className={`filters-wrapper ${showFilters ? 'open' : ''}`}>
        <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
            />
        </div>
        
        <div className="filters-group">
            <select 
                value={filters.status} 
                onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                className="custom-select"
            >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
                <option value="Won">Won</option>
            </select>

            <div className="date-group">
                <div className="date-input-wrapper">
                    <Calendar size={14} className="date-icon" />
                    <input 
                        type="date" 
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value, page: 1})} 
                    />
                </div>
                <span style={{color: 'var(--text-muted)'}}>-</span>
                <div className="date-input-wrapper">
                    <Calendar size={14} className="date-icon" />
                    <input 
                        type="date" 
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value, page: 1})} 
                    />
                </div>
            </div>
        </div>
      </div>

      {/* --- DATA DISPLAY --- */}
      <div className="data-card">
        {loading ? (
            <div className="loading-state">Loading leads...</div>
        ) : leads.length === 0 ? (
            <div className="empty-state">No leads found.</div>
        ) : (
            <>
            {/* Desktop Table */}
            <div className="table-responsive hide-mobile">
                <table className="leads-table">
                    <thead>
                    <tr>
                        <th>Lead Details</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Assigned To</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leads.map(lead => (
                        <tr key={lead._id}>
                        <td>
                            <div className="lead-name">{lead.name}</div>
                            <div className="lead-email">{lead.email}</div>
                            <div className="lead-phone">{lead.phone}</div>
                        </td>
                        <td><span className={`status-badge ${lead.status.toLowerCase()}`}>{lead.status}</span></td>
                        <td>{lead.source}</td>
                        <td>
                            {lead.assignedTo ? (
                                <div className="agent-tag"><User size={12} /> {lead.assignedTo.name}</div>
                            ) : <span className="unassigned">Unassigned</span>}
                        </td>
                        <td>
                            <div className="actions-cell">
                                <button className="btn-icon" onClick={() => { setCurrentLead(lead); setShowModal(true); }}>
                                    <Edit size={16} />
                                </button>
                                <button className="btn-icon delete" onClick={() => handleDelete(lead._id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards (Replaces Table on Mobile) */}
            <div className="mobile-cards show-mobile">
                {leads.map(lead => (
                    <div key={lead._id} className="lead-card">
                        <div className="card-top">
                            <div>
                                <div className="card-title">{lead.name}</div>
                                <div className="card-sub">{lead.email}</div>
                            </div>
                            <span className={`status-badge ${lead.status.toLowerCase()}`}>{lead.status}</span>
                        </div>
                        <div className="card-details">
                            <div className="detail-row"><span>Phone:</span> {lead.phone}</div>
                            <div className="detail-row"><span>Source:</span> {lead.source}</div>
                            <div className="detail-row">
                                <span>Assigned:</span> 
                                {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                            </div>
                        </div>
                        <div className="card-actions">
                            <button onClick={() => { setCurrentLead(lead); setShowModal(true); }} className="btn-card">Edit / Notes</button>
                            <button onClick={() => handleDelete(lead._id)} className="btn-card delete">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination-bar">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-page">
                    <ChevronLeft size={16} /> Prev
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-page">
                    Next <ChevronRight size={16} />
                </button>
            </div>
            </>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <LeadModal 
            lead={currentLead} 
            users={users}
            userRole={user.role}
            onClose={() => setShowModal(false)} 
            onSave={() => { fetchLeads(); setShowModal(false); }} 
        />
      )}

      {/* --- CSS --- */}
      <style>{`
        .leads-container { width: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 4rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-title { font-size: 1.8rem; font-weight: bold; margin: 0; color: white; font-family: var(--font-neon); }
        .page-subtitle { color: var(--text-muted); margin-top: 0.25rem; }
        
        .action-bar { display: flex; gap: 0.75rem; }
        .btn-primary { background: var(--primary); color: black; padding: 0.6rem 1.2rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.2s; }
        .btn-primary:hover { background: #ccff00; box-shadow: 0 0 15px rgba(204, 255, 0, 0.4); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }

        .mobile-filter-toggle { display: none; margin-bottom: 1rem; }
        .filters-wrapper { background: rgba(13, 22, 41, 0.6); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; align-items: center; }
        
        .search-input-wrapper { flex: 2; position: relative; min-width: 250px; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-input-wrapper input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem 0.75rem 0.75rem 2.5rem; color: white; outline: none; }
        
        .filters-group { display: flex; gap: 1rem; flex: 3; flex-wrap: wrap; }
        .custom-select { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem; border-radius: 8px; outline: none; min-width: 140px; }
        .date-group { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.25rem 0.5rem; }
        .date-input-wrapper { display: flex; align-items: center; position: relative; }
        .date-icon { position: absolute; left: 8px; color: var(--text-muted); pointer-events: none; }
        .date-input-wrapper input { background: transparent; border: none; color: white; padding: 0.5rem 0.5rem 0.5rem 1.8rem; outline: none; width: 130px; }
        /* Fix Date Picker Icon Color */
        ::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }

        .data-card { background: rgba(13, 22, 41, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
        .leads-table { width: 100%; border-collapse: collapse; }
        .leads-table th { text-align: left; padding: 1rem; color: var(--text-muted); font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; }
        .leads-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
        
        .lead-name { font-weight: 600; color: white; font-size: 1rem; }
        .lead-email, .lead-phone { font-size: 0.85rem; color: var(--text-muted); }
        
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-badge.new { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .status-badge.contacted { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
        .status-badge.qualified { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-badge.lost { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .status-badge.won { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

        .agent-tag { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-bright); background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 6px; }
        .unassigned { font-style: italic; color: var(--text-muted); opacity: 0.7; }
        
        .actions-cell { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .btn-icon { background: rgba(255,255,255,0.05); border: none; color: white; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-icon:hover { background: var(--primary); color: black; }
        .btn-icon.delete:hover { background: var(--danger); color: white; }

        .pagination-bar { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .btn-page { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

        /* MOBILE CARDS */
        .show-mobile { display: none; }
        .lead-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .card-title { font-weight: bold; font-size: 1.1rem; color: white; margin-bottom: 0.2rem; }
        .card-sub { font-size: 0.85rem; color: var(--text-muted); }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: #e2e8f0; }
        .detail-row span { color: var(--text-muted); }
        .card-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
        .btn-card { flex: 1; padding: 0.6rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
        .btn-card.delete { color: var(--danger); border-color: rgba(239,68,68,0.3); }

        @media (max-width: 768px) {
            .hide-mobile { display: none; }
            .show-mobile { display: block; }
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .action-bar { width: 100%; display: grid; grid-template-columns: 1fr 1fr 2fr; }
            
            .mobile-filter-toggle { display: block; }
            .filters-wrapper { display: none; flexDirection: column; align-items: stretch; }
            .filters-wrapper.open { display: flex; }
            .search-input-wrapper, .filters-group, .custom-select, .date-group { width: 100%; }
            .date-group { justify-content: space-between; }
        }
      `}</style>
    </div>
  );
};

// --- MODERN MODAL ---
const LeadModal = ({ lead, users, userRole, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '', email: lead?.email || '', phone: lead?.phone || '',
    source: lead?.source || '', status: lead?.status || 'New',
    assignedTo: lead?.assignedTo?._id || lead?.assignedTo || '',
    tags: lead?.tags || []
  });
  const [tagInput, setTagInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (lead) await api.put(`/leads/${lead._id}`, formData);
      else await api.post('/leads', formData);
      onSave();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        if (!formData.tags.includes(tagInput.trim())) setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
        setTagInput('');
    }
  };

  const addNote = async () => {
    if (!noteInput.trim()) return;
    try { await api.post(`/leads/${lead._id}/note`, { text: noteInput }); setNoteInput(''); onSave(); }
    catch (e) { alert('Failed'); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-top">
            <h3>{lead ? 'Edit Lead' : 'New Lead'}</h3>
            <button onClick={onClose}><X size={24} /></button>
        </div>
        
        {lead && (
            <div className="modal-nav">
                <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Details</button>
                <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notes</button>
            </div>
        )}

        <div className="modal-body">
            {activeTab === 'details' ? (
                <form onSubmit={handleSave}>
                    <div className="grid-2">
                        <div className="form-item">
                            <label>Full Name</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. John Doe" />
                        </div>
                        <div className="form-item">
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option>New</option><option>Contacted</option><option>Qualified</option><option>Lost</option><option>Won</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-item">
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@company.com" />
                        </div>
                        <div className="form-item">
                            <label>Phone</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 555 000 0000" />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-item">
                            <label>Source</label>
                            <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g. LinkedIn" />
                        </div>
                        {['super-admin', 'sub-admin'].includes(userRole) && (
                            <div className="form-item">
                                <label>Assign Agent</label>
                                <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                                    <option value="">-- Unassigned --</option>
                                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="form-item">
                        <label>Tags</label>
                        <div className="tag-box">
                            {formData.tags.map(t => <span key={t} className="tag">{t} <X size={12} onClick={() => setFormData({...formData, tags: formData.tags.filter(x => x !== t)})} /></span>)}
                            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type & Enter..." />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-save">Save Changes</button>
                    </div>
                </form>
            ) : (
                <div className="notes-area">
                    <div className="notes-list">
                        {lead.notes?.length ? lead.notes.map((n, i) => (
                            <div key={i} className="note">
                                <div className="note-meta"><span>{n.author}</span> • {new Date(n.date).toLocaleDateString()}</div>
                                <div>{n.text}</div>
                            </div>
                        )) : <div className="empty-note">No notes yet.</div>}
                    </div>
                    <div className="note-input">
                        <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Write a note..." rows={3} />
                        <button onClick={addNote} className="btn-save full">Add Note</button>
                    </div>
                </div>
            )}
        </div>
      </div>
      <style>{`
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-box { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; display: flex; flexDirection: column; max-height: 90vh; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .modal-top { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .modal-top h3 { margin: 0; color: white; font-family: var(--font-neon); font-size: 1.25rem; }
        .modal-top button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        
        .modal-nav { display: flex; background: rgba(0,0,0,0.2); }
        .modal-nav button { flex: 1; padding: 1rem; background: none; border: none; color: var(--text-muted); font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; }
        .modal-nav button.active { color: var(--primary); border-bottom-color: var(--primary); background: rgba(255,255,255,0.02); }

        .modal-body { padding: 1.5rem; overflow-y: auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-item label { display: block; color: #cbd5e1; font-size: 0.85rem; margin-bottom: 0.4rem; font-weight: 500; }
        .form-item input, .form-item select { width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; outline: none; }
        .form-item input:focus, .form-item select:focus { border-color: var(--primary); }

        .tag-box { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.5rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(0,0,0,0.3); }
        .tag { background: rgba(0, 243, 255, 0.15); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; }
        .tag-box input { border: none !important; background: transparent !important; padding: 0.2rem !important; flex: 1; min-width: 80px; }

        .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .btn-cancel { flex: 1; padding: 0.8rem; background: rgba(255,255,255,0.05); color: white; border: none; border-radius: 8px; cursor: pointer; }
        .btn-save { flex: 1; padding: 0.8rem; background: var(--primary); color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .btn-save.full { width: 100%; margin-top: 0.5rem; }

        .notes-area { display: flex; flexDirection: column; height: 400px; }
        .notes-list { flex: 1; overflow-y: auto; display: flex; flexDirection: column; gap: 0.8rem; margin-bottom: 1rem; padding-right: 0.5rem; }
        .note { background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem; color: #e2e8f0; }
        .note-meta { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.3rem; }
        .note-meta span { color: var(--secondary); font-weight: bold; }
        .empty-note { text-align: center; color: var(--text-muted); margin-top: 2rem; }
        .note-input textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 0.8rem; color: white; outline: none; resize: none; }

        @media (max-width: 600px) {
            .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Leads;