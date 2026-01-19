import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Leaf, Droplets, Sun, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isPast, differenceInDays, addDays, addWeeks, addMonths } from "date-fns";
import PlantCard from '@/components/plants/PlantCard';
import PlantForm from '@/components/plants/PlantForm';
import AdvancedFilters from '@/components/common/AdvancedFilters';

const filterConfig = [
  { key: 'health_status', label: 'الحالة الصحية', type: 'select', options: ["ممتاز", "جيد", "يحتاج عناية", "مريض"] },
  { key: 'sunlight_needs', label: 'الإضاءة', type: 'select', options: ["ضوء مباشر", "ضوء غير مباشر", "ظل جزئي", "ظل كامل"] },
  { key: 'watering_frequency', label: 'تكرار الري', type: 'select', options: ["يومي", "كل يومين", "كل 3 أيام", "أسبوعي", "كل أسبوعين", "شهري"] },
  { key: 'location', label: 'الموقع', type: 'select', options: [] }
];

const calculateNextWatering = (lastDate, frequency) => {
  const date = lastDate ? new Date(lastDate) : new Date();
  switch (frequency) {
    case "يومي": return addDays(date, 1);
    case "كل يومين": return addDays(date, 2);
    case "كل 3 أيام": return addDays(date, 3);
    case "أسبوعي": return addWeeks(date, 1);
    case "كل أسبوعين": return addWeeks(date, 2);
    case "شهري": return addMonths(date, 1);
    default: return addWeeks(date, 1);
  }
};

export default function Plants() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [filters, setFilters] = useState({});
  
  const queryClient = useQueryClient();

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: () => base44.entities.Plant.list('-created_at')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Plant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Plant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Plant.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plants'] })
  });

  const handleSave = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleWater = (plant) => {
    const today = new Date().toISOString().split('T')[0];
    const nextWatering = calculateNextWatering(today, plant.watering_frequency);
    updateMutation.mutate({ 
      id: plant.id, 
      data: { 
        ...plant, 
        last_watered: today,
        next_watering: nextWatering.toISOString().split('T')[0]
      } 
    });
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plant.species?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const needsWater = plant.next_watering && 
      (isPast(new Date(plant.next_watering)) || differenceInDays(new Date(plant.next_watering), new Date()) === 0);
    
    const matchesStatus = statusFilter === 'الكل' ||
                         (statusFilter === 'يحتاج ري' && needsWater) ||
                         (statusFilter === 'بصحة جيدة' && plant.health_status === 'جيد' || plant.health_status === 'ممتاز') ||
                         (statusFilter === 'يحتاج عناية' && (plant.health_status === 'يحتاج عناية' || plant.health_status === 'مريض'));

    // Advanced filters
    if (filters.health_status && filters.health_status !== 'الكل' && plant.health_status !== filters.health_status) return false;
    if (filters.sunlight_needs && filters.sunlight_needs !== 'الكل' && plant.sunlight_needs !== filters.sunlight_needs) return false;
    if (filters.watering_frequency && filters.watering_frequency !== 'الكل' && plant.watering_frequency !== filters.watering_frequency) return false;

    return matchesSearch && matchesStatus;
  });

  const needsWateringCount = plants.filter(plant => 
    plant.next_watering && (isPast(new Date(plant.next_watering)) || differenceInDays(new Date(plant.next_watering), new Date()) === 0)
  ).length;

  const healthyCount = plants.filter(p => p.health_status === 'جيد' || p.health_status === 'ممتاز').length;
  const needsCareCount = plants.filter(p => p.health_status === 'يحتاج عناية' || p.health_status === 'مريض').length;

  // Get unique locations for filter
  const locations = [...new Set(plants.map(p => p.location).filter(Boolean))];
  const updatedFilterConfig = filterConfig.map(f => 
    f.key === 'location' ? { ...f, options: locations } : f
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">العناية بالنباتات</h1>
            <p className="text-slate-500">تذكيرات لسقي النباتات والعناية بها</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-5 h-5 ml-2" />
            إضافة نبات
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">إجمالي النباتات</p>
                <p className="text-2xl font-bold text-slate-800">{plants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">تحتاج ري</p>
                <p className="text-2xl font-bold text-blue-600">{needsWateringCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">بصحة جيدة</p>
                <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">تحتاج عناية</p>
                <p className="text-2xl font-bold text-amber-600">{needsCareCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="ابحث عن نبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white/80 border-slate-200"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-white/80">
                <TabsTrigger value="الكل">الكل</TabsTrigger>
                <TabsTrigger value="يحتاج ري">يحتاج ري</TabsTrigger>
                <TabsTrigger value="بصحة جيدة">بصحة جيدة</TabsTrigger>
                <TabsTrigger value="يحتاج عناية">يحتاج عناية</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <AdvancedFilters 
            filters={filters}
            onFilterChange={setFilters}
            filterConfig={updatedFilterConfig}
            onClearFilters={() => setFilters({})}
          />
        </div>

        {/* Plants Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/80 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد نباتات</h3>
            <p className="text-slate-400 mb-6">ابدأ بإضافة نباتاتك المنزلية</p>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-5 h-5 ml-2" />
              إضافة نبات
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence>
              {filteredPlants.map((plant, index) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <PlantCard plant={plant} onClick={handleEdit} />
                  <div className="absolute top-2 left-14 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWater(plant);
                      }}
                      className="bg-blue-500 text-white hover:bg-blue-600 h-8 w-8"
                    >
                      <Droplets className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(plant.id);
                      }}
                      className="bg-red-500 text-white hover:bg-red-600 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <PlantForm
            plant={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}