import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ClipboardList, Pill, Package, Users, Trophy, Star } from "lucide-react";

const permissionLevels = [
  { value: "مدير", label: "مدير", description: "صلاحيات كاملة", color: "bg-purple-100 text-purple-700" },
  { value: "عضو", label: "عضو", description: "صلاحيات عادية", color: "bg-blue-100 text-blue-700" },
  { value: "محدود", label: "محدود", description: "صلاحيات محدودة", color: "bg-slate-100 text-slate-700" }
];

const calculateLevel = (points) => {
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 200) return 3;
  if (points >= 50) return 2;
  return 1;
};

const levelBenefits = {
  1: ["عرض المهام", "إكمال المهام الخاصة"],
  2: ["إضافة مهام جديدة", "التعليق على العناصر"],
  3: ["تعديل المخزون", "إضافة منتجات"],
  4: ["إدارة الجدول", "تعديل الصيانة"],
  5: ["إدارة كاملة", "إضافة أفراد"]
};

export default function PermissionsManager({ member, onUpdate }) {
  const level = calculateLevel(member.total_points || 0);
  const currentLevelBenefits = [];
  for (let i = 1; i <= level; i++) {
    currentLevelBenefits.push(...levelBenefits[i]);
  }

  const handlePermissionChange = (field, value) => {
    onUpdate({ ...member, [field]: value });
  };

  const isParent = member.role === 'أب' || member.role === 'أم';

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          الصلاحيات والمستويات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Display */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span className="font-bold text-lg">المستوى {level}</span>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < level ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-amber-700">
            النقاط: {member.total_points || 0} نقطة
          </div>
          <div className="mt-3">
            <p className="text-xs text-amber-600 mb-2">المزايا المتاحة:</p>
            <div className="flex flex-wrap gap-1">
              {currentLevelBenefits.map((benefit, i) => (
                <Badge key={i} className="bg-amber-100 text-amber-700 text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Level */}
        <div>
          <Label className="mb-2 block">مستوى الصلاحيات</Label>
          <Select 
            value={member.permission_level || 'عضو'} 
            onValueChange={v => handlePermissionChange('permission_level', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {permissionLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex items-center gap-2">
                    <Badge className={level.color}>{level.label}</Badge>
                    <span className="text-sm text-slate-500">{level.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Individual Permissions */}
        <div className="space-y-3">
          <Label>الصلاحيات التفصيلية</Label>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-rose-500" />
              <span>إدارة المهام</span>
            </div>
            <Switch 
              checked={member.can_manage_tasks !== false}
              onCheckedChange={v => handlePermissionChange('can_manage_tasks', v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-pink-500" />
              <span>إدارة الأدوية</span>
            </div>
            <Switch 
              checked={member.can_manage_medications || isParent}
              onCheckedChange={v => handlePermissionChange('can_manage_medications', v)}
              disabled={!isParent && level < 4}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <span>إدارة المخزون</span>
            </div>
            <Switch 
              checked={member.can_manage_inventory !== false || level >= 3}
              onCheckedChange={v => handlePermissionChange('can_manage_inventory', v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              <span>إدارة أفراد العائلة</span>
            </div>
            <Switch 
              checked={member.can_manage_members || isParent}
              onCheckedChange={v => handlePermissionChange('can_manage_members', v)}
              disabled={!isParent && level < 5}
            />
          </div>
        </div>

        {/* Next Level */}
        {level < 5 && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              للوصول للمستوى {level + 1}: تحتاج {
                level === 1 ? 50 : level === 2 ? 200 : level === 3 ? 500 : 1000
              } نقطة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}