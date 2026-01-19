import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Trophy, ClipboardList, Calendar, X, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import CommentSection from '@/components/comments/CommentSection';
import CalendarSync from '@/components/calendar/CalendarSync';
import PermissionsManager from '@/components/family/PermissionsManager';

export default function FamilyMemberDetails({ member, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('info');
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['memberTasks', member.name],
    queryFn: () => base44.entities.HouseholdTask.filter({ assigned_to: member.name })
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['memberSchedules', member.name],
    queryFn: () => base44.entities.Schedule.filter({ child_name: member.name })
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['memberMedications', member.name],
    queryFn: () => base44.entities.Medication.filter({ family_member: member.name, is_active: true })
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendarEvents', member.id],
    queryFn: () => base44.entities.CalendarEvent.filter({ family_member: member.name })
  });

  const handleUpdateMember = async (updatedMember) => {
    await base44.entities.FamilyMember.update(member.id, updatedMember);
    queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
    if (onUpdate) onUpdate(updatedMember);
  };

  const completedTasks = tasks.filter(t => t.status === 'مكتملة').length;
  const pendingTasks = tasks.filter(t => t.status !== 'مكتملة').length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback 
                  className="text-white text-2xl font-bold"
                  style={{ backgroundColor: member.avatar_color || '#94a3b8' }}
                >
                  {member.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">{member.role}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent px-6 overflow-x-auto">
            <TabsTrigger value="info">المعلومات</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
            <TabsTrigger value="schedule">الجدول</TabsTrigger>
            <TabsTrigger value="calendar">التقويم</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
            <TabsTrigger value="messages">الرسائل</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] p-6">
            <TabsContent value="info" className="space-y-4 mt-0">
              {/* Contact Info */}
              <div className="grid gap-3">
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span dir="ltr">{member.phone}</span>
                  </a>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
                    <Mail className="w-5 h-5 text-green-500" />
                    <span>{member.email}</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">{member.total_points || 0}</p>
                  <p className="text-sm text-amber-700">نقطة</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <ClipboardList className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
                  <p className="text-sm text-emerald-700">مهمة مكتملة</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{schedules.length}</p>
                  <p className="text-sm text-blue-700">نشاط</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-3 mt-0">
              {tasks.length === 0 ? (
                <p className="text-center text-slate-400 py-8">لا توجد مهام</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className={`font-medium ${task.status === 'مكتملة' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{task.category}</Badge>
                        {task.due_date && (
                          <span className="text-xs text-slate-400">
                            {format(new Date(task.due_date), 'd MMM', { locale: ar })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={task.status === 'مكتملة' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      {task.status}
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-3 mt-0">
              {schedules.length === 0 ? (
                <p className="text-center text-slate-400 py-8">لا توجد أنشطة</p>
              ) : (
                schedules.map(schedule => (
                  <div key={schedule.id} className="p-3 bg-slate-50 rounded-xl">
                    <p className="font-medium">{schedule.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <span>{schedule.day_of_week}</span>
                      {schedule.start_time && <span>{schedule.start_time}</span>}
                      <Badge variant="secondary">{schedule.category}</Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <CalendarSync 
                events={calendarEvents}
                familyMember={member}
                medications={medications}
                tasks={tasks}
              />
            </TabsContent>

            <TabsContent value="permissions" className="mt-0">
              <PermissionsManager 
                member={member}
                onUpdate={handleUpdateMember}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <CommentSection
                entityType="FamilyMember"
                entityId={member.id}
                entityName={member.name}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}