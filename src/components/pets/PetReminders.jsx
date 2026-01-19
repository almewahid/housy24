import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, Bell, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';

const reminderTypes = ["مشي", "تدريب", "دواء", "طعام", "تنظيف", "طبيب", "أخرى"];
const frequencies = ["مرة واحدة", "يومي", "أسبوعي", "شهري"];
const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function PetReminders({ pet }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: pet.id,
    pet_name: pet.name,
    reminder_type: 'مشي',
    title: '',
    description: '',
    frequency: 'يومي',
    time: '09:00',
    days_of_week: [],
    notification_enabled: true
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['petReminders', pet.id],
    queryFn: () => base44.entities.PetReminder.filter({ pet_id: pet.id })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PetReminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petReminders'] });
      setShowForm(false);
      setFormData({
        pet_id: pet.id,
        pet_name: pet.name,
        reminder_type: 'مشي',
        title: '',
        description: '',
        frequency: 'يومي',
        time: '09:00',
        days_of_week: [],
        notification_enabled: true
      });
    }
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PetReminder.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['petReminders'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PetReminder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['petReminders'] })
  });

  const handleComplete = (reminder) => {
    completeMutation.mutate({
      id: reminder.id,
      data: {
        ...reminder,
        completed: true,
        last_completed_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const toggleDay = (day) => {
    if (formData.days_of_week.includes(day)) {
      setFormData({
        ...formData,
        days_of_week: formData.days_of_week.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        days_of_week: [...formData.days_of_week, day]
      });
    }
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedToday = reminders.filter(r => 
    r.completed && r.last_completed_date === new Date().toISOString().split('T')[0]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">التذكيرات</h3>
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          تذكير جديد
        </Button>
      </div>

      <div className="space-y-3">
        {activeReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {reminder.reminder_type}
                      </Badge>
                      <Badge variant="outline" className="dark:border-slate-500">
                        {reminder.frequency}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{reminder.title}</h4>
                    {reminder.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{reminder.time}</span>
                      </div>
                      {reminder.notification_enabled && (
                        <div className="flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          <span>تذكير مفعل</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleComplete(reminder)}
                      className="h-8 w-8 dark:border-slate-500"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(reminder.id)}
                      className="h-8 w-8 text-red-500 dark:border-slate-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {activeReminders.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد تذكيرات نشطة</p>
          </div>
        )}
      </div>

      {completedToday.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            تم اليوم ({completedToday.length})
          </h4>
          <div className="space-y-2">
            {completedToday.map((reminder) => (
              <div 
                key={reminder.id}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">{reminder.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md dark:bg-slate-800 dark:text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة تذكير جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>نوع التذكير</Label>
              <Select value={formData.reminder_type} onValueChange={(v) => setFormData({...formData, reminder_type: v})}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>العنوان *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: مشي الصباح"
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>التكرار</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                  <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الوقت</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </div>

            {formData.frequency === 'أسبوعي' && (
              <div>
                <Label>أيام الأسبوع</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={formData.days_of_week.includes(day) ? 'default' : 'outline'}
                      onClick={() => toggleDay(day)}
                      className="dark:border-slate-600"
                    >
                      {day.substring(0, 2)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="dark:border-slate-600">
                إلغاء
              </Button>
              <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.title}>
                إضافة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}