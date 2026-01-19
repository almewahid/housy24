import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Calendar, Activity, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays, differenceInYears, differenceInMonths } from 'date-fns';
import PetCard from '@/components/pets/PetCard';
import PetForm from '@/components/pets/PetForm';
import PetHealthTracker from '@/components/pets/PetHealthTracker';

export default function Pets() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => base44.entities.Pet.filter({ is_active: true })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pet.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setShowForm(false);
      setEditingPet(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pet.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setShowForm(false);
      setEditingPet(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pet.update(id, { is_active: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pets'] })
  });

  const handleSave = (data) => {
    if (editingPet) {
      updateMutation.mutate({ id: editingPet.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  // Calculate stats
  const upcomingVaccinations = pets.filter(pet => 
    pet.vaccinations?.some(v => {
      if (!v.next_due) return false;
      const days = differenceInDays(new Date(v.next_due), new Date());
      return days >= 0 && days <= 30;
    })
  ).length;

  const needsGrooming = pets.filter(pet => {
    if (!pet.next_grooming) return false;
    return differenceInDays(new Date(pet.next_grooming), new Date()) <= 3;
  }).length;

  const healthConcerns = pets.filter(p => p.health_status === 'يحتاج متابعة' || p.health_status === 'مريض').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">رعاية الحيوان</h1>
            <p className="text-slate-500 dark:text-slate-400">إدارة شاملة لصحة ورعاية حيواناتك</p>
          </div>
          <Button onClick={() => { setEditingPet(null); setShowForm(true); }} className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Plus className="w-5 h-5" />
            إضافة حيوان
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pets.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">حيوان</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingVaccinations}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">تطعيمات قادمة</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{needsGrooming}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">يحتاج تنظيف</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{healthConcerns}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">قلق صحي</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pets Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">جاري التحميل...</div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">لم تضف أي حيوانات بعد</p>
            <Button onClick={() => setShowForm(true)}>إضافة أول حيوان</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {pets.map((pet, index) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PetCard
                    pet={pet}
                    onEdit={handleEdit}
                    onDelete={() => deleteMutation.mutate(pet.id)}
                    onClick={() => setSelectedPet(pet)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pet Form */}
        {showForm && (
          <PetForm
            pet={editingPet}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingPet(null); }}
          />
        )}

        {/* Pet Health Tracker */}
        {selectedPet && (
          <PetHealthTracker
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
            onUpdate={(data) => updateMutation.mutate({ id: selectedPet.id, data })}
          />
        )}
      </div>
    </div>
  );
}