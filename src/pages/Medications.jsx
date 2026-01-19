import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Search, User, Clock, Bell, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import MedicationCard from '@/components/medications/MedicationCard';
import MedicationForm from '@/components/medications/MedicationForm';

export default function Medications() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState('الكل');

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.filter({ is_active: true })
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Medication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowForm(false);
      setEditingMed(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Medication.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] })
  });

  const handleSave = (data) => {
    if (editingMed) {
      updateMutation.mutate({ id: editingMed.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMember = memberFilter === 'الكل' || med.family_member === memberFilter;
    return matchesSearch && matchesMember;
  });

  // Group by family member
  const groupedByMember = filteredMeds.reduce((acc, med) => {
    const member = med.family_member || 'غير محدد';
    if (!acc[member]) acc[member] = [];
    acc[member].push(med);
    return acc;
  }, {});

  // Get today's medications
  const todayMeds = medications.filter(med => {
    if (!med.is_active) return false;
    const today = format(new Date(), 'EEEE', { locale: ar });
    if (med.frequency_type === 'يومي') return true;
    if (med.frequency_type === 'أسبوعي' && med.days_of_week?.includes(today)) return true;
    return false;
  });

  const uniqueMembers = [...new Set(medications.map(m => m.family_member).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50/30" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">الأدوية</h1>
            <p className="text-slate-500">تتبع أدوية أفراد العائلة والتذكيرات</p>
          </div>
          <Button onClick={() => { setEditingMed(null); setShowForm(true); }} className="gap-2 bg-rose-600 hover:bg-rose-700">
            <Plus className="w-5 h-5" />
            إضافة دواء
          </Button>
        </div>

        {/* Today's Medications */}
        {todayMeds.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                أدوية اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {todayMeds.map(med => (
                  <div key={med.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      <span className="font-medium">{med.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
                      <User className="w-3 h-3" />
                      <span>{med.family_member}</span>
                      {med.times_per_day?.length > 0 && (
                        <>
                          <Clock className="w-3 h-3 mr-2" />
                          <span>{med.times_per_day.join(' • ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ابحث عن دواء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/80"
            />
          </div>
          <Tabs value={memberFilter} onValueChange={setMemberFilter}>
            <TabsList className="bg-white/80">
              <TabsTrigger value="الكل">الكل</TabsTrigger>
              {uniqueMembers.map(member => (
                <TabsTrigger key={member} value={member}>{member}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Medications by Member */}
        {Object.keys(groupedByMember).length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">لا توجد أدوية مسجلة</p>
            <Button onClick={() => setShowForm(true)}>إضافة أول دواء</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMember).map(([member, meds]) => (
              <div key={member}>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {member}
                  <Badge variant="secondary">{meds.length} دواء</Badge>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {meds.map((med, index) => (
                      <motion.div
                        key={med.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MedicationCard
                          medication={med}
                          onEdit={() => { setEditingMed(med); setShowForm(true); }}
                          onDelete={() => deleteMutation.mutate(med.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <MedicationForm
              medication={editingMed}
              familyMembers={familyMembers}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingMed(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}