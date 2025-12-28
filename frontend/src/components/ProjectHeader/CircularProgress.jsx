import { PieChart, Pie, Cell } from "recharts";

const CircularProgress = ({ progress = 0 }) => {
  const data = [
    { name: "Completed", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];
  const COLORS = ["#f59e0b", "#f1f5f9"]; // Amber-500, Slate-100

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 border border-slate-200 min-h-[360px] hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Project Progress</h3>
      <div className="relative">
        <PieChart width={160} height={200}>
          <Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius={55}
            outerRadius={80}
            cornerRadius={4}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{progress}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done</span>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
