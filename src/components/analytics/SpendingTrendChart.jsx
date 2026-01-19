import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SpendingTrendChart({ projects }) {
  // Group projects by month
  const monthlyData = projects.reduce((acc, project) => {
    if (!project.created_date) return acc;
    const month = format(new Date(project.created_date), 'yyyy-MM');
    if (!acc[month]) {
      acc[month] = { month, budget: 0, actual: 0, label: format(new Date(project.created_date), 'MMM yyyy', { locale: ar }) };
    }
    acc[month].budget += project.budget || 0;
    acc[month].actual += project.actual_cost || 0;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate cumulative spending
  let cumulativeBudget = 0;
  let cumulativeActual = 0;
  const cumulativeData = chartData.map(item => {
    cumulativeBudget += item.budget;
    cumulativeActual += item.actual;
    return {
      ...item,
      cumulativeBudget,
      cumulativeActual
    };
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          اتجاه الإنفاق على المشاريع
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cumulativeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()} ج.م`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeBudget" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="الميزانية التراكمية"
                dot={{ fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeActual" 
                stroke="#10b981" 
                strokeWidth={2}
                name="الإنفاق الفعلي التراكمي"
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-400 py-12">لا توجد بيانات كافية</p>
        )}
      </CardContent>
    </Card>
  );
}