import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function YearlyComparisonChart({ expenses }) {
  const monthlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthExpenses = expenses.filter(e => {
        const date = new Date(e.expense_date || e.created_date);
        return isWithinInterval(date, { start, end });
      });
      
      const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const categories = {};
      monthExpenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });
      
      data.push({
        month: monthNames[monthDate.getMonth()],
        shortMonth: monthNames[monthDate.getMonth()].substring(0, 3),
        total,
        food: (categories['طعام'] || 0) + (categories['خضروات'] || 0) + (categories['لحوم'] || 0) + (categories['ألبان'] || 0),
        education: (categories['مدرسة'] || 0) + (categories['دروس خصوصية'] || 0),
        bills: categories['فواتير'] || 0,
        other: total - ((categories['طعام'] || 0) + (categories['خضروات'] || 0) + (categories['لحوم'] || 0) + (categories['ألبان'] || 0) + (categories['مدرسة'] || 0) + (categories['دروس خصوصية'] || 0) + (categories['فواتير'] || 0))
      });
    }
    
    return data;
  }, [expenses]);

  const averageMonthly = useMemo(() => {
    const totals = monthlyData.map(m => m.total).filter(t => t > 0);
    return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  }, [monthlyData]);

  return (
    <Card className="bg-white/90 border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          مقارنة الإنفاق الشهري
        </CardTitle>
        <p className="text-sm text-slate-500">
          المتوسط الشهري: <span className="font-bold text-blue-600">{averageMonthly.toFixed(0)} ج.م</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="shortMonth" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(0)} ج.م`}
                labelFormatter={(label) => monthNames.find(m => m.startsWith(label)) || label}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => {
                  const labels = { food: 'طعام', education: 'تعليم', bills: 'فواتير', other: 'أخرى' };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="food" stackId="a" fill="#f97316" name="food" />
              <Bar dataKey="education" stackId="a" fill="#06b6d4" name="education" />
              <Bar dataKey="bills" stackId="a" fill="#84cc16" name="bills" />
              <Bar dataKey="other" stackId="a" fill="#94a3b8" name="other" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Trend Line */}
        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="shortMonth" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip formatter={(value) => `${value.toFixed(0)} ج.م`} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="الإجمالي"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}