import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartData {
  date: string;
  count: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  height?: number;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          fill="#60a5fa"
          fillOpacity={0.8}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};