import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Clock, Save, Loader2 } from "lucide-react";

export default function NotificationSettingsForm({ settings, onSave }) {
  const [formData, setFormData] = useState(settings || {
    task_reminders: true,
    task_reminder_hours: 24,
    warranty_reminders: true,
    warranty_reminder_days: 30,
    maintenance_reminders: true,
    maintenance_reminder_days: 3,
    project_reminders: true,
    project_reminder_days: 7,
    plant_reminders: true,
    schedule_reminders: true,
    email_notifications: true,
    daily_summary: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const settingGroups = [
    {
      title: "تذكيرات المهام",
      icon: "📋",
      settings: [
        { key: 'task_reminders', label: 'تفعيل تذكيرات المهام', type: 'switch' },
        { key: 'task_reminder_hours', label: 'التذكير قبل (ساعات)', type: 'number', showIf: 'task_reminders' }
      ]
    },
    {
      title: "تذكيرات الضمان",
      icon: "🛡️",
      settings: [
        { key: 'warranty_reminders', label: 'تفعيل تذكيرات الضمان', type: 'switch' },
        { key: 'warranty_reminder_days', label: 'التذكير قبل (أيام)', type: 'number', showIf: 'warranty_reminders' }
      ]
    },
    {
      title: "تذكيرات الصيانة",
      icon: "🔧",
      settings: [
        { key: 'maintenance_reminders', label: 'تفعيل تذكيرات الصيانة', type: 'switch' },
        { key: 'maintenance_reminder_days', label: 'التذكير قبل (أيام)', type: 'number', showIf: 'maintenance_reminders' }
      ]
    },
    {
      title: "تذكيرات المشاريع",
      icon: "🔨",
      settings: [
        { key: 'project_reminders', label: 'تفعيل تذكيرات المشاريع', type: 'switch' },
        { key: 'project_reminder_days', label: 'التذكير قبل (أيام)', type: 'number', showIf: 'project_reminders' }
      ]
    },
    {
      title: "تذكيرات النباتات",
      icon: "🌱",
      settings: [
        { key: 'plant_reminders', label: 'تفعيل تذكيرات الري والعناية', type: 'switch' }
      ]
    },
    {
      title: "تذكيرات الجدول",
      icon: "📅",
      settings: [
        { key: 'schedule_reminders', label: 'تفعيل تذكيرات الأنشطة', type: 'switch' }
      ]
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          إعدادات الإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {settingGroups.map((group, idx) => (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{group.icon}</span>
              <h3 className="font-semibold text-slate-700">{group.title}</h3>
            </div>
            <div className="space-y-4 pr-8">
              {group.settings.map(setting => {
                if (setting.showIf && !formData[setting.showIf]) return null;
                
                if (setting.type === 'switch') {
                  return (
                    <div key={setting.key} className="flex items-center justify-between">
                      <Label>{setting.label}</Label>
                      <Switch 
                        checked={formData[setting.key]} 
                        onCheckedChange={v => handleChange(setting.key, v)} 
                      />
                    </div>
                  );
                }
                
                if (setting.type === 'number') {
                  return (
                    <div key={setting.key} className="flex items-center justify-between">
                      <Label>{setting.label}</Label>
                      <Input 
                        type="number" 
                        value={formData[setting.key]} 
                        onChange={e => handleChange(setting.key, Number(e.target.value))}
                        className="w-24"
                        min={1}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {idx < settingGroups.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5" />
            <h3 className="font-semibold text-slate-700">إعدادات البريد الإلكتروني</h3>
          </div>
          <div className="space-y-4 pr-8">
            <div className="flex items-center justify-between">
              <Label>إرسال الإشعارات بالبريد</Label>
              <Switch 
                checked={formData.email_notifications} 
                onCheckedChange={v => handleChange('email_notifications', v)} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>ملخص يومي</Label>
              <Switch 
                checked={formData.daily_summary} 
                onCheckedChange={v => handleChange('daily_summary', v)} 
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ الإعدادات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}