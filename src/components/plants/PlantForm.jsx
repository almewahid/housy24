import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addDays, addWeeks, addMonths } from "date-fns";

const wateringFrequencies = ["يومي", "كل يومين", "كل 3 أيام", "أسبوعي", "كل أسبوعين", "شهري"];
const sunlightNeeds = ["ضوء مباشر", "ضوء غير مباشر", "ظل جزئي", "ظل كامل"];
const fertilizingFrequencies = ["أسبوعي", "كل أسبوعين", "شهري", "كل 3 أشهر", "موسمي"];
const seasons = ["طوال السنة", "الربيع", "الصيف", "الخريف", "الشتاء"];
const healthStatuses = ["ممتاز", "جيد", "يحتاج عناية", "مريض"];

const calculateNextWatering = (lastDate, frequency) => {
  const date = lastDate ? new Date(lastDate) : new Date();
  switch (frequency) {
    case "يومي": return addDays(date, 1);
    case "كل يومين": return addDays(date, 2);
    case "كل 3 أيام": return addDays(date, 3);
    case "أسبوعي": return addWeeks(date, 1);
    case "كل أسبوعين": return addWeeks(date, 2);
    case "شهري": return addMonths(date, 1);
    default: return addWeeks(date, 1);
  }
};

export default function PlantForm({ plant, onSave, onCancel }) {
  const [formData, setFormData] = useState(plant || {
    name: '',
    species: '',
    location: '',
    image_url: '',
    watering_frequency: 'أسبوعي',
    last_watered: new Date().toISOString().split('T')[0],
    next_watering: '',
    sunlight_needs: 'ضوء غير مباشر',
    fertilizing_frequency: 'شهري',
    last_fertilized: '',
    next_fertilizing: '',
    season: 'طوال السنة',
    care_notes: '',
    health_status: 'جيد',
    reminder_enabled: true,
    acquired_date: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'last_watered' || field === 'watering_frequency') {
        const nextDate = calculateNextWatering(updated.last_watered, updated.watering_frequency);
        updated.next_watering = nextDate.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    
    try {
      // 1. إنشاء اسم فريد للملف
      const fileName = `${Date.now()}_${file.name}`;
      
      // 2. رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('plants')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // 3. الحصول على رابط الصورة
      const { data: { publicUrl } } = supabase.storage
        .from('plants')
        .getPublicUrl(fileName);
      
      handleChange('image_url', publicUrl);
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      alert('فشل رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    // تنظيف البيانات قبل الحفظ
    const dataToSave = {
      name: formData.name,
      species: formData.species || null,
      location: formData.location || null,
      image_url: formData.image_url || null,
      watering_frequency: formData.watering_frequency || null,
      last_watered: formData.last_watered || null,
      next_watering: formData.next_watering || null,
      sunlight_needs: formData.sunlight_needs || null,
      fertilizing_frequency: formData.fertilizing_frequency || null,
      last_fertilized: formData.last_fertilized || null,
      next_fertilizing: formData.next_fertilizing || null,
      season: formData.season || null,
      care_notes: formData.care_notes || null,
      health_status: formData.health_status || 'جيد',
      reminder_enabled: formData.reminder_enabled ?? true,
      acquired_date: formData.acquired_date || null
    };
    
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{plant ? 'تعديل النبات' : 'إضافة نبات جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم النبات *</Label>
              <Input 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)}
                placeholder="مثال: نبات الزينة"
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Input 
                value={formData.species} 
                onChange={e => handleChange('species', e.target.value)}
                placeholder="مثال: بوتس ذهبي"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input 
                value={formData.location} 
                onChange={e => handleChange('location', e.target.value)}
                placeholder="مثال: غرفة المعيشة"
              />
            </div>
            <div className="space-y-2">
              <Label>صورة</Label>
              <div className="flex gap-2">
                <Input value={formData.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="رابط" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تكرار الري</Label>
              <Select value={formData.watering_frequency} onValueChange={v => handleChange('watering_frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {wateringFrequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>آخر ري</Label>
              <Input type="date" value={formData.last_watered} onChange={e => handleChange('last_watered', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>احتياجات الإضاءة</Label>
              <Select value={formData.sunlight_needs} onValueChange={v => handleChange('sunlight_needs', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sunlightNeeds.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة الصحية</Label>
              <Select value={formData.health_status} onValueChange={v => handleChange('health_status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {healthStatuses.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تكرار التسميد</Label>
              <Select value={formData.fertilizing_frequency} onValueChange={v => handleChange('fertilizing_frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fertilizingFrequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>موسم النمو</Label>
              <Select value={formData.season} onValueChange={v => handleChange('season', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات العناية</Label>
            <Textarea value={formData.care_notes} onChange={e => handleChange('care_notes', e.target.value)} rows={2} placeholder="نصائح خاصة للعناية بهذا النبات..." />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <Label>تفعيل التذكيرات</Label>
              <p className="text-xs text-slate-500">تذكيرات للري والتسميد</p>
            </div>
            <Switch checked={formData.reminder_enabled} onCheckedChange={v => handleChange('reminder_enabled', v)} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!formData.name} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}