import React, { useEffect, useState } from "react";
import {
  Building2,
  ClipboardList,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  HardHat,
  AlertTriangle
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

// --- Components ---

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 border border-slate-800 shadow-xl rounded-lg">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label ? label : payload[0].name}</p>
        <p className="text-sm font-bold text-amber-500">
          {prefix}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass, borderClass }) => (
  <div className={`bg-white rounded-xl p-5 border-l-4 ${borderClass} shadow-sm hover:shadow-md transition-all duration-300 group`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">
          {value}
        </h3>
      </div>
      <div className={`p-2.5 rounded-lg ${bgClass} group-hover:scale-105 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
  </div>
);

const CircularProgressCard = ({ label, value, total }) => {
  const progress = total > 0 ? (value / total) * 100 : 0;
  const data = [
    { name: "Completed", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];
  const COLORS = ["#f59e0b", "#f1f5f9"]; // Amber-500 & Slate-100

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-between min-h-[400px]">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <HardHat className="w-5 h-5 text-amber-500" />
          {label}
        </h3>
        <span className="text-[10px] font-bold bg-slate-900 text-amber-500 px-2 py-1 rounded uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              cornerRadius={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip prefix="" />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-slate-800">{progress.toFixed(0)}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Complete</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Projects</p>
          <p className="text-xl font-bold text-slate-800">{total}</p>
        </div>
        <div className="text-center border-l border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
          <p className="text-xl font-bold text-amber-600">{value}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const EnhancedHero = () => {
  // State
  const [plannedBudget, setPlannedBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [ongoingProjects, setOngoingProjects] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Logic (Kept mostly same, added error styling)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication missing.");
        setIsLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        const [pRes, cRes, oRes, bRes, sRes, aRes] = await Promise.all([
          fetch(`${baseUrl}/api/projects/totalprojects`, { headers }),
          fetch(`${baseUrl}/api/projects/completed`, { headers }),
          fetch(`${baseUrl}/api/projects/ongoing`, { headers }),
          fetch(`${baseUrl}/api/projects/totalbudget`, { headers }),
          fetch(`${baseUrl}/api/costs/totalspent`, { headers }),
          fetch(`${baseUrl}/api/payments/totalActual`, { headers }),
        ]);

        const [pData, cData, oData, bData, sData, aData] = await Promise.all([
          pRes.json(), cRes.json(), oRes.json(), bRes.json(), sRes.json(), aRes.json()
        ]);

        setTotalProjects(pData.totalProjects || 0);
        setCompletedProjects(cData.completedProjects || 0);
        setOngoingProjects(oData.ongoingProjects || 0);
        setPlannedBudget(bData.totalBudget || 0);
        setTotalSpent(sData.totalSpent || 0);
        setTotalActual(aData.totalPaid || 0);
      } catch (err) {
        setError("Unable to sync dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived Data
  const remainingBudget = Math.max(0, plannedBudget - totalSpent);
  const needToPay = Math.max(plannedBudget - totalActual, 0);
  const profit = totalActual - totalSpent;

  // Chart Data Configurations
  const projectStatusData = [
    { name: "Completed", value: completedProjects, color: "#10b981" }, // Emerald 500
    { name: "Ongoing", value: ongoingProjects, color: "#f59e0b" },    // Amber 500
  ];

  const budgetBarData = [
    { name: "Budget", shortName: "Plan", value: plannedBudget, color: "#475569" }, // Slate 600
    { name: "Remaining", shortName: "Left", value: remainingBudget, color: "#10b981" }, // Emerald 500
    { name: "Received", shortName: "Paid", value: totalActual, color: "#f59e0b" }, // Amber 500
    { name: "Pending", shortName: "Due", value: needToPay, color: "#fbbf24" }, // Amber 400
    { name: "Spent", shortName: "Cost", value: totalSpent, color: "#ef4444" }, // Rose 500
    { name: "Profit", shortName: "Net", value: profit, color: profit >= 0 ? "#8b5cf6" : "#f43f5e" },
  ];

  // Loading / Error States
  if (isLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-200">
      <div className="flex flex-col items-center gap-4">
        <HardHat className="w-12 h-12 text-amber-500 animate-bounce" />
        <div className="h-2 w-32 bg-slate-300 rounded overflow-hidden">
          <div className="h-full bg-amber-500 w-1/2 animate-[shimmer_1s_infinite]"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-slate-200">
      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-rose-500 flex items-center gap-4">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
        <div>
          <h3 className="font-bold text-slate-800">Connection Failed</h3>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-slate-200 py-8 px-6 md:px-10 font-sans text-slate-800">

      {/* Header Section */}
      <div className="max-w-screen-2xl mx-auto mb-10 border-b border-slate-300 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Dashboard</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Live
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
            Site<span className="text-amber-600">Overview</span>
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            Daily construction metrics and financial summary.
          </p>
        </div>
        <div className="hidden md:block">
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg border border-transparent">
            <ClipboardList className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 max-w-screen-2xl mx-auto mb-10">
        <StatCard
          icon={Building2}
          label="Total Sites"
          value={totalProjects}
          colorClass="text-slate-600"
          bgClass="bg-slate-100"
          borderClass="border-slate-500"
        />
        <StatCard
          icon={HardHat}
          label="Ongoing"
          value={ongoingProjects}
          colorClass="text-amber-600"
          bgClass="bg-amber-100"
          borderClass="border-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedProjects}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          borderClass="border-emerald-500"
        />
        <StatCard
          icon={Wallet}
          label="Total Spent"
          value={`₹${(totalSpent / 1000).toFixed(1)}k`}
          colorClass="text-rose-600"
          bgClass="bg-rose-100"
          borderClass="border-rose-500"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Budget"
          value={`₹${(plannedBudget / 1000).toFixed(1)}k`}
          colorClass="text-slate-600"
          bgClass="bg-slate-100"
          borderClass="border-slate-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Remaining"
          value={`₹${(remainingBudget / 1000).toFixed(1)}k`}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          borderClass="border-emerald-500"
        />
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-screen-2xl mx-auto">

        {/* 1. Project Progress Ring */}
        <CircularProgressCard
          label="Overall Progress"
          value={completedProjects}
          total={totalProjects}
        />

        {/* 2. Project Status Pie */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Status Distribution</h2>
            <button className="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="square" formatter={(value) => <span className="text-slate-600 font-semibold text-xs uppercase tracking-wide ml-1">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Budget Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Financial Overview</h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Budget vs Actuals</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
                  {budgetBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};

export default EnhancedHero;