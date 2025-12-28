import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CostsDistribution = ({ projectId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/costs/distribution/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch costs distribution");
        const costsData = await res.json();

        // Ensure data has { category, value } format
        const formattedData = costsData.map((item) => ({
          category: item.category || item.name || "Unknown",
          value: item.value || item.amount || 0,
        }));

        setData(formattedData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [projectId]);

  const pieColors = ["#475569", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"]; // Slate, Rose, Amber, Emerald, Cyan

  if (loading) return <p className="p-4 text-center text-slate-400 text-sm font-bold uppercase">Loading costs...</p>;
  if (error) return <p className="p-4 text-center text-rose-500 text-sm font-bold uppercase">Error: {error}</p>;
  if (!data.length)
    return <p className="p-4 text-center text-slate-400 text-sm font-bold uppercase">No cost data available.</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 border border-slate-200 min-h-[360px] hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Costs Distribution</h3>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={5}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '12px', fontWeight: 'bold' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Legend formatter={(value) => <span className="text-slate-600 font-bold text-xs uppercase tracking-wide ml-1">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostsDistribution;
