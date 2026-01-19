import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Users } from "lucide-react";
import { subDays, subMonths, isAfter } from "date-fns";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function TaskCompletionChart({ tasks, familyMembers }) {
  const [period, setPeriod] = useState('month');

  const getStartDate = () => {
    switch (period) {
      case 'week': return subDays(new Date(), 7);
      case 'month': return subMonths(new Date(), 1);
      case '3months': return subMonths(new Date(), 3);
      case 'year': return subMonths(new Date(), 12);
      default: return subMonths(new Date(), 1);
    }
  };

  const startDate = getStartDate();
  const filteredTasks = tasks.filter(t => 
    t.updated_date && isAfter(new Date(t.updated_date), startDate)
  );

  const memberData = familyMembers.map((member, index) => {
    const memberTasks = filteredTasks.filter(t => t.assigned_to === member.name);
    const completed = memberTasks.filter(t => t.status === 'مكتملة').length;
    const total = memberTasks.length;
    return {
      name: member.name,
      completed,
      pending: total - completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      color: COLORS[index % COLORS.length]
    };
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            مقارنة إنجاز المهام
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">الأسبوع</SelectItem>
              <SelectItem value="month">الشهر</SelectItem>
              <SelectItem value="3months">3 أشهر</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {memberData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={memberData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="مكتملة" />
                <Bar dataKey="pending" stackId="a" fill="#e5e7eb" name="قيد التنفيذ" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {memberData.map((member, index) => (
                <div key={member.name} className="p-3 bg-slate-50 rounded-lg text-center">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name[0]}
                  </div>
                  <p className="font-semibold text-lg">{member.rate}%</p>
                  <p className="text-xs text-slate-500">نسبة الإنجاز</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-slate-400 py-12">لا توجد بيانات</p>
        )}
      </CardContent>
    </Card>
  );
}