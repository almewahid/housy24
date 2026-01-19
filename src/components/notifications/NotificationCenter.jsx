import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, Check, Trash2, ClipboardList, Package, Wrench, 
  Hammer, Leaf, Calendar, AlertTriangle, CheckCircle2, X
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const typeIcons = {
  "مهمة": ClipboardList,
  "ضمان": Package,
  "صيانة": Wrench,
  "مشروع": Hammer,
  "نبات": Leaf,
  "جدول": Calendar,
  "عام": Bell
};

const priorityColors = {
  "منخفضة": "bg-gray-100 text-gray-700",
  "متوسطة": "bg-blue-100 text-blue-700",
  "عالية": "bg-orange-100 text-orange-700",
  "عاجلة": "bg-red-100 text-red-700"
};

export default function NotificationCenter({ onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data: notifications = [] } = useQuery({
    queryKey: ['allNotifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 100)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notification.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] })
  });

  const markAsRead = (id) => {
    updateMutation.mutate({ id, data: { is_read: true } });
  };

  const markAllAsRead = () => {
    notifications.filter(n => !n.is_read).forEach(n => {
      updateMutation.mutate({ id: n.id, data: { is_read: true } });
    });
  };

  const deleteAll = () => {
    notifications.forEach(n => deleteMutation.mutate(n.id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[85vh] bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                مركز الإشعارات
              </CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500">{unreadCount} جديد</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCircle2 className="w-4 h-4 ml-1" />
                قراءة الكل
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 pt-2">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="unread">غير مقروء</TabsTrigger>
                <TabsTrigger value="مهمة">مهام</TabsTrigger>
                <TabsTrigger value="صيانة">صيانة</TabsTrigger>
                <TabsTrigger value="ضمان">ضمان</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="h-[60vh]">
              <div className="p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">لا توجد إشعارات</p>
                  </div>
                ) : (
                  filteredNotifications.map(notification => {
                    const Icon = typeIcons[notification.type] || Bell;
                    return (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          notification.is_read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${notification.is_read ? 'bg-slate-100' : 'bg-blue-100'}`}>
                            <Icon className={`w-5 h-5 ${notification.is_read ? 'text-slate-500' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                              <Badge className={priorityColors[notification.priority] || priorityColors["متوسطة"]} variant="secondary">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {format(new Date(notification.created_date), 'd MMM - h:mm a', { locale: ar })}
                              </span>
                              <div className="flex gap-1">
                                {!notification.is_read && (
                                  <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(notification.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}