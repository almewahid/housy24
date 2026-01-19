import React from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, DollarSign, Users, Package, ClipboardList, Wrench, 
  AlertTriangle, CheckCircle2, Calendar
} from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import SpendingTrendChart from '@/components/analytics/SpendingTrendChart';
import TaskCompletionChart from '@/components/analytics/TaskCompletionChart';
import UpcomingAlertsReport from '@/components/analytics/UpcomingAlertsReport';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function Analytics() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.DIYProject.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.HouseholdTask.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.InventoryItem.list()
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.Maintenance.list()
  });

  // Project Cost Analysis
  const projectCostData = projects
    .filter(p => p.budget || p.actual_cost)
    .map(p => ({
      name: p.title?.substring(0, 15) || 'مشروع',
      budget: p.budget || 0,
      actual: p.actual_cost || 0,
      variance: (p.budget || 0) - (p.actual_cost || 0)
    }));

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalActual = projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);

  // Tasks by Member
  const tasksByMember = familyMembers.map(member => {
    const memberTasks = tasks.filter(t => t.assigned_to === member.name);
    const completedTasks = memberTasks.filter(t => t.status === 'مكتملة');
    return {
      name: member.name,
      total: memberTasks.length,
      completed: completedTasks.length,
      points: member.total_points || 0,
      rate: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0
    };
  });

  // Tasks by Category
  const taskCategories = ["تنظيف", "طبخ", "غسيل", "تسوق", "صيانة", "حديقة", "أخرى"];
  const tasksByCategoryData = taskCategories.map(cat => ({
    name: cat,
    value: tasks.filter(t => t.category === cat).length
  })).filter(d => d.value > 0);

  // Inventory by Room
  const roomGroups = inventory.reduce((acc, item) => {
    const room = item.room || 'غير محدد';
    if (!acc[room]) acc[room] = { count: 0, value: 0 };
    acc[room].count++;
    acc[room].value += item.current_value || 0;
    return acc;
  }, {});

  const inventoryByRoomData = Object.entries(roomGroups).map(([room, data]) => ({
    name: room,
    count: data.count,
    value: data.value
  }));

  // Inventory by Category
  const categoryGroups = inventory.reduce((acc, item) => {
    const cat = item.category || 'أخرى';
    if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
    acc[cat].count++;
    acc[cat].value += item.current_value || 0;
    return acc;
  }, {});

  const inventoryByCategoryData = Object.entries(categoryGroups).map(([cat, data]) => ({
    name: cat,
    value: data.value
  })).filter(d => d.value > 0);

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.current_value || 0), 0);

  // Warranty Expiry Analysis
  const warrantyItems = inventory.filter(item => item.warranty_expiry);
  const expiringWarranties = warrantyItems.filter(item => {
    const daysUntil = differenceInDays(new Date(item.warranty_expiry), new Date());
    return daysUntil >= 0 && daysUntil <= 90;
  });
  const expiredWarranties = warrantyItems.filter(item => isPast(new Date(item.warranty_expiry)));

  const warrantyTimelineData = [
    { name: 'منتهية', value: expiredWarranties.length, color: '#ef4444' },
    { name: 'خلال 30 يوم', value: warrantyItems.filter(i => {
      const d = differenceInDays(new Date(i.warranty_expiry), new Date());
      return d >= 0 && d <= 30;
    }).length, color: '#f59e0b' },
    { name: 'خلال 90 يوم', value: warrantyItems.filter(i => {
      const d = differenceInDays(new Date(i.warranty_expiry), new Date());
      return d > 30 && d <= 90;
    }).length, color: '#3b82f6' },
    { name: 'سارية', value: warrantyItems.filter(i => {
      const d = differenceInDays(new Date(i.warranty_expiry), new Date());
      return d > 90;
    }).length, color: '#10b981' }
  ].filter(d => d.value > 0);

  // Maintenance Stats
  const overdueMaintenance = maintenance.filter(m => 
    m.next_maintenance_date && isPast(new Date(m.next_maintenance_date)) && m.status !== 'مكتملة'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">التحليلات والتقارير</h1>
          <p className="text-slate-500">رؤى وإحصائيات حول استخدام التطبيق</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">قيمة المخزون</p>
                  <p className="text-2xl font-bold">{totalInventoryValue.toLocaleString()}</p>
                  <p className="text-emerald-100 text-xs">ج.م</p>
                </div>
                <Package className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">المهام المكتملة</p>
                  <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'مكتملة').length}</p>
                  <p className="text-blue-100 text-xs">من {tasks.length}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">أفراد العائلة</p>
                  <p className="text-2xl font-bold">{familyMembers.length}</p>
                  <p className="text-purple-100 text-xs">عضو</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">تنبيهات</p>
                  <p className="text-2xl font-bold">{expiringWarranties.length + overdueMaintenance}</p>
                  <p className="text-amber-100 text-xs">تحتاج انتباه</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-white/80 shadow-sm">
            <TabsTrigger value="tasks">المهام</TabsTrigger>
            <TabsTrigger value="inventory">المخزون</TabsTrigger>
            <TabsTrigger value="warranty">الضمانات</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    المهام المكتملة حسب الفرد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksByMember.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tasksByMember} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#10b981" name="مكتملة" />
                        <Bar dataKey="total" fill="#e5e7eb" name="إجمالي" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-12">لا توجد بيانات</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                    توزيع أنواع المهام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksByCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={tasksByCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {tasksByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-12">لا توجد بيانات</p>
                  )}
                </CardContent>
              </Card>

              {/* Member Performance with Period Selection */}
              <div className="md:col-span-2">
                <TaskCompletionChart tasks={tasks} familyMembers={familyMembers} />
              </div>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>قيمة المخزون حسب الغرفة</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryByRoomData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={inventoryByRoomData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} ج.م`} />
                        <Bar dataKey="value" fill="#10b981" name="القيمة" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-12">لا توجد بيانات</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>قيمة المخزون حسب التصنيف</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryByCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={inventoryByCategoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {inventoryByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} ج.م`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-12">لا توجد بيانات</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg md:col-span-2">
                <CardHeader>
                  <CardTitle>تفاصيل المخزون</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(categoryGroups).map(([cat, data], index) => (
                      <div key={cat} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{cat}</span>
                        </div>
                        <p className="text-2xl font-bold">{data.count}</p>
                        <p className="text-sm text-slate-500">{data.value.toLocaleString()} ج.م</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Warranty Tab */}
          <TabsContent value="warranty" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    حالة الضمانات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {warrantyTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={warrantyTimelineData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {warrantyTimelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-400 py-12">لا توجد ضمانات مسجلة</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Alerts Report */}
              <UpcomingAlertsReport inventory={inventory} maintenance={maintenance} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}