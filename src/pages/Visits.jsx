import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Plus, MapPin, Clock, Calendar, User, Trash2, Edit, CheckCircle2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const visitTypes = ["زيارة عائلية", "زيارة أصدقاء", "تسوق", "عمل", "طبيب", "مدرسة", "مسجد", "نزهة", "أخرى"];
const statuses = ["مخطط", "قيد التنفيذ", "مكتمل", "ملغي"];

const typeColors = {
  "زيارة عائلية": "bg-rose-100 text-rose-700",
  "زيارة أصدقاء": "bg-purple-100 text-purple-700",
  "تسوق": "bg-amber-100 text-amber-700",
  "عمل": "bg-blue-100 text-blue-700",
  "طبيب": "bg-red-100 text-red-700",
  "مدرسة": "bg-green-100 text-green-700",
  "مسجد": "bg-emerald-100 text-emerald-700",
  "نزهة": "bg-cyan-100 text-cyan-700",
  "أخرى": "bg-gray-100 text-gray-700"
};

const typeGradients = {
  "زيارة عائلية": "from-rose-400 to-rose-500",
  "زيارة أصدقاء": "from-purple-400 to-purple-500",
  "تسوق": "from-amber-400 to-amber-500",
  "عمل": "from-blue-400 to-blue-500",
  "طبيب": "from-red-400 to-red-500",
  "مدرسة": "from-green-400 to-green-500",
  "مسجد": "from-emerald-400 to-emerald-500",
  "نزهة": "from-cyan-400 to-cyan-500",
  "أخرى": "from-gray-400 to-gray-500"
};

const statusColors = {
  "مخطط": "bg-blue-100 text-blue-700",
  "قيد التنفيذ": "bg-amber-100 text-amber-700",
  "مكتمل": "bg-green-100 text-green-700",
  "ملغي": "bg-gray-100 text-gray-700"
};

export default function Visits() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [statusFilter, setStatusFilter] = useState('الكل');

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('visits')
        .insert([data])
        .select();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('visits')
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowForm(false);
      setEditingVisit(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits'] })
  });

  const filteredVisits = visits.filter(v => 
    statusFilter === 'الكل' || v.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50/50 to-purple-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">الزيارات والمشاوير</h1>
            <p className="text-slate-500">سجل زيارات ومشاوير أفراد العائلة</p>
          </div>
          <Button onClick={() => { setEditingVisit(null); setShowForm(true); }} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Plus className="w-5 h-5" />
            إضافة مشوار
          </Button>
        </div>

        {/* Filters */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="bg-white/80">
            <TabsTrigger value="الكل">الكل</TabsTrigger>
            <TabsTrigger value="مخطط">مخطط</TabsTrigger>
            <TabsTrigger value="قيد التنفيذ">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="مكتمل">مكتمل</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Visits List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredVisits.map((visit, index) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all group overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${typeGradients[visit.type] || typeGradients["أخرى"]}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${typeGradients[visit.type] || typeGradients["أخرى"]}`}>
                          <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 mb-1">{visit.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className={typeColors[visit.type]}>{visit.type}</Badge>
                            <Badge className={statusColors[visit.status]}>{visit.status}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{visit.visitor_name}</span>
                            </div>
                            {visit.destination && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{visit.destination}</span>
                              </div>
                            )}
                            {visit.date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(visit.date), 'd MMM yyyy', { locale: ar })}</span>
                                {visit.time && <span>- {visit.time}</span>}
                              </div>
                            )}
                          </div>
                          {visit.notes && (
                            <p className="text-slate-500 text-sm mt-2">{visit.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {visit.status !== 'مكتمل' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-600"
                            onClick={() => updateMutation.mutate({ id: visit.id, data: { ...visit, status: 'مكتمل' } })}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingVisit(visit); setShowForm(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(visit.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredVisits.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد زيارات</p>
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVisit ? 'تعديل المشوار' : 'إضافة مشوار جديد'}</DialogTitle>
            </DialogHeader>
            <VisitForm 
              visit={editingVisit}
              members={members}
              onSave={(data) => {
                if (editingVisit) {
                  updateMutation.mutate({ id: editingVisit.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function VisitForm({ visit, members, onSave, onCancel }) {
  const [formData, setFormData] = useState(visit || {
    title: '',
    type: 'أخرى',
    visitor_name: '',
    destination: '',
    address: '',
    date: '',
    time: '',
    notes: '',
    status: 'مخطط'
  });

  const handleSubmit = () => {
    // تنظيف البيانات قبل الحفظ
    const dataToSave = {
      title: formData.title,
      type: formData.type || 'أخرى',
      visitor_name: formData.visitor_name,
      destination: formData.destination || null,
      address: formData.address || null,
      date: formData.date || null,
      time: formData.time || null,
      notes: formData.notes || null,
      status: formData.status || 'مخطط',
      created_by: 'user' // أضف اسم المستخدم هنا
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>العنوان *</Label>
        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="مثال: زيارة الجدة" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>النوع</Label>
          <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {visitTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>الشخص/الأشخاص *</Label>
          <Select value={formData.visitor_name} onValueChange={v => setFormData({...formData, visitor_name: v})}>
            <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="الجميع">الجميع</SelectItem>
              {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>الوجهة</Label>
        <Input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>التاريخ</Label>
          <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div>
          <Label>الوقت</Label>
          <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
        </div>
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.title || !formData.visitor_name}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Save className="w-4 h-4 ml-2" />
          حفظ
        </Button>
      </div>
    </div>
  );
}