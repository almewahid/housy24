import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

const roles = ["أب", "أم", "ابن", "ابنة", "جد", "جدة", "أخ", "أخت", "زميل سكن", "أخرى"];
const colors = [
  { name: "أحمر", value: "#ef4444" },
  { name: "برتقالي", value: "#f97316" },
  { name: "أصفر", value: "#eab308" },
  { name: "أخضر", value: "#22c55e" },
  { name: "أزرق", value: "#3b82f6" },
  { name: "بنفسجي", value: "#8b5cf6" },
  { name: "وردي", value: "#ec4899" },
  { name: "رمادي", value: "#6b7280" }
];

export default function FamilyMemberForm({ member, onSave, onCancel }) {
  const [formData, setFormData] = useState(member || {
    name: '',
    role: 'أخرى',
    avatar_color: '#3b82f6',
    total_points: 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <Card className="w-full max-w-md bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{member ? 'تعديل الفرد' : 'إضافة فرد جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>الاسم *</Label>
            <Input 
              value={formData.name} 
              onChange={e => handleChange('name', e.target.value)}
              placeholder="مثال: أحمد"
            />
          </div>
          <div className="space-y-2">
            <Label>الدور</Label>
            <Select value={formData.role} onValueChange={v => handleChange('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>لون الأيقونة</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-10 h-10 rounded-full transition-all ${formData.avatar_color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => handleChange('avatar_color', c.value)}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={() => onSave(formData)} disabled={!formData.name} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}