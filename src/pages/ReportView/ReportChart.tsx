import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Facing } from "../../types/reportInterface";
import { getFacingTotals } from "../../utils/getFacingTotals";

interface Props {
  data: Facing[];
}

const COLORS = ["#ff3333", "#3433ff"];

const ReportChart = ({ data }: Props) => {
  const { podravka, competitor, total } = getFacingTotals(data);
  const percent = total === 0 ? 0 : (podravka / total) * 100;

  const pieData = [
    { name: "Podravka", value: podravka },
    { name: "Konkurrenca", value: competitor },
  ];

  return (
    <div className="mt-8 max-w-xl mx-auto text-center">
      <h3 className="text-lg font-semibold mb-2">
        Podravka vs Konkurrenca Market Share
      </h3>
      <p className="text-2xl font-bold text-blue-700 mb-4">
        {percent.toFixed(1)}%
      </p>

      <div className="h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {pieData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;
