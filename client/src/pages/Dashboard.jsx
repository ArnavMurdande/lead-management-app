import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, TrendingUp, CheckCircle, Clock, PieChart as PieIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MagicBento from '../components/MagicBento';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/leads/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="loader">Loading Dashboard...</div>
    </div>
  );

  const getStatusCount = (status) => stats?.statusDistribution?.find(s => s._id === status)?.count || 0;
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusData = stats?.statusDistribution?.map((item, index) => ({
    name: item._id,
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const agentData = stats?.agentPerformance?.map(item => ({
    name: item.name || 'Unassigned',
    leads: item.count
  })) || [];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <MagicBento glowColor={color.replace('#', '').match(/.{1,2}/g).map(hex => parseInt(hex, 16)).join(', ')}>
      <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{value}</h3>
          </div>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            backgroundColor: `${color}20`,
            color: color 
          }}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    </MagicBento>
  );

  return (
    <div className="dashboard-container animate-fade-in">
      <style>{`
        .dashboard-container { padding-bottom: 2rem; }
        .dashboard-header { margin-bottom: 2rem; }
        .dashboard-header h2 { font-size: 1.875rem; font-weight: bold; margin: 0; }
        .dashboard-header p { color: var(--text-muted); }
        
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 1.5rem; 
          margin-bottom: 2rem; 
        }

        /* Responsive Charts Grid */
        .charts-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 2rem; 
          margin-bottom: 2rem; 
        }

        .chart-container { padding: 1.5rem; }
        .chart-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .chart-header h3 { font-size: 1.25rem; font-weight: bold; margin: 0; }
        
        /* Table Scroll Fix */
        .table-scroll-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 1rem; }
        .dashboard-table { width: 100%; min-width: 600px; table-layout: fixed; border-collapse: separate; border-spacing: 0 0.5rem; }
        .dashboard-table th { padding: 1rem; text-align: left; color: var(--text-muted); }
        .dashboard-table td { padding: 1rem; }
        .dashboard-table tr { background-color: rgba(255,255,255,0.02); transition: background 0.2s; }
        .dashboard-table tr:hover { background-color: rgba(255,255,255,0.05); }

        /* VIEW ALL BUTTON STYLES */
        .btn-view-all {
            border-radius: 50px !important; /* Rounded */
            transition: all 0.3s ease;
            border: 1px solid var(--primary);
            padding: 0.5rem 1.5rem;
        }
        .btn-view-all:hover {
            background-color: #ccff00 !important; /* Neon Green */
            color: black !important;
            border-color: #ccff00 !important;
            box-shadow: 0 0 15px rgba(204, 255, 0, 0.4);
            transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr; }
          .dashboard-header h2 { font-size: 1.5rem; }
        }
      `}</style>

      <header className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Real-time insights into your lead pipeline.</p>
      </header>
      
      {/* Top Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Leads" value={stats?.totalLeads || 0} icon={Users} color="#6366f1" />
        <StatCard title="New Leads" value={getStatusCount('New')} icon={Clock} color="#3b82f6" />
        <StatCard title="Won Leads" value={getStatusCount('Won')} icon={CheckCircle} color="#10b981" />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats?.totalLeads ? Math.round((getStatusCount('Won') / stats.totalLeads) * 100) : 0}%`} 
          icon={TrendingUp} 
          color="#8b5cf6" 
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <MagicBento>
          <div className="chart-container">
            <div className="chart-header">
               <PieIcon size={20} color="var(--primary)" />
               <h3>Lead Status Distribution</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={5} dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MagicBento>

        <MagicBento>
          <div className="chart-container">
            <div className="chart-header">
               <Activity size={20} color="var(--primary)" />
               <h3>Agent Performance</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
               <ResponsiveContainer>
                 <BarChart data={agentData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                   <XAxis type="number" hide />
                   <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      axisLine={false} 
                      tickLine={false} 
                      style={{ fill: 'var(--text-muted)', fontSize: '0.85rem' }} 
                   />
                   <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}
                   />
                   {/* MODIFIED: Rounded Corners & Thicker Bars */}
                   <Bar 
                     dataKey="leads" 
                     fill="var(--primary)" 
                     radius={[0, 12, 12, 0]} 
                     barSize={24} 
                   />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </MagicBento>
      </div>

      {/* Recent Leads Fixed Layout */}
      <MagicBento>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Recent Leads</h3>
            <button className="btn btn-primary btn-view-all">View All</button>
          </div>
          
          <div className="table-scroll-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentLeads?.map(lead => (
                  <tr key={lead._id}>
                    <td style={{ borderRadius: '8px 0 0 8px' }}>
                      <div style={{ fontWeight: 500 }}>{lead.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.email}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${lead.status.toLowerCase()}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                          {lead.assignedTo?.name?.charAt(0) || '?'}
                        </div>
                        {lead.assignedTo?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td style={{ borderRadius: '0 8px 8px 0', color: 'var(--text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </MagicBento>
    </div>
  );
};

export default Dashboard;