import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BudgetOverview = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [budgetData, setBudgetData] = useState({
    plannedBudget: 0,
    remainingBudget: 0,
    clientPaid: 0,
    needToPay: 0,
    spent: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const [projRes, payRes, costRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/actual/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/costs/distribution/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!projRes.ok) throw new Error("Failed to fetch project");
        if (!payRes.ok) throw new Error("Failed to fetch payments");
        if (!costRes.ok) throw new Error("Failed to fetch costs distribution");

        const project = await projRes.json();
        const payment = await payRes.json();
        const costs = await costRes.json();

        const plannedBudget = Number(project.plannedBudget || project.budget || 0);
        const clientPaid = Number(payment.totalBudget || 0);
        const spent = costs.reduce((sum, item) => sum + Number(item.value || 0), 0);

        const remainingBudget = Math.max(plannedBudget - spent, 0);
        const needToPay = Math.max(plannedBudget - clientPaid, 0);
        const profit = clientPaid - spent; // can be negative if overspent

        setBudgetData({ plannedBudget, remainingBudget, clientPaid, needToPay, spent, profit });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [id]);

  const barData = [
    { name: "Plan", value: budgetData.plannedBudget, color: "#475569" }, // Slate
    { name: "Left", value: budgetData.remainingBudget, color: "#10b981" }, // Emerald
    { name: "Paid", value: budgetData.clientPaid, color: "#f59e0b" }, // Amber
    { name: "Due", value: budgetData.needToPay, color: "#fbbf24" }, // Lights Amber
    { name: "Spent", value: budgetData.spent, color: "#ef4444" }, // Rose
    {
      name: "Profit",
      value: budgetData.profit,
      color: budgetData.profit >= 0 ? "#8b5cf6" : "#f87171", // Violet or Red
    },
  ];

  if (loading) return <p className="p-4 text-center text-slate-400 text-sm font-bold uppercase">Loading budget...</p>;
  if (error) return <p className="p-4 text-center text-rose-500 text-sm font-bold uppercase">Error: {error}</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 border border-slate-200 min-h-[360px] hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Budget Overview</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `₹${val / 1000}k`} />
          <Tooltip
            formatter={(value) => `₹${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '12px', fontWeight: 'bold' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {barData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetOverview;
