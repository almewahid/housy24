import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { db as base44 } from '@/components/api/db';
import { Slider } from '@/components/ui/slider';

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'other',
    assigned_to: '',
    due_date: new Date().toISOString().split('T')[0],
    progress: 0,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // استخدام FamilyMember بدلاً من User
      const familyMembers = await base44.entities.FamilyMember.list();
      setUsers(familyMembers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تنظيف البيانات
    const cleanData = {
  title: formData.title,
  description: formData.description || null,
  status: formData.status,
  priority: formData.priority,
  category: formData.category,
  assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to,  // أضف هذا
  due_date: formData.due_date,
  progress: formData.progress || 0,
};
    
    onSubmit(cleanData);
  };

  const categories = [
    { value: 'cleaning', label: 'تنظيف' },
    { value: 'cooking', label: 'طبخ' },
    { value: 'shopping', label: 'تسوق' },
    { value: 'laundry', label: 'غسيل' },
    { value: 'childcare', label: 'رعاية الأطفال' },
    { value: 'maintenance', label: 'صيانة' },
    { value: 'organization', label: 'تنظيم' },
    { value: 'other', label: 'أخرى' },
  ];

  const priorities = [
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' },
    { value: 'urgent', label: 'عاجلة' },
  ];

  const statuses = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'completed', label: 'مكتملة' },
    { value: 'cancelled', label: 'ملغاة' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المهمة *</label>
          <Input
            placeholder="أدخل عنوان المهمة..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
          <Textarea
            placeholder="أضف تفاصيل المهمة..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="h-24 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المسؤول</label>
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المسؤول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">غير محدد</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.email || u.id} value={u.email || u.id}>
                    {u.name || u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-right">
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.due_date ? format(new Date(formData.due_date), 'PPP', { locale: ar }) : 'اختر التاريخ'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.due_date ? new Date(formData.due_date) : undefined}
                onSelect={(date) => setFormData({ ...formData, due_date: date ? date.toISOString().split('T')[0] : '' })}
                locale={ar}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الإنجاز: {formData.progress}%</label>
          <Slider
            value={[formData.progress]}
            onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="ml-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
            <Save className="ml-2 h-4 w-4" />
            {task ? 'تحديث المهمة' : 'إنشاء المهمة'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}