import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";

const frequencyTypes = ["يومي", "كل عدة ساعات", "أسبوعي", "عند الحاجة"];
const timings = ["قبل الأكل", "بعد الأكل", "مع الأكل", "صباحاً", "مساءً", "عند النوم", "أي وقت"];
const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function MedicationForm({ medication, familyMembers, onSave, onCancel }) {
  const [formData, setFormData] = useState(medication || {
    name: '',
    family_member: '',
    dosage: '',
    frequency_type: 'يومي',
    times_per_day: [],
    interval_hours: null,
    days_of_week: [],
    timing: 'أي وقت',
    start_date: '',
    end_date: '',
    quantity_remaining: null,
    notes: '',
    reminder_enabled: true,
    is_active: true
  });

  const [newTime, setNewTime] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTime = () => {
    if (newTime && !formData.times_per_day.includes(newTime)) {
      handleChange('times_per_day', [...formData.times_per_day, newTime]);
      setNewTime('');
    }
  };

  const removeTime = (time) => {
    handleChange('times_per_day', formData.times_per_day.filter(t => t !== time));
  };

  const toggleDay = (day) => {
    if (formData.days_of_week.includes(day)) {
      handleChange('days_of_week', formData.days_of_week.filter(d => d !== day));
    } else {
      handleChange('days_of_week', [...formData.days_of_week, day]);
    }
  };

  const handleSubmit = () => {
    // تنظيف البيانات قبل الحفظ
    const dataToSave = {
      name: formData.name,
      family_member: formData.family_member,
      dosage: formData.dosage || null,
      frequency_type: formData.frequency_type || null,
      times_per_day: formData.times_per_day.length > 0 ? formData.times_per_day : null,
      interval_hours: formData.interval_hours || null,
      days_of_week: formData.days_of_week.length > 0 ? formData.days_of_week : null,
      timing: formData.timing || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      quantity_remaining: formData.quantity_remaining || null,
      notes: formData.notes || null,
      reminder_enabled: formData.reminder_enabled ?? true,
      is_active: formData.is_active ?? true
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>{medication ? 'تعديل الدواء' : 'إضافة دواء جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>اسم الدواء *</Label>
            <Input 
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="مثال: باراسيتامول"
            />
          </div>

          <div>
            <Label>فرد العائلة *</Label>
            <Select value={formData.family_member} onValueChange={v => handleChange('family_member', v)}>
              <SelectTrigger><SelectValue placeholder="اختر فرد العائلة" /></SelectTrigger>
              <SelectContent>
                {familyMembers?.map(m => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>الجرعة</Label>
            <Input 
              value={formData.dosage}
              onChange={e => handleChange('dosage', e.target.value)}
              placeholder="مثال: حبة واحدة، 5 مل"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نوع التكرار</Label>
              <Select value={formData.frequency_type} onValueChange={v => handleChange('frequency_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencyTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التوقيت</Label>
              <Select value={formData.timing} onValueChange={v => handleChange('timing', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {timings.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.frequency_type === 'كل عدة ساعات' && (
            <div>
              <Label>كل كم ساعة</Label>
              <Input 
                type="number"
                min="1"
                max="24"
                value={formData.interval_hours || ''}
                onChange={e => handleChange('interval_hours', parseInt(e.target.value) || null)}
                placeholder="مثال: 6"
              />
            </div>
          )}

          {(formData.frequency_type === 'يومي' || formData.frequency_type === 'أسبوعي') && (
            <div>
              <Label>أوقات تناول الدواء</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addTime}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.times_per_day.map(time => (
                  <Badge key={time} variant="secondary" className="gap-1">
                    {time}
                    <button onClick={() => removeTime(time)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.frequency_type === 'أسبوعي' && (
            <div>
              <Label>أيام الأسبوع</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.days_of_week.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاريخ البدء</Label>
              <Input 
                type="date"
                value={formData.start_date || ''}
                onChange={e => handleChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label>تاريخ الانتهاء</Label>
              <Input 
                type="date"
                value={formData.end_date || ''}
                onChange={e => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>الكمية المتبقية</Label>
            <Input 
              type="number"
              min="0"
              value={formData.quantity_remaining || ''}
              onChange={e => handleChange('quantity_remaining', parseInt(e.target.value) || null)}
              placeholder="عدد الحبات أو العبوات"
            />
          </div>

          <div>
            <Label>ملاحظات</Label>
            <Textarea 
              value={formData.notes || ''}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="ملاحظات إضافية..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="reminder"
              checked={formData.reminder_enabled}
              onCheckedChange={v => handleChange('reminder_enabled', v)}
            />
            <Label htmlFor="reminder" className="cursor-pointer">تفعيل التذكير</Label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || !formData.family_member}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}