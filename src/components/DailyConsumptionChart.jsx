// src/components/DailyConsumptionChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function DailyConsumptionChart({ data }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
          <YAxis />
          <Tooltip formatter={(value) => `${value} MAD`} />
          <Legend />
          <Bar dataKey="total" name="Total consommé (MAD)" fill="#3b82f6" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
