import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function CalendarSync({ events, familyMember, medications, tasks }) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const generateICSContent = () => {
    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Home Manager//AR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    // Add medication events
    medications?.forEach(med => {
      if (med.family_member === familyMember?.name && med.is_active) {
        med.times_per_day?.forEach(time => {
          const [hours, minutes] = time.split(':');
          const startDate = new Date();
          startDate.setHours(parseInt(hours), parseInt(minutes), 0);
          
          ics += `BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(new Date(startDate.getTime() + 15 * 60000))}
RRULE:FREQ=DAILY
SUMMARY:💊 ${med.name} - ${med.dosage || ''}
DESCRIPTION:${med.timing || ''} ${med.notes || ''}
CATEGORIES:MEDICATION
END:VEVENT
`;
        });
      }
    });

    // Add task events
    tasks?.forEach(task => {
      if (task.assigned_to === familyMember?.name && task.due_date) {
        ics += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${task.due_date.replace(/-/g, '')}
SUMMARY:📋 ${task.title}
DESCRIPTION:${task.description || ''}
CATEGORIES:TASK
END:VEVENT
`;
      }
    });

    // Add custom events
    events?.forEach(event => {
      if (event.family_member === familyMember?.name) {
        const startDateTime = event.start_time 
          ? `${event.start_date.replace(/-/g, '')}T${event.start_time.replace(/:/g, '')}00`
          : `${event.start_date.replace(/-/g, '')}`;
        
        ics += `BEGIN:VEVENT
DTSTART:${startDateTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
CATEGORIES:${event.event_type}
END:VEVENT
`;
      }
    });

    ics += 'END:VCALENDAR';
    return ics;
  };

  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const downloadCalendar = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${familyMember?.name || 'family'}_calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSyncStatus('downloaded');
  };

  const openGoogleCalendar = () => {
    // Generate Google Calendar URL for adding events
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    window.open(baseUrl, '_blank');
    setSyncStatus('google');
  };

  const openOutlookCalendar = () => {
    // Generate Outlook Calendar URL
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    window.open(baseUrl, '_blank');
    setSyncStatus('outlook');
  };

  const syncToCalendarEvents = async () => {
    setSyncing(true);
    try {
      // Create calendar events from medications
      for (const med of medications?.filter(m => m.family_member === familyMember?.name && m.is_active) || []) {
        for (const time of med.times_per_day || []) {
          await base44.entities.CalendarEvent.create({
            title: `💊 ${med.name}`,
            description: `${med.dosage || ''} - ${med.timing || ''}`,
            event_type: 'دواء',
            family_member: med.family_member,
            start_date: new Date().toISOString().split('T')[0],
            start_time: time,
            is_recurring: true,
            recurrence_pattern: 'يومي',
            related_entity_type: 'Medication',
            related_entity_id: med.id
          });
        }
      }

      // Create events from tasks
      for (const task of tasks?.filter(t => t.assigned_to === familyMember?.name && t.due_date) || []) {
        await base44.entities.CalendarEvent.create({
          title: `📋 ${task.title}`,
          description: task.description,
          event_type: 'مهمة',
          family_member: task.assigned_to,
          start_date: task.due_date,
          related_entity_type: 'HouseholdTask',
          related_entity_id: task.id
        });
      }

      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncStatus('error');
    }
    setSyncing(false);
  };

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          مزامنة التقويم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          قم بمزامنة المواعيد والأدوية والمهام مع تقويمك الشخصي
        </p>

        {/* Download ICS */}
        <Button onClick={downloadCalendar} variant="outline" className="w-full justify-start gap-3">
          <Download className="w-5 h-5" />
          تحميل ملف التقويم (.ics)
          <Badge variant="secondary" className="mr-auto">يعمل مع جميع التطبيقات</Badge>
        </Button>

        {/* Google Calendar */}
        <Button onClick={openGoogleCalendar} variant="outline" className="w-full justify-start gap-3">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded" />
          Google Calendar
        </Button>

        {/* Outlook */}
        <Button onClick={openOutlookCalendar} variant="outline" className="w-full justify-start gap-3">
          <div className="w-5 h-5 bg-blue-600 rounded" />
          Outlook Calendar
        </Button>

        {/* Sync to internal events */}
        <Button 
          onClick={syncToCalendarEvents} 
          disabled={syncing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {syncing ? (
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
          ) : (
            <Upload className="w-5 h-5 ml-2" />
          )}
          مزامنة الأحداث
        </Button>

        {syncStatus && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            syncStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {syncStatus === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="text-sm">
              {syncStatus === 'downloaded' && 'تم تحميل ملف التقويم بنجاح'}
              {syncStatus === 'synced' && 'تمت المزامنة بنجاح'}
              {syncStatus === 'google' && 'تم فتح Google Calendar'}
              {syncStatus === 'outlook' && 'تم فتح Outlook Calendar'}
              {syncStatus === 'error' && 'حدث خطأ في المزامنة'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}