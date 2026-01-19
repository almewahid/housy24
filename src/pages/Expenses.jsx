import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Wallet, Plus, TrendingUp, TrendingDown,
  Sparkles, Loader2, Trash2, Edit, DollarSign, PieChart,
  FileText, AlertTriangle, BarChart3, Target, ImageIcon
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import YearlyComparisonChart from '@/components/expenses/YearlyComparisonChart';
import BudgetManager from '@/components/expenses/BudgetManager';
import ExpenseFormWithReceipt from '@/components/expenses/ExpenseFormWithReceipt';
import ExpenseReport from '@/components/expenses/ExpenseReport';
import AdvancedExportReport from '@/components/expenses/AdvancedExportReport';

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

export default function Expenses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'طعام',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'نقدي',
    store_name: '',
    notes: '',
    is_recurring: false
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert([data])
        .select();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      setEditingExpense(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'طعام',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'نقدي',
      store_name: '',
      notes: '',
      is_recurring: false
    });
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      expense_date: expense.expense_date || format(new Date(), 'yyyy-MM-dd'),
      payment_method: expense.payment_method || 'نقدي',
      store_name: expense.store_name || '',
      notes: expense.notes || '',
      is_recurring: expense.is_recurring || false
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter expenses by selected month
  const monthlyExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return expenses.filter(e => {
      const date = new Date(e.expense_date || e.created_date);
      return isWithinInterval(date, { start, end });
    });
  }, [expenses, selectedMonth]);

  // Calculate totals
  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const lastMonthExpenses = useMemo(() => {
    const start = startOfMonth(subMonths(selectedMonth, 1));
    const end = endOfMonth(subMonths(selectedMonth, 1));
    return expenses.filter(e => {
      const date = new Date(e.expense_date || e.created_date);
      return isWithinInterval(date, { start, end });
    });
  }, [expenses, selectedMonth]);
  
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyChange = lastMonthTotal > 0 ? ((totalMonthly - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;

  // Group by category
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    monthlyExpenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value, color: categoryColors[name] }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);

  // AI Analysis
  const analyzeWithAI = async () => {
    setLoadingAI(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل مصروفات هذا الشهر وقدم تقريراً شاملاً:

المصروفات:
${monthlyExpenses.map(e => `- ${e.title}: ${e.amount} ج.م (${e.category})`).join('\n')}

إجمالي الشهر: ${totalMonthly} ج.م
مقارنة بالشهر السابق: ${lastMonthTotal} ج.م

قدم:
1. ملخص الإنفاق
2. الفئات الأكثر إنفاقاً
3. نصائح للتوفير
4. توقع المصروف للشهر القادم
5. تنبيهات مهمة`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            top_categories: { type: "array", items: { type: "string" } },
            saving_tips: { type: "array", items: { type: "string" } },
            next_month_prediction: { type: "number" },
            alerts: { type: "array", items: { type: "string" } },
            overall_assessment: { type: "string" }
          }
        }
      });
      setAiAnalysis(response);
    } catch (error) {
      console.error('Error analyzing:', error);
    }
    setLoadingAI(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">مصروفات المنزل</h1>
            <p className="text-slate-500">تتبع وتحليل جميع مصروفات الأسرة</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowAdvancedExport(true)} variant="outline" className="gap-2 dark:border-slate-600 dark:hover:bg-slate-700">
              <FileText className="w-4 h-4" />
              تصدير وتخصيص
            </Button>
            <Button onClick={() => setShowReport(true)} variant="outline" className="gap-2 dark:border-slate-600 dark:hover:bg-slate-700">
              <FileText className="w-4 h-4" />
              تقرير تحليلي
            </Button>
            <Button onClick={analyzeWithAI} variant="outline" className="gap-2" disabled={loadingAI}>
              {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              تحليل ذكي
            </Button>
            <Button onClick={() => { setEditingExpense(null); resetForm(); setShowForm(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-5 h-5" />
              إضافة مصروف
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeView === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('list')}
          >
            قائمة المصروفات
          </Button>
          <Button 
            variant={activeView === 'yearly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('yearly')}
            className="gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            مقارنة سنوية
          </Button>
          <Button 
            variant={activeView === 'budget' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('budget')}
            className="gap-1"
          >
            <Target className="w-4 h-4" />
            الميزانية
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-purple-100 text-sm">إجمالي الشهر</p>
                  <p className="text-2xl font-bold">{totalMonthly.toFixed(0)} ج.م</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${monthlyChange > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  {monthlyChange > 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">مقارنة بالسابق</p>
                  <p className={`text-xl font-bold ${monthlyChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {monthlyChange > 0 ? '+' : ''}{monthlyChange}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">عدد المصروفات</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{monthlyExpenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">المتوسط اليومي</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {(totalMonthly / new Date().getDate()).toFixed(0)} ج.م
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          >
            السابق
          </Button>
          <span className="font-semibold text-lg">
            {format(selectedMonth, 'MMMM yyyy', { locale: ar })}
          </span>
          <Button
            variant="outline"
            onClick={() => setSelectedMonth(new Date())}
          >
            الحالي
          </Button>
        </div>

        {/* Yearly Comparison View */}
        {activeView === 'yearly' && (
          <YearlyComparisonChart expenses={expenses} />
        )}

        {/* Budget View */}
        {activeView === 'budget' && (
          <BudgetManager expenses={expenses} selectedMonth={selectedMonth} />
        )}

        {/* List View */}
        {activeView === 'list' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expenses List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 dark:bg-slate-800/90 border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white">المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {monthlyExpenses.map(expense => (
                      <div 
                        key={expense.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <div 
                          className="w-3 h-12 rounded-full"
                          style={{ backgroundColor: categoryColors[expense.category] }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{expense.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="dark:border-slate-500">{expense.category}</Badge>
                            {expense.store_name && <span>{expense.store_name}</span>}
                            <span>{format(new Date(expense.expense_date || expense.created_date), 'd/M')}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">{expense.amount} ج.م</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{expense.payment_method}</p>
                        </div>
                        <div className="flex gap-1">
                          {expense.receipt_image_url && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => window.open(expense.receipt_image_url, '_blank')}
                              title="عرض الإيصال"
                            >
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(expense)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-500"
                            onClick={() => deleteMutation.mutate(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {monthlyExpenses.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>لا توجد مصروفات هذا الشهر</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Analysis */}
          <div className="space-y-6">
            {/* Pie Chart */}
            <Card className="bg-white/90 dark:bg-slate-800/90 border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <PieChart className="w-5 h-5" />
                  توزيع المصروفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} ج.م`} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {categoryBreakdown.slice(0, 5).map((cat, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{cat.value.toFixed(0)} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-slate-400 py-8">لا توجد بيانات</p>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {aiAnalysis && (
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                    التحليل الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{aiAnalysis.summary}</p>
                  
                  {aiAnalysis.alerts?.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h5 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        تنبيهات
                      </h5>
                      <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        {aiAnalysis.alerts.map((alert, i) => (
                          <li key={i}>• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.saving_tips?.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-semibold text-green-700 dark:text-green-400 mb-1">💡 نصائح للتوفير</h5>
                      <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                        {aiAnalysis.saving_tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.next_month_prediction > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400">توقع الشهر القادم</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {aiAnalysis.next_month_prediction} ج.م
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}

        {/* Advanced Export Dialog */}
        <AdvancedExportReport
          expenses={monthlyExpenses}
          open={showAdvancedExport}
          onClose={() => setShowAdvancedExport(false)}
        />

        {/* Custom Report Dialog */}
        <ExpenseReport 
          expenses={expenses} 
          open={showReport} 
          onClose={() => setShowReport(false)} 
        />

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md max-h-[90vh] dark:bg-slate-800 dark:text-white" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            </DialogHeader>
            <ExpenseFormWithReceipt
              editingExpense={editingExpense}
              onSave={(data, id) => {
                if (id) {
                  updateMutation.mutate({ id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}