import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Target, AlertTriangle, TrendingUp, Edit } from "lucide-react";
import { startOfMonth, endOfMonth, format } from 'date-fns';

const categories = ["طعام", "طبيب", "ألعاب", "تنظيف", "تدريب", "أدوية", "مستلزمات", "أخرى"];

const categoryColors = {
  "طعام": "#f97316",
  "طبيب": "#ec4899",
  "ألعاب": "#8b5cf6",
  "تنظيف": "#06b6d4",
  "تدريب": "#f59e0b",
  "أدوية": "#ef4444",
  "مستلزمات": "#3b82f6",
  "أخرى": "#94a3b8"
};

export default function PetBudgetManager({ pet }) {
  const queryClient = useQueryClient();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [budgetData, setBudgetData] = useState({});

  const { data: budgets = [] } = useQuery({
    queryKey: ['petBudgets', pet.id, selectedMonth],
    queryFn: () => base44.entities.PetBudget.filter({ pet_id: pet.id, month: selectedMonth })
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['petExpenses', pet.id, selectedMonth],
    queryFn: () => base44.entities.PetExpense.filter({ pet_id: pet.id })
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data) => base44.entities.PetBudget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petBudgets'] });
      setShowBudgetForm(false);
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PetBudget.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['petBudgets'] })
  });

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const expDate = new Date(e.expense_date || e.created_date);
      return expDate >= startOfMonth(new Date(selectedMonth)) && 
             expDate <= endOfMonth(new Date(selectedMonth));
    });

    const spending = {};
    monthExpenses.forEach(e => {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    });
    return spending;
  }, [expenses, selectedMonth]);

  const budgetMap = useMemo(() => {
    const map = {};
    budgets.forEach(b => {
      map[b.category] = b.amount;
    });
    return map;
  }, [budgets]);

  const totalBudget = Object.values(budgetMap).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);

  const alerts = useMemo(() => {
    const alertList = [];
    Object.entries(budgetMap).forEach(([category, budget]) => {
      const spent = categorySpending[category] || 0;
      const percentage = (spent / budget) * 100;
      if (percentage >= 80) {
        alertList.push({ category, spent, budget, percentage });
      }
    });
    return alertList;
  }, [budgetMap, categorySpending]);

  const chartData = categories
    .filter(cat => categorySpending[cat] > 0)
    .map(cat => ({
      name: cat,
      value: categorySpending[cat],
      color: categoryColors[cat]
    }));

  const saveBudgets = async () => {
    for (const [category, amount] of Object.entries(budgetData)) {
      if (amount > 0) {
        const existing = budgets.find(b => b.category === category);
        if (existing) {
          await updateBudgetMutation.mutateAsync({
            id: existing.id,
            data: { ...existing, amount }
          });
        } else {
          await createBudgetMutation.mutateAsync({
            pet_id: pet.id,
            pet_name: pet.name,
            month: selectedMonth,
            category,
            amount
          });
        }
      }
    }
    setShowBudgetForm(false);
  };

  React.useEffect(() => {
    const initial = {};
    budgets.forEach(b => {
      initial[b.category] = b.amount;
    });
    setBudgetData(initial);
  }, [budgets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          ميزانية {pet.name}
        </h3>
        <div className="flex gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40 dark:bg-slate-700 dark:border-slate-600"
          />
          <Button size="sm" variant="outline" onClick={() => setShowBudgetForm(true)} className="dark:border-slate-600">
            <Edit className="w-4 h-4 ml-1" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Total Budget Progress */}
      {totalBudget > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex justify-between mb-3">
              <span className="font-bold text-slate-900 dark:text-white">الميزانية الكلية</span>
              <span className="font-bold text-purple-700 dark:text-purple-400">
                {totalSpent.toFixed(0)} / {totalBudget.toFixed(0)} ج.م
              </span>
            </div>
            <Progress 
              value={Math.min((totalSpent / totalBudget) * 100, 100)} 
              className={`h-4 ${totalSpent > totalBudget ? 'bg-red-200' : ''}`}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              متبقي: {Math.max(0, totalBudget - totalSpent).toFixed(0)} ج.م
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div 
              key={i}
              className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                {alert.percentage >= 100 ? 'تجاوزت' : 'اقتربت من'} ميزانية <strong>{alert.category}</strong>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">توزيع المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map(category => {
                const budget = budgetMap[category] || 0;
                const spent = categorySpending[category] || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                
                if (budget === 0 && spent === 0) return null;
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoryColors[category] }}
                        />
                        <span className="dark:text-slate-300">{category}</span>
                      </div>
                      <span className={spent > budget && budget > 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'dark:text-slate-300'}>
                        {spent.toFixed(0)} {budget > 0 ? `/ ${budget.toFixed(0)}` : ''} ج.م
                      </span>
                    </div>
                    {budget > 0 && (
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-2 ${spent > budget ? 'bg-red-200' : percentage >= 80 ? 'bg-amber-200' : ''}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">نسب الإنفاق</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(0)} ج.م`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                لا توجد مصروفات هذا الشهر
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Form */}
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        <DialogContent className="max-w-md dark:bg-slate-800 dark:text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              تحديد الميزانية الشهرية
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: categoryColors[category] }}
                />
                <span className="flex-1 text-sm">{category}</span>
                <Input
                  type="number"
                  className="w-24 dark:bg-slate-700 dark:border-slate-600"
                  placeholder="0"
                  value={budgetData[category] || ''}
                  onChange={(e) => setBudgetData({
                    ...budgetData,
                    [category]: parseFloat(e.target.value) || 0
                  })}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">ج.م</span>
              </div>
            ))}
            <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
              <Button variant="outline" onClick={() => setShowBudgetForm(false)} className="dark:border-slate-600">
                إلغاء
              </Button>
              <Button onClick={saveBudgets}>
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}