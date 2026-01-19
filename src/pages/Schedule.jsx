import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, User, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScheduleCard from '@/components/schedule/ScheduleCard';
import ScheduleForm from '@/components/schedule/ScheduleForm';

const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const categories = ["الكل", "حفظ قرآن", "مذاكرة", "دروس خصوصية", "مدرسة", "واجبات", "رياضة", "لياقة", "أخرى"];

export default function Schedule() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedChild, setSelectedChild] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [viewMode, setViewMode] = useState('week');
  
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => base44.entities.Schedule.list()
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Schedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Schedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Schedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] })
  });

  const handleSave = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleToggleComplete = (item) => {
    updateMutation.mutate({ id: item.id, data: { ...item, completed: !item.completed } });
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesChild = selectedChild === 'الكل' || s.child_name === selectedChild;
    const matchesCategory = selectedCategory === 'الكل' || s.category === selectedCategory;
    return matchesChild && matchesCategory;
  });

  const getSchedulesForDay = (day) => {
    return filteredSchedules.filter(s => s.day_of_week === day)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  };

  const children = familyMembers.filter(m => ["ابن", "ابنة"].includes(m.role));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">جدول الأنشطة</h1>
            <p className="text-slate-500">تنظيم جدول الأولاد للدراسة والأنشطة</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-5 h-5 ml-2" />
            إضافة نشاط
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-40 bg-white/80">
              <User className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الكل">كل الأولاد</SelectItem>
              {children.length > 0 ? (
                children.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
              ) : (
                familyMembers.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)
              )}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="bg-white/80">
              <TabsTrigger value="week">عرض أسبوعي</TabsTrigger>
              <TabsTrigger value="list">عرض قائمة</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Weekly View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map(day => {
              const daySchedules = getSchedulesForDay(day);
              const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
              const isToday = today.includes(day);
              
              return (
                <Card 
                  key={day} 
                  className={`bg-white/80 backdrop-blur-sm border-0 shadow-sm ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
                >
                  <CardHeader className={`p-3 ${isToday ? 'bg-indigo-50' : 'bg-slate-50'} rounded-t-lg`}>
                    <CardTitle className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {day}
                      {isToday && <span className="mr-2 text-xs font-normal">(اليوم)</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2 min-h-[200px]">
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">لا توجد أنشطة</p>
                    ) : (
                      daySchedules.map(schedule => (
                        <ScheduleCard 
                          key={schedule.id} 
                          schedule={schedule} 
                          onClick={handleEdit}
                          compact
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/80 rounded-xl h-24 animate-pulse" />
              ))
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد أنشطة</h3>
                <p className="text-slate-400 mb-6">ابدأ بإضافة أنشطة للأولاد</p>
                <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة نشاط
                </Button>
              </div>
            ) : (
              <motion.div className="space-y-4" layout>
                <AnimatePresence>
                  {filteredSchedules.map((schedule, index) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <ScheduleCard schedule={schedule} onClick={handleEdit} />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(schedule);
                          }}
                          className={schedule.completed ? 'text-amber-500' : 'text-emerald-500'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(schedule.id);
                          }}
                          className="text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {categories.slice(1).map(cat => {
            const count = schedules.filter(s => s.category === cat).length;
            if (count === 0) return null;
            return (
              <div key={cat} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500">{cat}</p>
                <p className="text-2xl font-bold text-slate-800">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ScheduleForm
            schedule={editingItem}
            familyMembers={familyMembers}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}