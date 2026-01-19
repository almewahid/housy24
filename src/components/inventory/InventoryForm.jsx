import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, Save, ImagePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const categories = ["أثاث", "إلكترونيات", "أجهزة منزلية", "ديكور", "مطبخ", "حمام", "غرفة نوم", "حديقة", "أخرى"];
const priceLevels = ["اقتصادي", "متوسط", "مرتفع"];

export default function InventoryForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState(item || {
    name: '',
    category: 'أخرى',
    room: '',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    warranty_expiry: '',
    image_url: '',
    notes: '',
    suppliers: []
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (index, field, value) => {
    const newSuppliers = [...(formData.suppliers || [])];
    newSuppliers[index] = { ...newSuppliers[index], [field]: value };
    setFormData(prev => ({ ...prev, suppliers: newSuppliers }));
  };

  const addSupplier = () => {
    setFormData(prev => ({
      ...prev,
      suppliers: [...(prev.suppliers || []), { name: '', phone: '', website: '', address: '', rating: 0, price_level: 'متوسط' }]
    }));
  };

  const removeSupplier = (index) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange('image_url', file_url);
    setIsUploading(false);
  };

  const handleSubmit = () => {
    const dataToSave = {
      ...formData,
      purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
      current_value: formData.current_value ? Number(formData.current_value) : null,
      suppliers: formData.suppliers?.map(s => ({
        ...s,
        rating: s.rating ? Number(s.rating) : null
      }))
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{item ? 'تعديل الغرض' : 'إضافة غرض جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الغرض *</Label>
              <Input 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)}
                placeholder="مثال: تلفزيون سامسونج"
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الغرفة</Label>
              <Input 
                value={formData.room} 
                onChange={e => handleChange('room', e.target.value)}
                placeholder="مثال: غرفة المعيشة"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الشراء</Label>
              <Input 
                type="date"
                value={formData.purchase_date} 
                onChange={e => handleChange('purchase_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>سعر الشراء</Label>
              <Input 
                type="number"
                value={formData.purchase_price} 
                onChange={e => handleChange('purchase_price', e.target.value)}
                placeholder="بالجنيه المصري"
              />
            </div>
            <div className="space-y-2">
              <Label>القيمة الحالية (للتأمين)</Label>
              <Input 
                type="number"
                value={formData.current_value} 
                onChange={e => handleChange('current_value', e.target.value)}
                placeholder="بالجنيه المصري"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ انتهاء الضمان</Label>
              <Input 
                type="date"
                value={formData.warranty_expiry} 
                onChange={e => handleChange('warranty_expiry', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>صورة</Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.image_url} 
                  onChange={e => handleChange('image_url', e.target.value)}
                  placeholder="رابط الصورة"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea 
              value={formData.notes} 
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="أي معلومات إضافية..."
              rows={3}
            />
          </div>

          {/* Suppliers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">أماكن الشراء الموصى بها</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSupplier}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة متجر
              </Button>
            </div>
            
            {formData.suppliers?.map((supplier, index) => (
              <Card key={index} className="border border-slate-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-600">متجر {index + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeSupplier(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input 
                      placeholder="اسم المتجر"
                      value={supplier.name}
                      onChange={e => handleSupplierChange(index, 'name', e.target.value)}
                    />
                    <Input 
                      placeholder="رقم التليفون"
                      value={supplier.phone}
                      onChange={e => handleSupplierChange(index, 'phone', e.target.value)}
                    />
                    <Input 
                      placeholder="الموقع الإلكتروني"
                      value={supplier.website}
                      onChange={e => handleSupplierChange(index, 'website', e.target.value)}
                    />
                    <Input 
                      placeholder="العنوان"
                      value={supplier.address}
                      onChange={e => handleSupplierChange(index, 'address', e.target.value)}
                    />
                    <Input 
                      type="number"
                      min="0"
                      max="5"
                      placeholder="التقييم (من 5)"
                      value={supplier.rating}
                      onChange={e => handleSupplierChange(index, 'rating', e.target.value)}
                    />
                    <Select 
                      value={supplier.price_level} 
                      onValueChange={v => handleSupplierChange(index, 'price_level', v)}
                    >
                      <SelectTrigger><SelectValue placeholder="مستوى السعر" /></SelectTrigger>
                      <SelectContent>
                        {priceLevels.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
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