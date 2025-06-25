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

// Softer, more transparent color palette
const COLORS = ["rgba(59, 130, 246, 0.4)", "rgba(244, 63, 94, 0.4)"];
const BORDER_COLORS = ["#3b82f6", "#f43f5e"];

const ReportChart = ({ data }: Props) => {
  const { podravka, competitor, total } = getFacingTotals(data);
  const percent = total === 0 ? 0 : (podravka / total) * 100;

  const pieData = [
    { name: "Podravka", value: podravka },
    { name: "Konkurrenca", value: competitor },
  ];

  return (
    <div className="mt-8 max-w-xl mx-auto text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Podravka vs Konkurrenca Market Share
      </h3>
      <p className="text-3xl font-bold text-blue-600 mb-4">
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
              strokeWidth={3}
              stroke="#ffffff"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((_entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke={BORDER_COLORS[index % BORDER_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                border: "none",
              }}
              labelStyle={{ color: "#333" }}
              formatter={(value: number) => `${value} facings`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;
