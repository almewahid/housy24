import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Store } from "lucide-react";
import SupplierSelector from './SupplierSelector';

const categories = ["ألبان", "لحوم", "خضروات", "فواكه", "حبوب", "معلبات", "مشروبات", "بهارات", "مجمدات", "أخرى"];
const units = ["كيلو", "جرام", "لتر", "مل", "عدد", "علبة", "كيس", "زجاجة"];
const storageLocations = ["ثلاجة", "فريزر", "خزانة", "رف"];

export default function FoodItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState(item || {
    name: '',
    category: 'أخرى',
    quantity: 1,
    unit: 'عدد',
    min_quantity: 1,
    expiry_date: '',
    storage_location: 'ثلاجة',
    notes: '',
    preferred_supplier_id: '',
    last_purchase_price: null,
    barcode: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle>{item ? 'تعديل المنتج' : 'إضافة منتج جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>اسم المنتج *</Label>
              <Input 
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="مثال: بيض، حليب، خبز"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>التصنيف</Label>
                <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>مكان التخزين</Label>
                <Select value={formData.storage_location} onValueChange={v => handleChange('storage_location', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {storageLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الكمية *</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={e => handleChange('quantity', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Select value={formData.unit} onValueChange={v => handleChange('unit', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحد الأدنى</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.min_quantity || ''}
                  onChange={e => handleChange('min_quantity', parseFloat(e.target.value) || 0)}
                  placeholder="للتنبيه"
                />
              </div>
            </div>

            <div>
              <Label>تاريخ الانتهاء</Label>
              <Input 
                type="date"
                value={formData.expiry_date || ''}
                onChange={e => handleChange('expiry_date', e.target.value)}
              />
            </div>

            <div>
              <Label>المورد المفضل</Label>
              <SupplierSelector
                selectedId={formData.preferred_supplier_id}
                onSelect={(id) => handleChange('preferred_supplier_id', id)}
                category={formData.category}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>آخر سعر شراء</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.last_purchase_price || ''}
                  onChange={e => handleChange('last_purchase_price', parseFloat(e.target.value) || null)}
                  placeholder="ج.م"
                />
              </div>
              <div>
                <Label>الباركود</Label>
                <Input 
                  value={formData.barcode || ''}
                  onChange={e => handleChange('barcode', e.target.value)}
                  placeholder="اختياري"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea 
                value={formData.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
              <Button type="submit" disabled={!formData.name}>حفظ</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}