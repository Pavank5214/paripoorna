import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, Shield, TrendingUp, BarChart3, LayoutDashboard } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userApi } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-2">
        <LayoutDashboard className="w-8 h-8 text-slate-300 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl border border-rose-100 shadow-sm max-w-md">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-800 mb-2">Access Error</p>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold uppercase tracking-wider text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, colorClass, iconBgClass }) => (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide border-l-2 border-slate-100 pl-2">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClass} group-hover:scale-105 transition-transform`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200 py-8 font-sans px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-slate-200 backdrop-blur pb-4 mb-2 border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 pt-2">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
            <LayoutDashboard className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              System Overview & Control
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle="Registered Accounts"
            colorClass="text-blue-600"
            iconBgClass="bg-blue-50 border border-blue-100"
          />
          <StatCard
            icon={Activity}
            title="Active Users"
            value={stats?.activeUsers || 0}
            subtitle="Currently Online"
            colorClass="text-emerald-600"
            iconBgClass="bg-emerald-50 border border-emerald-100"
          />
          <StatCard
            icon={Shield}
            title="Administrators"
            value={(stats?.adminUsers || 0) + (stats?.superAdminUsers || 0)}
            subtitle={`${stats?.adminUsers || 0} Admins • ${stats?.superAdminUsers || 0} Super`}
            colorClass="text-violet-600"
            iconBgClass="bg-violet-50 border border-violet-100"
          />
          <StatCard
            icon={TrendingUp}
            title="Recent Logins"
            value={stats?.recentLogins || 0}
            subtitle="Last 7 Days"
            colorClass="text-amber-600"
            iconBgClass="bg-amber-50 border border-amber-100"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Role Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
              User Role Distribution
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Super Admins', value: stats?.superAdminUsers || 0 },
                      { name: 'Admins', value: stats?.adminUsers || 0 },
                      { name: 'Managers', value: stats?.projectManagers || 0 },
                      { name: 'Workers', value: stats?.workers || 0 },
                      { name: 'Clients', value: stats?.clients || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Super Admins', value: stats?.superAdminUsers || 0 },
                      { name: 'Admins', value: stats?.adminUsers || 0 },
                      { name: 'Managers', value: stats?.projectManagers || 0 },
                      { name: 'Workers', value: stats?.workers || 0 },
                      { name: 'Clients', value: stats?.clients || 0 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/admin/users" className="w-full flex items-center space-x-4 p-4 text-left hover:bg-slate-50 rounded-xl transition-all border border-slate-100 group">
                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-slate-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm uppercase tracking-wide">Manage Users</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Add, edit, or remove system users</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
