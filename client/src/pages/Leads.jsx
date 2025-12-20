import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { 
  Plus, Upload, Download, Search, Trash2, Edit, X, User, ChevronLeft, ChevronRight, MessageSquare, Save, Trash, Calendar, Phone, Mail, Globe, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]); 
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', source: '', status: 'New', tags: '', assignedTo: ''
  });
  
  // Notes State
  const [noteText, setNoteText] = useState('');

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
      setLeads(data.leads);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Agents
  useEffect(() => {
    if (user.role === 'super-admin' || user.role === 'sub-admin') {
      const fetchAgents = async () => {
        try {
          const { data } = await api.get('/users'); 
          setAgents(data.users || data); 
        } catch (err) {
          console.error("Failed to fetch agents", err);
        }
      };
      fetchAgents();
    }
  }, [user.role]);

  useEffect(() => {
    fetchLeads();
  }, [page, filters]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); 
  };

  const handleModalOpen = (lead = null) => {
    if (lead) {
      setCurrentLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        tags: lead.tags.join(', '),
        assignedTo: lead.assignedTo?._id || lead.assignedTo || ''
      });
    } else {
      setCurrentLead(null);
      setFormData({ 
        name: '', email: '', phone: '', source: '', status: 'New', tags: '', 
        assignedTo: user.role === 'support-agent' ? user._id : '' 
      });
    }
    setNoteText('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (currentLead) {
        await api.put(`/leads/${currentLead._id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lead');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const { data } = await api.post(`/leads/${currentLead._id}/note`, { text: noteText });
      setCurrentLead({ ...currentLead, notes: data.notes });
      setNoteText('');
    } catch (err) {
      alert('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if(!confirm('Delete this note?')) return;
    try {
      const { data } = await api.delete(`/leads/${currentLead._id}/note/${noteId}`);
      setCurrentLead({ ...currentLead, notes: data }); 
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  const fileInputRef = useRef();
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/leads/import', formData);
      fetchLeads();
      alert('Leads imported successfully');
    } catch (err) {
      alert('Import failed');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'status-New';
      case 'Contacted': return 'status-Contacted';
      case 'Qualified': return 'status-Qualified';
      case 'Lost': return 'status-Lost';
      case 'Won': return 'status-Won';
      default: return 'status-New';
    }
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <div className="leads-page">
      <style>{`
        .leads-page { padding: 2rem; max-width: 1400px; margin: 0 auto; color: #e2e8f0; }
        
        /* HEADER */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .title h1 { font-size: 2rem; font-weight: 700; background: linear-gradient(90deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        
        .actions { display: flex; gap: 0.8rem; flex-wrap: wrap; }
        .btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
        .btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
        .btn-secondary:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.2); }
        .file-input { display: none; }

        /* FILTERS BAR */
        .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; background: rgba(30, 41, 59, 0.5); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; align-items: center; }
        .search-box { position: relative; flex: 1; min-width: 250px; }
        .search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .search-box input { width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; }
        
        .filter-group { display: flex; gap: 0.8rem; flex-wrap: wrap; }
        .custom-select, .custom-date { padding: 0.7rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #cbd5e1; outline: none; cursor: pointer; min-width: 140px; }

        /* DESKTOP TABLE */
        .table-container { background: rgba(30, 41, 59, 0.4); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1.2rem; background: rgba(15, 23, 42, 0.8); color: #94a3b8; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.05); }
        td { padding: 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }

        .lead-name { display: flex; align-items: center; gap: 0.8rem; font-weight: 500; color: white; }
        .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        
        .status-badge { padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
        .status-New { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .status-Contacted { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
        .status-Qualified { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-Lost { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .status-Won { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

        /* MOBILE CARD VIEW */
        .mobile-cards { display: none; flex-direction: column; gap: 1rem; }
        .mobile-card { background: rgba(30, 41, 59, 0.6); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 0.8rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .m-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .m-card-name { font-weight: 600; font-size: 1.1rem; color: white; display: flex; align-items: center; gap: 0.5rem; }
        .m-card-email { font-size: 0.85rem; color: #94a3b8; margin-top: 0.2rem; }
        .m-card-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #cbd5e1; }
        .m-card-actions { display: flex; gap: 0.5rem; margin-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8rem; }
        .m-card-actions .btn { flex: 1; justify-content: center; }

        /* MODAL STYLES */
        /* FIX: Increased z-index to 9999 to ensure modal appears above navbars/headers */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 1rem; }
        
        .modal-content { background: #1e293b; width: 100%; max-width: 950px; height: 85vh; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        
        .modal-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #0f172a; }
        /* FIX: Changed fontSize (JS) to font-size (CSS) */
        .modal-title { margin: 0; font-size: 1.25rem; font-weight: 600; color: white; }
        
        .modal-body { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 0; overflow: hidden; flex: 1; }
        
        .details-section { padding: 2rem; overflow-y: auto; border-right: 1px solid rgba(255,255,255,0.05); }
        .notes-section { padding: 2rem; background: rgba(15, 23, 42, 0.3); display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full { grid-column: span 2; }
        
        .form-group label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group select { padding: 0.8rem; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none; font-size: 0.95rem; }
        .form-group input:focus, .form-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

        /* NOTES */
        .note-card { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); position: relative; transition: background 0.2s; padding-bottom: 2rem; /* Extra space for delete icon */ }
        .note-card:hover { background: rgba(255,255,255,0.05); }
        
        /* 3. FIX: Move Delete Icon to Bottom Right */
        .delete-note-btn { position: absolute; bottom: 0.5rem; right: 0.5rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 5px; border-radius: 4px; cursor: pointer; opacity: 0.8; transition: all 0.2s; }
        .delete-note-btn:hover { opacity: 1; background: rgba(239, 68, 68, 0.2); }

        /* RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
           .modal-body { grid-template-columns: 1fr; overflow-y: auto; display: block; }
           .details-section { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; max-height: none; }
           .notes-section { padding: 1.5rem; min-height: 400px; height: auto; }
           .modal-content { height: 90vh; }
        }

        @media (max-width: 768px) {
          .leads-page { padding: 1rem; }
          .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          
          .actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
          .actions .btn { justify-content: center; }
          /* 1. FIX: New Lead Button spans full width on mobile */
          .actions .btn-primary { grid-column: span 2; } 
          
          .filters-bar { flex-direction: column; align-items: stretch; }
          .filter-group { flex-direction: column; }
          .search-box, .custom-select, .custom-date { width: 100%; }
          
          .table-container { display: none; } 
          .mobile-cards { display: flex; }
          
          .form-grid { grid-template-columns: 1fr !important; gap: 1rem; }
          .form-group.full { grid-column: span 1 !important; }
          
          .modal-content { height: 95vh; margin-top: 1rem; }
          .modal-header { padding: 1rem; }
        }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div className="title">
          <h1>Lead Management</h1>
          <p style={{color: '#94a3b8', margin: '0.2rem 0 0 0', fontSize: '0.9rem'}}>Manage your pipeline effectively</p>
        </div>
        <div className="actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="file-input" 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} /> Import
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => handleModalOpen()}>
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            name="search" 
            placeholder="Search name, email, phone..." 
            value={filters.search} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="filter-group">
          <select 
            name="status" 
            className="custom-select" 
            value={filters.status} 
            onChange={handleInputChange}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
            <option value="Won">Won</option>
          </select>
          <input 
            type="date" 
            name="startDate" 
            className="custom-date" 
            value={filters.startDate} 
            onChange={handleInputChange} 
          />
          <input 
            type="date" 
            name="endDate" 
            className="custom-date" 
            value={filters.endDate} 
            onChange={handleInputChange} 
          />
        </div>
      </div>

      {/* --- DESKTOP VIEW: TABLE --- */}
      <div className="table-container">
        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center', color: '#94a3b8'}}>Loading leads...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Source</th>
                <th>Created</th>
                <th>Assigned To</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>No leads found</td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <div className="lead-name">
                        <div className="avatar">{getInitials(lead.name)}</div>
                        <div>
                          <div style={{fontWeight: '600'}}>{lead.name}</div>
                          <div style={{fontSize: '0.8rem', color: '#64748b'}}>{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(lead.status)}`}>{lead.status}</span>
                    </td>
                    <td>{lead.source}</td>
                    <td style={{color: '#cbd5e1'}}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      {lead.assignedTo ? (
                        <div style={{display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.9rem', color: '#cbd5e1'}}>
                          <User size={14} /> {lead.assignedTo.name}
                        </div>
                      ) : <span style={{color: '#64748b', fontSize:'0.8rem'}}>Unassigned</span>}
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                        <button className="btn btn-secondary" style={{padding:'0.4rem'}} onClick={() => handleModalOpen(lead)} title="Edit">
                          <Edit size={16} />
                        </button>
                        {(user.role === 'super-admin' || user.role === 'sub-admin') && (
                          <button className="btn btn-secondary" style={{padding:'0.4rem', color:'#ef4444', borderColor:'rgba(239,68,68,0.2)'}} onClick={() => handleDelete(lead._id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MOBILE VIEW: CARDS --- */}
      <div className="mobile-cards">
        {leads.map(lead => (
          <div className="mobile-card" key={lead._id}>
            <div className="m-card-header">
              <div className="m-card-name">
                 <div className="avatar" style={{width:'30px', height:'30px', fontSize:'0.75rem'}}>{getInitials(lead.name)}</div>
                 {lead.name}
              </div>
              <span className={`status-badge ${getStatusColor(lead.status)}`}>{lead.status}</span>
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.5rem'}}>
              <div className="m-card-email"><Mail size={12} style={{display:'inline', marginRight:'5px'}}/> {lead.email}</div>
              <div className="m-card-row"><Phone size={12} /> {lead.phone}</div>
              <div className="m-card-row"><Globe size={12} /> {lead.source}</div>
              <div className="m-card-row" style={{color:'#94a3b8'}}><Calendar size={12} /> Created: {new Date(lead.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="m-card-actions">
              <button className="btn btn-secondary" onClick={() => handleModalOpen(lead)}>
                <Edit size={16} /> Manage
              </button>
              {(user.role === 'super-admin' || user.role === 'sub-admin') && (
                <button className="btn btn-secondary" style={{color:'#ef4444', borderColor:'rgba(239,68,68,0.3)'}} onClick={() => handleDelete(lead._id)}>
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && !loading && <div style={{textAlign:'center', color:'#64748b', padding:'2rem'}}>No leads found</div>}
      </div>

      {/* PAGINATION */}
      <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginTop:'2rem'}}>
        <button 
          className="btn btn-secondary" 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span style={{display:'flex', alignItems:'center', color:'#94a3b8'}}>
          Page {page} of {totalPages || 1}
        </span>
        <button 
          className="btn btn-secondary" 
          disabled={page === totalPages} 
          onClick={() => setPage(p => p + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{currentLead ? 'Edit Lead' : 'New Lead'}</h2>
              <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer'}}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* DETAILS FORM */}
              <div className="details-section">
                <form id="lead-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Full Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone</label>
                      <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
                    </div>
                    
                    <div className="form-group">
                      <label>Source</label>
                      <input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g. LinkedIn" />
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Lost">Lost</option>
                        <option value="Won">Won</option>
                      </select>
                    </div>

                    {/* ASSIGN AGENT (Admins Only) */}
                    {(user.role === 'super-admin' || user.role === 'sub-admin') && (
                      <div className="form-group">
                        <label>Assign Agent</label>
                        <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                          <option value="">-- Unassigned --</option>
                          {agents.map(agent => (
                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="form-group full">
                      <label>Tags (Comma Separated)</label>
                      <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. VIP, Urgent, Follow-up" />
                    </div>
                  </div>
                </form>
              </div>

              {/* NOTES SECTION */}
              <div className="notes-section">
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', color:'#cbd5e1', fontWeight:600}}>
                  <MessageSquare size={16} /> Notes & Activity
                </div>
                
                {currentLead ? (
                  <>
                    <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'1rem', paddingRight:'0.5rem'}}>
                      {currentLead.notes?.length > 0 ? (
                        currentLead.notes.map((note) => (
                          <div key={note._id} className="note-card">
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', fontSize:'0.7rem', color:'#94a3b8'}}>
                              <span style={{color:'#60a5fa', fontWeight:600}}>{note.author}</span>
                              <span>{new Date(note.date).toLocaleString()}</span>
                            </div>
                            <div style={{fontSize:'0.9rem', color:'#e2e8f0', whiteSpace:'pre-wrap', lineHeight:'1.4', paddingRight:'1.5rem'}}>{note.text}</div>
                            
                            {/* DELETE NOTE ICON - Shifted to Bottom Right */}
                            <button className="delete-note-btn" type="button" onClick={() => handleDeleteNote(note._id)} title="Delete Note">
                              <Trash size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div style={{textAlign:'center', color:'#64748b', fontSize:'0.9rem', marginTop:'2rem'}}>No notes yet.</div>
                      )}
                    </div>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                      <textarea 
                        style={{flex:1, background:'rgba(15, 23, 42, 0.8)', border:'1px solid rgba(255,255,255,0.1)', padding:'0.8rem', borderRadius:'8px', color:'white', resize:'none', height:'50px'}}
                        placeholder="Type a note..."
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                      />
                      <button onClick={handleAddNote} style={{background:'#3b82f6', color:'white', border:'none', width:'50px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Save size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                    <CheckCircle size={40} style={{opacity:0.3, marginBottom:'1rem'}} />
                    <p>Create the lead first to start adding notes.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{padding:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'flex-end', gap:'1rem', background:'#1e293b'}}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="lead-form">
                {currentLead ? 'Save Changes' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;