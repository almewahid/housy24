import React, { useState, useEffect } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Bell, Users, Trash2, Eye } from "lucide-react";
import NotificationSettingsForm from '@/components/notifications/NotificationSettingsForm';
import SectionVisibilitySettings from '@/components/settings/SectionVisibilitySettings';

export default function Settings() {
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email || '')).catch(() => {});
  }, []);

  const { data: notificationSettings } = useQuery({
    queryKey: ['notificationSettings', userEmail],
    queryFn: () => base44.entities.NotificationSettings.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: sectionVisibility } = useQuery({
    queryKey: ['sectionVisibility', userEmail],
    queryFn: () => base44.entities.SectionVisibility.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const createSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.NotificationSettings.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NotificationSettings.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })
  });

  const createVisibilityMutation = useMutation({
    mutationFn: (data) => base44.entities.SectionVisibility.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sectionVisibility'] })
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SectionVisibility.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sectionVisibility'] })
  });

  const handleSaveNotifications = async (data) => {
    if (notificationSettings && notificationSettings.length > 0) {
      await updateSettingsMutation.mutateAsync({ 
        id: notificationSettings[0].id, 
        data: { ...data, user_email: userEmail } 
      });
    } else {
      await createSettingsMutation.mutateAsync({ ...data, user_email: userEmail });
    }
  };

  const handleSaveVisibility = async (data) => {
    if (sectionVisibility && sectionVisibility.length > 0) {
      await updateVisibilityMutation.mutateAsync({ 
        id: sectionVisibility[0].id, 
        data: { ...data, user_email: userEmail } 
      });
    } else {
      await createVisibilityMutation.mutateAsync({ ...data, user_email: userEmail });
    }
  };

  const currentSettings = notificationSettings?.[0] || {
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
  };

  const currentVisibility = sectionVisibility?.[0] || {
    show_tasks: true,
    show_expenses: true,
    show_inventory: true,
    show_maintenance: true,
    show_plants: true,
    show_pets: true,
    show_medications: true,
    show_schedule: true,
    show_food_inventory: true,
    show_shopping: true,
    show_diy: true,
    show_family: true,
    show_visits: true,
    show_gamification: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الإعدادات</h1>
          <p className="text-slate-500">إدارة تفضيلات التطبيق والإشعارات</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-white/80 shadow-sm">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="visibility" className="gap-2">
              <Eye className="w-4 h-4" />
              الأقسام المرئية
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              عام
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <NotificationSettingsForm 
              settings={currentSettings}
              onSave={handleSaveNotifications}
            />
          </TabsContent>

          <TabsContent value="visibility">
            <SectionVisibilitySettings 
              settings={currentVisibility}
              onSave={handleSaveVisibility}
            />
          </TabsContent>

          <TabsContent value="general">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  إعدادات عامة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">البريد الإلكتروني</p>
                    <p className="text-slate-500">{userEmail || 'غير متصل'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">الإصدار</p>
                    <p className="text-slate-500">1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}