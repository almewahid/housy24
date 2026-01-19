import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FileText, Download, Calendar, Filter, Loader2, Sparkles } from "lucide-react";
import { format, isWithinInterval, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

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

export default function ExpenseReport({ expenses, open, onClose }) {
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.expense_date || e.created_date);
      const inRange = isWithinInterval(date, { 
        start: parseISO(startDate), 
        end: parseISO(endDate) 
      });
      const inCategory = selectedCategories.includes(e.category);
      return inRange && inCategory;
    });
  }, [expenses, startDate, endDate, selectedCategories]);

  const reportData = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byCategory = {};
    const byPayment = {};
    const byStore = {};
    
    filteredExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      byPayment[e.payment_method || 'نقدي'] = (byPayment[e.payment_method || 'نقدي'] || 0) + e.amount;
      if (e.store_name) {
        byStore[e.store_name] = (byStore[e.store_name] || 0) + e.amount;
      }
    });

    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value, color: categoryColors[name] }))
      .sort((a, b) => b.value - a.value);

    const storeData = Object.entries(byStore)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { total, categoryData, byPayment, storeData, count: filteredExpenses.length };
  }, [filteredExpenses]);

  const generateAISummary = async () => {
    setLoadingAI(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `اكتب ملخصاً موجزاً لتقرير المصروفات التالي:

الفترة: ${format(parseISO(startDate), 'd MMMM yyyy', { locale: ar })} - ${format(parseISO(endDate), 'd MMMM yyyy', { locale: ar })}
إجمالي المصروفات: ${reportData.total.toFixed(0)} ج.م
عدد العمليات: ${reportData.count}

توزيع الفئات:
${reportData.categoryData.map(c => `- ${c.name}: ${c.value.toFixed(0)} ج.م`).join('\n')}

اكتب ملخصاً من 3-4 جمل يتضمن:
1. الفئة الأكثر إنفاقاً
2. ملاحظة عن نمط الإنفاق
3. نصيحة للتوفير`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" }
          }
        }
      });
      setAiSummary(response.summary);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoadingAI(false);
  };

  const exportReport = () => {
    const reportContent = `
تقرير المصروفات
================
الفترة: ${format(parseISO(startDate), 'd MMMM yyyy', { locale: ar })} - ${format(parseISO(endDate), 'd MMMM yyyy', { locale: ar })}

الإجمالي: ${reportData.total.toFixed(2)} ج.م
عدد العمليات: ${reportData.count}

توزيع الفئات:
${reportData.categoryData.map(c => `${c.name}: ${c.value.toFixed(2)} ج.م (${((c.value/reportData.total)*100).toFixed(1)}%)`).join('\n')}

طريقة الدفع:
${Object.entries(reportData.byPayment).map(([k, v]) => `${k}: ${v.toFixed(2)} ج.م`).join('\n')}

المتاجر الأكثر تعاملاً:
${reportData.storeData.map(s => `${s.name}: ${s.value.toFixed(2)} ج.م`).join('\n')}

${aiSummary ? `\nالملخص الذكي:\n${aiSummary}` : ''}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_المصروفات_${startDate}_${endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto dark:bg-slate-800 dark:text-white" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            تقرير مصروفات مخصص
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="space-y-4">
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4" />
                الفئات
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(category => (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: categoryColors[category] }}
                    />
                    <span className="text-sm">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{reportData.total.toFixed(0)}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-500">ج.م إجمالي</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{reportData.count}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">عملية</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {reportData.count > 0 ? (reportData.total / reportData.count).toFixed(0) : 0}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">ج.م متوسط</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm dark:text-white">توزيع الفئات</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          dataKey="value"
                        >
                          {reportData.categoryData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(0)} ج.م`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart - Stores */}
              <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm dark:text-white">أكثر المتاجر</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.storeData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                        <Tooltip formatter={(value) => `${value.toFixed(0)} ج.م`} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm dark:text-white">تفصيل الفئات</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {reportData.categoryData.slice(0, 6).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm dark:text-slate-200">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium dark:text-slate-200">{cat.value.toFixed(0)} ج.م</span>
                        <Badge variant="outline" className="text-xs dark:border-slate-500">
                          {((cat.value / reportData.total) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            {aiSummary && (
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <p className="text-sm text-purple-800 dark:text-purple-400">{aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={generateAISummary} disabled={loadingAI}>
                {loadingAI ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Sparkles className="w-4 h-4 ml-1" />}
                ملخص ذكي
              </Button>
              <Button onClick={exportReport} className="gap-1">
                <Download className="w-4 h-4" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}