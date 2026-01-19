import React, { useState, useEffect } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Phone, Mail, Home, Edit, Trash2, Copy, Check, Eye, MessageCircle, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";
import FamilyMemberDetails from '@/components/family/FamilyMemberDetails';

const roles = ["أب", "أم", "ابن", "ابنة", "جد", "جدة", "أخ", "أخت", "زميل سكن", "أخرى"];
const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export default function Family() {
  const queryClient = useQueryClient();
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [copied, setCopied] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [familyCode, setFamilyCode] = useState('');

  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['familyProfile'],
    queryFn: () => base44.entities.FamilyProfile.list()
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile) {
      setHouseName(profile.house_name || '');
      setFamilyCode(profile.family_code || '');
    }
  }, [profile]);

  const createMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setShowMemberForm(false);
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setShowMemberForm(false);
      setEditingMember(null);
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyMembers'] })
  });

  const saveProfileMutation = useMutation({
    mutationFn: (data) => {
      if (profile) {
        return base44.entities.FamilyProfile.update(profile.id, data);
      }
      return base44.entities.FamilyProfile.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyProfile'] })
  });

  const handleSaveProfile = () => {
    const code = familyCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    saveProfileMutation.mutate({ house_name: houseName, family_code: code });
    setFamilyCode(code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/50 to-emerald-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">العائلة</h1>
            <p className="text-slate-500">إدارة أفراد الأسرة والتواصل</p>
          </div>
          <Button onClick={() => { setEditingMember(null); setShowMemberForm(true); }} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="w-5 h-5" />
            إضافة فرد
          </Button>
        </div>

        {/* House Name Card */}
        <Card className="mb-8 bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Home className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <Input
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="اسم البيت (مثل: بيت آل أحمد)"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-xl font-bold"
                />
              </div>
              <Button onClick={handleSaveProfile} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                حفظ
              </Button>
            </div>
            {familyCode && (
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-white/80">كود العائلة للانضمام:</span>
                <Badge className="bg-white text-teal-700 text-lg px-4">{familyCode}</Badge>
                <Button size="icon" variant="ghost" onClick={copyCode} className="text-white hover:bg-white/20">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Members Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all group cursor-pointer" onClick={() => setSelectedMember(member)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback 
                        className="text-white text-xl font-bold"
                        style={{ backgroundColor: member.avatar_color || colors[index % colors.length] }}
                      >
                        {member.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingMember(member); setShowMemberForm(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); deleteMemberMutation.mutate(member.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-teal-600 mb-2">
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">{member.phone}</span>
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-slate-600 hover:text-teal-600">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </a>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-slate-500">{member.total_points || 0} نقطة</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Member Details Modal */}
        {selectedMember && (
          <FamilyMemberDetails 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
        )}

        {/* Member Form Dialog */}
        <Dialog open={showMemberForm} onOpenChange={setShowMemberForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'تعديل فرد' : 'إضافة فرد جديد'}</DialogTitle>
            </DialogHeader>
            <MemberForm 
              member={editingMember}
              onSave={(data) => {
                if (editingMember) {
                  updateMemberMutation.mutate({ id: editingMember.id, data });
                } else {
                  createMemberMutation.mutate(data);
                }
              }}
              onCancel={() => setShowMemberForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function MemberForm({ member, onSave, onCancel }) {
  const [formData, setFormData] = useState(member || {
    name: '',
    role: 'ابن',
    phone: '',
    email: '',
    avatar_color: colors[0]
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>الاسم *</Label>
        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>
      <div>
        <Label>الدور في العائلة</Label>
        <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>رقم الهاتف</Label>
        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} dir="ltr" />
      </div>
      <div>
        <Label>البريد الإلكتروني</Label>
        <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" />
      </div>
      <div>
        <Label>لون الأيقونة</Label>
        <div className="flex gap-2 mt-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setFormData({...formData, avatar_color: color})}
              className={`w-8 h-8 rounded-full transition-transform ${formData.avatar_color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button onClick={() => onSave(formData)} disabled={!formData.name}>حفظ</Button>
      </div>
    </div>
  );
}