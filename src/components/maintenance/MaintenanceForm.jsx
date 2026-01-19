import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save } from "lucide-react";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

const maintenanceTypes = ["تنظيف", "فحص", "تغيير قطع", "صيانة دورية", "إصلاح", "أخرى"];
const frequencies = ["يومي", "أسبوعي", "شهري", "كل 3 أشهر", "كل 6 أشهر", "سنوي"];
const statuses = ["مجدولة", "قيد التنفيذ", "مكتملة", "متأخرة"];

const calculateNextDate = (lastDate, frequency) => {
  const date = lastDate ? new Date(lastDate) : new Date();
  switch (frequency) {
    case "يومي": return addDays(date, 1);
    case "أسبوعي": return addWeeks(date, 1);
    case "شهري": return addMonths(date, 1);
    case "كل 3 أشهر": return addMonths(date, 3);
    case "كل 6 أشهر": return addMonths(date, 6);
    case "سنوي": return addYears(date, 1);
    default: return addMonths(date, 1);
  }
};

export default function MaintenanceForm({ maintenance, inventoryItems, onSave, onCancel }) {
  const [formData, setFormData] = useState(maintenance || {
    item_name: '',
    item_id: '',
    maintenance_type: 'صيانة دورية',
    frequency: 'شهري',
    last_maintenance_date: '',
    next_maintenance_date: '',
    notes: '',
    cost: '',
    status: 'مجدولة',
    reminder_enabled: true,
    reminder_days_before: 3
  });

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'last_maintenance_date' || field === 'frequency') {
        const nextDate = calculateNextDate(updated.last_maintenance_date, updated.frequency);
        updated.next_maintenance_date = nextDate.toISOString().split('T')[0];
      }
      if (field === 'item_id' && inventoryItems) {
        const item = inventoryItems.find(i => i.id === value);
        if (item) updated.item_name = item.name;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    // تنظيف البيانات: تحويل القيم الفارغة إلى null
    const dataToSave = {
      item_name: formData.item_name,
      item_id: formData.item_id || null,
      maintenance_type: formData.maintenance_type,
      frequency: formData.frequency,
      last_maintenance_date: formData.last_maintenance_date || null,
      next_maintenance_date: formData.next_maintenance_date || null,
      notes: formData.notes || null,
      cost: formData.cost ? Number(formData.cost) : null,
      status: formData.status,
      reminder_enabled: formData.reminder_enabled,
      reminder_days_before: Number(formData.reminder_days_before) || 3
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{maintenance ? 'تعديل الصيانة' : 'إضافة صيانة جديدة'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {inventoryItems && inventoryItems.length > 0 ? (
            <div className="space-y-2">
              <Label>اختر من المخزون</Label>
              <Select value={formData.item_id} onValueChange={v => handleChange('item_id', v)}>
                <SelectTrigger><SelectValue placeholder="اختر جهاز" /></SelectTrigger>
                <SelectContent>
                  {inventoryItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>اسم الجهاز *</Label>
              <Input 
                value={formData.item_name} 
                onChange={e => handleChange('item_name', e.target.value)}
                placeholder="مثال: غسالة الملابس"
                required
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الصيانة</Label>
              <Select value={formData.maintenance_type} onValueChange={v => handleChange('maintenance_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>التكرار</Label>
              <Select value={formData.frequency} onValueChange={v => handleChange('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ آخر صيانة</Label>
              <Input type="date" value={formData.last_maintenance_date} onChange={e => handleChange('last_maintenance_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الصيانة القادمة</Label>
              <Input type="date" value={formData.next_maintenance_date} onChange={e => handleChange('next_maintenance_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>التكلفة</Label>
              <Input type="number" value={formData.cost} onChange={e => handleChange('cost', e.target.value)} placeholder="بالجنيه" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <Label>تفعيل التذكير</Label>
              <p className="text-xs text-slate-500">إرسال تذكير قبل موعد الصيانة</p>
            </div>
            <Switch checked={formData.reminder_enabled} onCheckedChange={v => handleChange('reminder_enabled', v)} />
          </div>
          
          {formData.reminder_enabled && (
            <div className="space-y-2">
              <Label>التذكير قبل (أيام)</Label>
              <Input type="number" value={formData.reminder_days_before} onChange={e => handleChange('reminder_days_before', e.target.value)} min={1} max={30} />
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!formData.item_name} className="bg-amber-600 hover:bg-amber-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}