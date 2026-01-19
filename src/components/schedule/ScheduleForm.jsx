import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save } from "lucide-react";

const categories = ["حفظ قرآن", "مذاكرة", "دروس خصوصية", "مدرسة", "واجبات", "رياضة", "لياقة", "أخرى"];
const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const colors = [
  { name: "أزرق", value: "#3b82f6" },
  { name: "أخضر", value: "#22c55e" },
  { name: "بنفسجي", value: "#8b5cf6" },
  { name: "وردي", value: "#ec4899" },
  { name: "برتقالي", value: "#f97316" },
  { name: "أحمر", value: "#ef4444" },
  { name: "سماوي", value: "#06b6d4" },
  { name: "أصفر", value: "#eab308" }
];

export default function ScheduleForm({ schedule, familyMembers, onSave, onCancel }) {
  const [formData, setFormData] = useState(schedule || {
    title: '',
    category: 'مذاكرة',
    child_name: '',
    day_of_week: 'الأحد',
    start_time: '08:00',
    end_time: '09:00',
    location: '',
    is_recurring: true,
    specific_date: '',
    notes: '',
    color: '#3b82f6',
    completed: false,
    reminder_enabled: true,
    reminder_minutes_before: 30
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // تنظيف البيانات: تحويل القيم الفارغة إلى null
    const dataToSave = {
      title: formData.title,
      category: formData.category,
      child_name: formData.child_name,
      day_of_week: formData.day_of_week || null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      location: formData.location || null,
      is_recurring: formData.is_recurring,
      specific_date: formData.specific_date || null,
      notes: formData.notes || null,
      color: formData.color || '#3b82f6',
      completed: formData.completed || false,
      reminder_enabled: formData.reminder_enabled,
      reminder_minutes_before: Number(formData.reminder_minutes_before) || 30
    };
    onSave(dataToSave);
  };

  const children = familyMembers?.filter(m => ["ابن", "ابنة"].includes(m.role)) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{schedule ? 'تعديل النشاط' : 'إضافة نشاط جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>عنوان النشاط *</Label>
            <Input 
              value={formData.title} 
              onChange={e => handleChange('title', e.target.value)}
              placeholder="مثال: حصة الرياضيات"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع النشاط</Label>
              <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الطفل *</Label>
              <Select value={formData.child_name} onValueChange={v => handleChange('child_name', v)}>
                <SelectTrigger><SelectValue placeholder="اختر طفل" /></SelectTrigger>
                <SelectContent>
                  {children.length > 0 ? (
                    children.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                  ) : (
                    familyMembers?.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>يوم الأسبوع</Label>
              <Select value={formData.day_of_week} onValueChange={v => handleChange('day_of_week', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المكان</Label>
              <Input value={formData.location} onChange={e => handleChange('location', e.target.value)} placeholder="مثال: البيت" />
            </div>
            <div className="space-y-2">
              <Label>وقت البدء</Label>
              <Input type="time" value={formData.start_time} onChange={e => handleChange('start_time', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>وقت الانتهاء</Label>
              <Input type="time" value={formData.end_time} onChange={e => handleChange('end_time', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>اللون</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => handleChange('color', c.value)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <Label>نشاط متكرر</Label>
              <p className="text-xs text-slate-500">يتكرر كل أسبوع</p>
            </div>
            <Switch checked={formData.is_recurring} onCheckedChange={v => handleChange('is_recurring', v)} />
          </div>

          {!formData.is_recurring && (
            <div className="space-y-2">
              <Label>تاريخ محدد</Label>
              <Input type="date" value={formData.specific_date} onChange={e => handleChange('specific_date', e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <Label>تفعيل التذكير</Label>
              <p className="text-xs text-slate-500">إرسال تذكير قبل بدء النشاط</p>
            </div>
            <Switch checked={formData.reminder_enabled} onCheckedChange={v => handleChange('reminder_enabled', v)} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.child_name} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}