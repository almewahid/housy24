import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, Plus, AlertTriangle, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

const categories = ["طعام", "خضروات", "لحوم", "ألبان", "منظفات", "مدرسة", "دروس خصوصية", "تدريب", "صحة", "مواصلات", "فواتير", "ترفيه", "ملابس", "صيانة", "أخرى"];

export default function BudgetManager({ expenses, selectedMonth }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'طعام',
    monthly_limit: '',
    alert_percentage: 80,
    month: format(selectedMonth, 'yyyy-MM'),
    is_active: true
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => base44.entities.Budget.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      setEditingBudget(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] })
  });

  const resetForm = () => {
    setFormData({
      category: 'طعام',
      monthly_limit: '',
      alert_percentage: 80,
      month: format(selectedMonth, 'yyyy-MM'),
      is_active: true
    });
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      monthly_limit: budget.monthly_limit,
      alert_percentage: budget.alert_percentage || 80,
      month: budget.month,
      is_active: budget.is_active
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      monthly_limit: parseFloat(formData.monthly_limit),
      alert_percentage: parseFloat(formData.alert_percentage)
    };
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter budgets for selected month
  const currentMonthBudgets = budgets.filter(b => b.month === format(selectedMonth, 'yyyy-MM'));

  // Calculate spending per category
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

  const budgetStatus = currentMonthBudgets.map(budget => {
    const spent = categorySpending[budget.category] || 0;
    const percentage = (spent / budget.monthly_limit) * 100;
    const isOverBudget = percentage >= 100;
    const isNearLimit = percentage >= budget.alert_percentage && !isOverBudget;

    return {
      ...budget,
      spent,
      remaining: budget.monthly_limit - spent,
      percentage: Math.min(percentage, 100),
      isOverBudget,
      isNearLimit
    };
  });

  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = Object.values(categorySpending).reduce((sum, s) => sum + s, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">الميزانية الشهرية</h3>
              <p className="text-emerald-100">{format(selectedMonth, 'MMMM yyyy', { locale: ar })}</p>
            </div>
            <Button
              onClick={() => { setEditingBudget(null); resetForm(); setShowForm(true); }}
              className="bg-white text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="ml-2 h-5 w-5" />
              إضافة ميزانية
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-emerald-100 text-sm mb-1">إجمالي الميزانية</p>
              <p className="text-2xl font-bold">{totalBudget.toLocaleString()} ج.م</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-emerald-100 text-sm mb-1">المصروف الفعلي</p>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString()} ج.م</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>التقدم الإجمالي</span>
              <span>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
            </div>
            <Progress 
              value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} 
              className="h-3 bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {budgetStatus.map(budget => (
          <Card key={budget.id} className={`border-2 ${
            budget.isOverBudget ? 'border-red-300 bg-red-50' :
            budget.isNearLimit ? 'border-amber-300 bg-amber-50' :
            'border-gray-200'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {budget.category}
                    {budget.isOverBudget && (
                      <Badge className="bg-red-500">تجاوزت الميزانية!</Badge>
                    )}
                    {budget.isNearLimit && (
                      <Badge className="bg-amber-500">قريب من الحد</Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(budget)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-red-500"
                    onClick={() => deleteMutation.mutate(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المصروف</span>
                <span className="font-bold">{budget.spent.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الميزانية</span>
                <span className="font-bold">{budget.monthly_limit.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المتبقي</span>
                <span className={`font-bold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {budget.remaining.toLocaleString()} ج.م
                </span>
              </div>
              
              <Progress 
                value={budget.percentage} 
                className={`h-2 ${
                  budget.isOverBudget ? '[&>div]:bg-red-500' :
                  budget.isNearLimit ? '[&>div]:bg-amber-500' :
                  '[&>div]:bg-emerald-500'
                }`}
              />
              
              <p className="text-xs text-gray-500 text-center">
                {budget.percentage.toFixed(1)}% من الميزانية
              </p>
            </CardContent>
          </Card>
        ))}

        {budgetStatus.length === 0 && (
          <Card className="md:col-span-2 p-8 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لم يتم تحديد ميزانيات لهذا الشهر</p>
            <Button 
              onClick={() => { setEditingBudget(null); resetForm(); setShowForm(true); }}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="ml-2 h-5 w-5" />
              إضافة أول ميزانية
            </Button>
          </Card>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'تعديل الميزانية' : 'إضافة ميزانية جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الفئة</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>الحد الشهري (ج.م) *</Label>
              <Input
                type="number"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>نسبة التنبيه (%)</Label>
              <Input
                type="number"
                value={formData.alert_percentage}
                onChange={(e) => setFormData({ ...formData, alert_percentage: e.target.value })}
                placeholder="80"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">سيتم تنبيهك عند الوصول لهذه النسبة</p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.monthly_limit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}