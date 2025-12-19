import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, TrendingUp, CheckCircle, Clock, PieChart as PieIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  if (loading) return <div>Loading...</div>;

  const getStatusCount = (status) => {
    return stats?.statusDistribution?.find(s => s._id === status)?.count || 0;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare data for charts
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
    <div className="card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
  );

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Dashboard Overview</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          title="Total Leads" 
          value={stats?.totalLeads || 0} 
          icon={Users} 
          color="#6366f1" 
        />
        <StatCard 
          title="New Leads" 
          value={getStatusCount('New')} 
          icon={Clock} 
          color="#3b82f6" 
        />
        <StatCard 
          title="Won Leads" 
          value={getStatusCount('Won')} 
          icon={CheckCircle} 
          color="#22c55e" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats?.totalLeads ? Math.round((getStatusCount('Won') / stats.totalLeads) * 100) : 0}%`} 
          icon={TrendingUp} 
          color="#8b5cf6" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Lead Status Distribution Pie Chart */}
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <PieIcon size={20} color="var(--primary)" />
             <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Lead Status Distribution</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--surface)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} 
                  itemStyle={{ color: 'var(--text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance Bar Chart */}
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <Activity size={20} color="var(--primary)" />
             <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Agent Performance</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
             <ResponsiveContainer>
               <BarChart data={agentData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                 <XAxis type="number" stroke="var(--text-muted)" />
                 <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" />
                 <Tooltip 
                    cursor={{fill: 'var(--border)', opacity: 0.2}}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                 />
                 <Bar dataKey="leads" fill="var(--primary)" radius={[0, 4, 4, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent Leads</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentLeads?.map(lead => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>
                    <span className={`badge badge-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!stats?.recentLeads?.length && (
                 <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
