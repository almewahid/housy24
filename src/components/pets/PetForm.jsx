import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const petTypes = ["قطة", "فرس", "طائر", "سمك", "أرنب", "سلحفاة", "أخرى"];
const groomingSchedules = ["يومي", "أسبوعي", "كل أسبوعين", "شهري"];
const healthStatuses = ["ممتاز", "جيد", "يحتاج متابعة", "مريض"];

export default function PetForm({ pet, onSave, onCancel }) {
  const [formData, setFormData] = useState(pet || {
    name: '',
    type: 'قطة',
    breed: '',
    birth_date: '',
    gender: 'ذكر',
    color: '',
    weight: '',
    vet_name: '',
    vet_phone: '',
    grooming_schedule: 'أسبوعي',
    health_status: 'جيد',
    health_notes: '',
    special_needs: '',
    is_active: true
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تنظيف البيانات: تحويل القيم الفارغة إلى null
    const cleanData = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed || null,
      birth_date: formData.birth_date || null,
      gender: formData.gender,
      color: formData.color || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      vet_name: formData.vet_name || null,
      vet_phone: formData.vet_phone || null,
      grooming_schedule: formData.grooming_schedule,
      health_status: formData.health_status,
      health_notes: formData.health_notes || null,
      special_needs: formData.special_needs || null,
      is_active: true
    };
    
    onSave(cleanData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-auto"
      >
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-xl">
          <CardHeader className="sticky top-0 bg-white dark:bg-slate-800 z-10 border-b dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                {pet ? 'تعديل معلومات الحيوان' : 'إضافة حيوان'}
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>النوع *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {petTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>السلالة</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => handleChange('breed', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>الجنس</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>تاريخ الميلاد</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleChange('birth_date', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>اللون</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>الوزن (كجم)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الطبيب البيطري</Label>
                  <Input
                    value={formData.vet_name}
                    onChange={(e) => handleChange('vet_name', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>رقم الطبيب</Label>
                  <Input
                    value={formData.vet_phone}
                    onChange={(e) => handleChange('vet_phone', e.target.value)}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>جدول التنظيف</Label>
                  <Select value={formData.grooming_schedule} onValueChange={(v) => handleChange('grooming_schedule', v)}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groomingSchedules.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الحالة الصحية</Label>
                  <Select value={formData.health_status} onValueChange={(v) => handleChange('health_status', v)}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {healthStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>ملاحظات صحية</Label>
                <Textarea
                  value={formData.health_notes}
                  onChange={(e) => handleChange('health_notes', e.target.value)}
                  rows={2}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <Label>احتياجات خاصة</Label>
                <Textarea
                  value={formData.special_needs}
                  onChange={(e) => handleChange('special_needs', e.target.value)}
                  rows={2}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="dark:border-slate-600 dark:hover:bg-slate-700">
                  إلغاء
                </Button>
                <Button type="submit" disabled={!formData.name}>
                  حفظ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}