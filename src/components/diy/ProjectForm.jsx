import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Trash2, Save, ImagePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const statuses = ["مخطط", "قيد التنفيذ", "متوقف", "مكتمل"];
const priorities = ["منخفضة", "متوسطة", "عالية"];

export default function ProjectForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState(project || {
    title: '',
    description: '',
    status: 'مخطط',
    priority: 'متوسطة',
    start_date: '',
    target_date: '',
    budget: '',
    actual_cost: '',
    materials: [],
    steps: [],
    tutorial_url: '',
    image_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...(formData.materials || [])];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData(prev => ({ ...prev, materials: newMaterials }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...(prev.materials || []), { name: '', quantity: 1, unit: '', estimated_cost: 0, purchased: false }]
    }));
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...(formData.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { title: '', description: '', completed: false }]
    }));
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
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
      budget: formData.budget ? Number(formData.budget) : null,
      actual_cost: formData.actual_cost ? Number(formData.actual_cost) : null,
      materials: formData.materials?.map(m => ({
        ...m,
        quantity: m.quantity ? Number(m.quantity) : 1,
        estimated_cost: m.estimated_cost ? Number(m.estimated_cost) : 0
      }))
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>عنوان المشروع *</Label>
              <Input 
                value={formData.title} 
                onChange={e => handleChange('title', e.target.value)}
                placeholder="مثال: تجديد المطبخ"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>وصف المشروع</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => handleChange('description', e.target.value)}
                placeholder="وصف تفصيلي للمشروع..."
                rows={3}
              />
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
              <Label>الأولوية</Label>
              <Select value={formData.priority} onValueChange={v => handleChange('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ البدء</Label>
              <Input type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>التاريخ المستهدف</Label>
              <Input type="date" value={formData.target_date} onChange={e => handleChange('target_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الميزانية المتوقعة</Label>
              <Input type="number" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} placeholder="بالجنيه" />
            </div>
            <div className="space-y-2">
              <Label>التكلفة الفعلية</Label>
              <Input type="number" value={formData.actual_cost} onChange={e => handleChange('actual_cost', e.target.value)} placeholder="بالجنيه" />
            </div>
            <div className="space-y-2">
              <Label>رابط الفيديو التعليمي</Label>
              <Input value={formData.tutorial_url} onChange={e => handleChange('tutorial_url', e.target.value)} placeholder="رابط يوتيوب أو غيره" />
            </div>
            <div className="space-y-2">
              <Label>صورة المشروع</Label>
              <div className="flex gap-2">
                <Input value={formData.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="رابط الصورة" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">قائمة المواد</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مادة
              </Button>
            </div>
            {formData.materials?.map((material, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox checked={material.purchased} onCheckedChange={v => handleMaterialChange(index, 'purchased', v)} />
                <Input placeholder="اسم المادة" value={material.name} onChange={e => handleMaterialChange(index, 'name', e.target.value)} className="flex-1" />
                <Input type="number" placeholder="الكمية" value={material.quantity} onChange={e => handleMaterialChange(index, 'quantity', e.target.value)} className="w-20" />
                <Input placeholder="الوحدة" value={material.unit} onChange={e => handleMaterialChange(index, 'unit', e.target.value)} className="w-24" />
                <Input type="number" placeholder="التكلفة" value={material.estimated_cost} onChange={e => handleMaterialChange(index, 'estimated_cost', e.target.value)} className="w-24" />
                <Button variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">خطوات التنفيذ</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة خطوة
              </Button>
            </div>
            {formData.steps?.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox checked={step.completed} onCheckedChange={v => handleStepChange(index, 'completed', v)} className="mt-3" />
                <div className="flex-1 space-y-2">
                  <Input placeholder="عنوان الخطوة" value={step.title} onChange={e => handleStepChange(index, 'title', e.target.value)} />
                  <Textarea placeholder="تفاصيل الخطوة" value={step.description} onChange={e => handleStepChange(index, 'description', e.target.value)} rows={2} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeStep(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!formData.title} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}