import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Wrench, AlertTriangle, CheckCircle2, Clock, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';

const statusColors = {
  "مجدولة": "bg-blue-100 text-blue-700",
  "قيد التنفيذ": "bg-amber-100 text-amber-700",
  "مكتملة": "bg-green-100 text-green-700",
  "متأخرة": "bg-red-100 text-red-700"
};

const typeIcons = {
  "تنظيف": "🧹",
  "فحص": "🔍",
  "تغيير قطع": "🔧",
  "صيانة دورية": "⚙️",
  "إصلاح": "🛠️",
  "أخرى": "📋"
};

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  const { data: maintenanceItems = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.Maintenance.list('-next_maintenance_date')
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.InventoryItem.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Maintenance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Maintenance.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Maintenance.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] })
  });

  const handleSave = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const markAsComplete = (item) => {
    updateMutation.mutate({ 
      id: item.id, 
      data: { ...item, status: 'مكتملة', last_maintenance_date: new Date().toISOString().split('T')[0] } 
    });
  };

  // Update status for overdue items
  const processedItems = maintenanceItems.map(item => {
    if (item.next_maintenance_date && isPast(new Date(item.next_maintenance_date)) && item.status !== 'مكتملة') {
      return { ...item, status: 'متأخرة' };
    }
    return item;
  });

  const filteredItems = processedItems.filter(item => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'الكل' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = processedItems.filter(i => i.status === 'متأخرة').length;
  const upcomingCount = processedItems.filter(i => {
    if (!i.next_maintenance_date || i.status === 'مكتملة') return false;
    const days = differenceInDays(new Date(i.next_maintenance_date), new Date());
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">الصيانة الدورية</h1>
            <p className="text-slate-500">جدولة صيانة الأجهزة المنزلية وتتبعها</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="w-5 h-5" />
            إضافة صيانة
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceItems.length}</p>
                <p className="text-sm text-slate-500">إجمالي</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-sm text-slate-500">متأخرة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingCount}</p>
                <p className="text-sm text-slate-500">قريبة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedItems.filter(i => i.status === 'مكتملة').length}</p>
                <p className="text-sm text-slate-500">مكتملة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ابحث عن جهاز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/80"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-white/80">
              <TabsTrigger value="الكل">الكل</TabsTrigger>
              <TabsTrigger value="مجدولة">مجدولة</TabsTrigger>
              <TabsTrigger value="متأخرة">متأخرة</TabsTrigger>
              <TabsTrigger value="مكتملة">مكتملة</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Maintenance List */}
        {isLoading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">لا توجد صيانات</p>
            <Button onClick={() => setShowForm(true)}>إضافة أول صيانة</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => {
                const daysUntil = item.next_maintenance_date 
                  ? differenceInDays(new Date(item.next_maintenance_date), new Date()) 
                  : null;
                const isOverdue = daysUntil !== null && daysUntil < 0;
                const isUpcoming = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-0 shadow-md hover:shadow-lg transition-all group ${
                      isOverdue ? 'bg-red-50' : isUpcoming ? 'bg-amber-50' : 'bg-white/90'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">{typeIcons[item.maintenance_type] || "📋"}</div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-800 mb-1">{item.item_name}</h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary">{item.maintenance_type}</Badge>
                                <Badge className={statusColors[item.status]}>{item.status}</Badge>
                                <Badge variant="outline">{item.frequency}</Badge>
                              </div>
                              {item.next_maintenance_date && (
                                <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                  {isOverdue ? (
                                    <>متأخرة بـ {Math.abs(daysUntil)} يوم</>
                                  ) : (
                                    <>الموعد القادم: {format(new Date(item.next_maintenance_date), 'd MMM yyyy', { locale: ar })}</>
                                  )}
                                </p>
                              )}
                              {item.cost > 0 && (
                                <p className="text-sm text-slate-500 mt-1">التكلفة: {item.cost} ج.م</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.status !== 'مكتملة' && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-green-600"
                                onClick={() => markAsComplete(item)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => { setEditingItem(item); setShowForm(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => deleteMutation.mutate(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <MaintenanceForm 
              item={editingItem}
              inventoryItems={inventoryItems}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}