import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, AlertTriangle, CheckCircle2, Edit, Bell, Save } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const categories = ["طعام", "خضروات", "لحوم", "ألبان", "منظفات", "مدرسة", "دروس خصوصية", "تدريب", "صحة", "مواصلات", "فواتير", "ترفيه", "ملابس", "صيانة", "أخرى"];

const categoryColors = {
  "طعام": "#f97316",
  "خضروات": "#22c55e",
  "لحوم": "#ef4444",
  "ألبان": "#3b82f6",
  "منظفات": "#8b5cf6",
  "مدرسة": "#06b6d4",
  "دروس خصوصية": "#14b8a6",
  "تدريب": "#f59e0b",
  "صحة": "#ec4899",
  "مواصلات": "#6366f1",
  "فواتير": "#84cc16",
  "ترفيه": "#a855f7",
  "ملابس": "#f43f5e",
  "صيانة": "#64748b",
  "أخرى": "#94a3b8"
};

export default function BudgetTracker({ expenses, selectedMonth }) {
  const queryClient = useQueryClient();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgets, setBudgets] = useState({});
  const [editBudgets, setEditBudgets] = useState({});

  // Get current month expenses by category
  const categorySpending = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    const monthExpenses = expenses.filter(e => {
      const date = new Date(e.expense_date || e.created_date);
      return isWithinInterval(date, { start, end });
    });

    const spending = {};
    monthExpenses.forEach(e => {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    });
    return spending;
  }, [expenses, selectedMonth]);

  // Load budgets from user settings
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  React.useEffect(() => {
    if (user?.category_budgets) {
      setBudgets(user.category_budgets);
      setEditBudgets(user.category_budgets);
    }
  }, [user]);

  const saveBudgets = async () => {
    await base44.auth.updateMe({ category_budgets: editBudgets });
    setBudgets(editBudgets);
    setShowBudgetForm(false);
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  // Check for alerts
  const alerts = useMemo(() => {
    const alertList = [];
    Object.entries(budgets).forEach(([category, budget]) => {
      if (budget > 0) {
        const spent = categorySpending[category] || 0;
        const percentage = (spent / budget) * 100;
        if (percentage >= 90) {
          alertList.push({
            category,
            spent,
            budget,
            percentage,
            type: percentage >= 100 ? 'exceeded' : 'warning'
          });
        }
      }
    });
    return alertList;
  }, [budgets, categorySpending]);

  const totalBudget = Object.values(budgets).reduce((a, b) => a + (b || 0), 0);
  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);

  return (
    <>
      <Card className="bg-white/90 dark:bg-slate-800/90 border-0 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              تتبع الميزانية
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowBudgetForm(true)}>
              <Edit className="w-4 h-4 ml-1" />
              تعديل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Budget */}
          {totalBudget > 0 && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex justify-between text-sm mb-2 text-slate-900 dark:text-slate-100">
                <span>الإجمالي</span>
                <span className="font-bold">
                  {totalSpent.toFixed(0)} / {totalBudget.toFixed(0)} ج.م
                </span>
              </div>
              <Progress 
                value={Math.min((totalSpent / totalBudget) * 100, 100)} 
                className={`h-3 ${totalSpent > totalBudget ? 'bg-red-200' : ''}`}
              />
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {alerts.map((alert, i) => (
                <div 
                  key={i}
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    alert.type === 'exceeded' 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">
                    {alert.type === 'exceeded' ? 'تجاوزت' : 'اقتربت من'} ميزانية <strong>{alert.category}</strong>
                    {' '}({alert.spent.toFixed(0)}/{alert.budget.toFixed(0)} ج.م)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Category Budgets */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {categories.filter(c => budgets[c] > 0 || categorySpending[c] > 0).map(category => {
              const budget = budgets[category] || 0;
              const spent = categorySpending[category] || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              const isOver = spent > budget && budget > 0;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoryColors[category] }}
                      />
                      <span>{category}</span>
                    </div>
                    <span className={isOver ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                      {spent.toFixed(0)} {budget > 0 ? `/ ${budget.toFixed(0)}` : ''} ج.م
                    </span>
                  </div>
                  {budget > 0 && (
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOver ? 'bg-red-200' : percentage >= 80 ? 'bg-amber-200' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(budgets).length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لم تحدد ميزانيات بعد</p>
              <Button variant="link" size="sm" onClick={() => setShowBudgetForm(true)}>
                حدد ميزانيتك
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Form Dialog */}
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-auto dark:bg-slate-800 dark:text-white" dir="rtl">
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
                  value={editBudgets[category] || ''}
                  onChange={(e) => setEditBudgets({
                    ...editBudgets,
                    [category]: parseFloat(e.target.value) || 0
                  })}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">ج.م</span>
              </div>
            ))}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowBudgetForm(false)}>إلغاء</Button>
              <Button onClick={saveBudgets} className="gap-1">
                <Save className="w-4 h-4" />
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}