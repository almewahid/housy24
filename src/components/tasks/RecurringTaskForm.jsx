import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Save, X, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function RecurringTaskForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    assigned_to: '',
    recurrence_type: 'daily',
    recurrence_interval: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
  });

  const [users, setUsers] = useState([]);
  const [hasEndDate, setHasEndDate] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (!hasEndDate) {
      delete dataToSubmit.end_date;
    }
    onSubmit(dataToSubmit);
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

  const recurrenceTypes = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'monthly', label: 'شهرياً' },
    { value: 'yearly', label: 'سنوياً' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Repeat className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-900">إنشاء مهمة متكررة</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المهمة *</label>
          <Input
            placeholder="مثال: تنظيف المطبخ"
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
            className="h-20 resize-none"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">المسؤول</label>
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المسؤول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>غير محدد</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.email} value={u.email}>{u.full_name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التكرار *</label>
            <Select value={formData.recurrence_type} onValueChange={(value) => setFormData({ ...formData, recurrence_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التكرار" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceTypes.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-right">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.start_date ? format(new Date(formData.start_date), 'PPP', { locale: ar }) : 'اختر التاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, start_date: date ? date.toISOString().split('T')[0] : '' })}
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">تاريخ الانتهاء</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={hasEndDate}
                  onCheckedChange={setHasEndDate}
                  id="has-end-date"
                />
                <Label htmlFor="has-end-date" className="text-xs text-gray-600">تحديد نهاية</Label>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-right"
                  disabled={!hasEndDate}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.end_date ? format(new Date(formData.end_date), 'PPP', { locale: ar }) : 'اختر التاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.end_date ? new Date(formData.end_date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, end_date: date ? date.toISOString().split('T')[0] : '' })}
                  locale={ar}
                  disabled={(date) => date < new Date(formData.start_date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="ml-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
            <Save className="ml-2 h-4 w-4" />
            إنشاء المهمة المتكررة
          </Button>
        </div>
      </form>
    </motion.div>
  );
}