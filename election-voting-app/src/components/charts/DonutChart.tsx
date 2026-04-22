import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 300 }) => {
  return (
    <ResponsiveContainer width={size} height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size * 0.3}
          outerRadius={size * 0.45}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="middle" align="right" layout="vertical" />
      </PieChart>
    </ResponsiveContainer>
  );
};