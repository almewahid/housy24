import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SectionVisibilitySettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const sections = [
    { key: 'show_tasks', label: 'المهام', description: 'إدارة المهام المنزلية والعائلية' },
    { key: 'show_expenses', label: 'المصروفات', description: 'تتبع النفقات والميزانيات' },
    { key: 'show_inventory', label: 'المخزون', description: 'مخزون الأغراض المنزلية' },
    { key: 'show_maintenance', label: 'الصيانة', description: 'جدولة صيانة الأجهزة' },
    { key: 'show_plants', label: 'النباتات', description: 'العناية بالنباتات المنزلية' },
    { key: 'show_pets', label: 'الحيوانات الأليفة', description: 'إدارة رعاية الحيوانات' },
    { key: 'show_medications', label: 'الأدوية', description: 'جدول الأدوية والجرعات' },
    { key: 'show_schedule', label: 'الجدول الدراسي', description: 'جدول أنشطة الأطفال' },
    { key: 'show_food_inventory', label: 'مخزون الطعام', description: 'إدارة المواد الغذائية' },
    { key: 'show_shopping', label: 'قائمة التسوق', description: 'قائمة المشتريات' },
    { key: 'show_diy', label: 'مشاريع DIY', description: 'التحسينات المنزلية' },
    { key: 'show_family', label: 'العائلة', description: 'أفراد العائلة والصلاحيات' },
    { key: 'show_visits', label: 'الزيارات', description: 'سجل الزيارات والمشاوير' },
    { key: 'show_gamification', label: 'نظام التحفيز', description: 'النقاط والمكافآت' },
  ];

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    await onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = sections.filter(s => formData[s.key]).length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            إظهار/إخفاء الأقسام
          </CardTitle>
          <div className="text-sm text-gray-600">
            {enabledCount} من {sections.length} قسم مفعّل
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          اختر الأقسام التي تريد عرضها في التطبيق
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData[section.key]
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Label
                    htmlFor={section.key}
                    className="text-base font-semibold cursor-pointer flex items-center gap-2"
                  >
                    {formData[section.key] ? (
                      <Eye className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    {section.label}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1 mr-6">
                    {section.description}
                  </p>
                </div>
                <Switch
                  id={section.key}
                  checked={formData[section.key]}
                  onCheckedChange={() => handleToggle(section.key)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                تم الحفظ
              </>
            ) : (
              'حفظ الإعدادات'
            )}
          </Button>
          {!saved && (
            <p className="text-sm text-gray-500">
              تذكر حفظ التغييرات قبل الخروج
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}