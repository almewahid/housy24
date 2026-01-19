import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Trash2, Clock, AlertTriangle, Leaf, Wrench, ClipboardList, Maximize2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import NotificationCenter from './NotificationCenter';

const typeIcons = {
  "مهمة": ClipboardList,
  "ضمان": AlertTriangle,
  "صيانة": Wrench,
  "مشروع": Clock,
  "نبات": Leaf,
  "جدول": Clock,
  "عام": Bell
};

const priorityColors = {
  "منخفضة": "bg-slate-100 text-slate-700",
  "متوسطة": "bg-blue-100 text-blue-700",
  "عالية": "bg-amber-100 text-amber-700",
  "عاجلة": "bg-red-100 text-red-700"
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCenter, setShowCenter] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 50)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notification.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAsRead = (notification) => {
    updateMutation.mutate({ id: notification.id, data: { ...notification, is_read: true } });
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      updateMutation.mutate({ id: n.id, data: { ...n, is_read: true } });
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {showCenter && <NotificationCenter onClose={() => setShowCenter(false)} />}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg">الإشعارات</CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                مقروء
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsOpen(false); setShowCenter(true); }}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${priorityColors[notification.priority]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">{notification.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-red-500"
                          onClick={() => deleteMutation.mutate(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
}