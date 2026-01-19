import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, Pill, Scissors, FileText, UtensilsCrossed, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import PetReminders from './PetReminders';
import FeedingSchedule from './FeedingSchedule';
import PetBudgetManager from './PetBudgetManager';

export default function PetHealthTracker({ pet, onClose, onUpdate }) {
  const [vaccinations, setVaccinations] = useState(pet.vaccinations || []);
  const [medications, setMedications] = useState(pet.medications || []);
  const [newVaccination, setNewVaccination] = useState({ name: '', date: '', next_due: '', notes: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', start_date: '', end_date: '' });

  const addVaccination = () => {
    if (!newVaccination.name) return;
    const updated = [...vaccinations, newVaccination];
    setVaccinations(updated);
    onUpdate({ ...pet, vaccinations: updated });
    setNewVaccination({ name: '', date: '', next_due: '', notes: '' });
  };

  const addMedication = () => {
    if (!newMedication.name) return;
    const updated = [...medications, newMedication];
    setMedications(updated);
    onUpdate({ ...pet, medications: updated });
    setNewMedication({ name: '', dosage: '', frequency: '', start_date: '', end_date: '' });
  };

  const removeVaccination = (index) => {
    const updated = vaccinations.filter((_, i) => i !== index);
    setVaccinations(updated);
    onUpdate({ ...pet, vaccinations: updated });
  };

  const removeMedication = (index) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
    onUpdate({ ...pet, medications: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto"
      >
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-xl">
          <CardHeader className="sticky top-0 bg-white dark:bg-slate-800 z-10 border-b dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                السجل الصحي - {pet.name}
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="reminders">
              <TabsList className="grid w-full grid-cols-5 dark:bg-slate-700">
                <TabsTrigger value="reminders" className="dark:data-[state=active]:bg-slate-600">
                  <Clock className="w-4 h-4 ml-2" />
                  التذكيرات
                </TabsTrigger>
                <TabsTrigger value="feeding" className="dark:data-[state=active]:bg-slate-600">
                  <UtensilsCrossed className="w-4 h-4 ml-2" />
                  الوجبات
                </TabsTrigger>
                <TabsTrigger value="budget" className="dark:data-[state=active]:bg-slate-600">
                  <FileText className="w-4 h-4 ml-2" />
                  الميزانية
                </TabsTrigger>
                <TabsTrigger value="vaccinations" className="dark:data-[state=active]:bg-slate-600">
                  <Calendar className="w-4 h-4 ml-2" />
                  التطعيمات
                </TabsTrigger>
                <TabsTrigger value="medications" className="dark:data-[state=active]:bg-slate-600">
                  <Pill className="w-4 h-4 ml-2" />
                  الأدوية
                </TabsTrigger>
              </TabsList>

              {/* Reminders Tab */}
              <TabsContent value="reminders" className="space-y-4">
                <PetReminders pet={pet} />
              </TabsContent>

              {/* Feeding Tab */}
              <TabsContent value="feeding" className="space-y-4">
                <FeedingSchedule pet={pet} onUpdate={onUpdate} />
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-4">
                <PetBudgetManager pet={pet} />
              </TabsContent>

              {/* Vaccinations Tab */}
              <TabsContent value="vaccinations" className="space-y-4">
                <Card className="bg-slate-50 dark:bg-slate-700/50 border-0">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">إضافة تطعيم جديد</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="اسم التطعيم"
                        value={newVaccination.name}
                        onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Input
                        type="date"
                        placeholder="التاريخ"
                        value={newVaccination.date}
                        onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Input
                        type="date"
                        placeholder="الموعد القادم"
                        value={newVaccination.next_due}
                        onChange={(e) => setNewVaccination({ ...newVaccination, next_due: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Button onClick={addVaccination} disabled={!newVaccination.name}>
                        <Plus className="w-4 h-4 ml-1" />
                        إضافة
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {vaccinations.map((v, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-700 border dark:border-slate-600">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{v.name}</p>
                          <div className="flex gap-2 mt-1">
                            {v.date && <Badge variant="outline" className="dark:border-slate-500">التاريخ: {format(new Date(v.date), 'd/M/yyyy')}</Badge>}
                            {v.next_due && <Badge variant="outline" className="dark:border-slate-500">القادم: {format(new Date(v.next_due), 'd/M/yyyy')}</Badge>}
                          </div>
                          {v.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{v.notes}</p>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeVaccination(i)} className="text-red-500">
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {vaccinations.length === 0 && (
                    <p className="text-center text-slate-400 dark:text-slate-500 py-8">لا توجد تطعيمات مسجلة</p>
                  )}
                </div>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-4">
                <Card className="bg-slate-50 dark:bg-slate-700/50 border-0">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">إضافة دواء جديد</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="اسم الدواء"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Input
                        placeholder="الجرعة"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Input
                        placeholder="التكرار"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                        className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                      />
                      <Button onClick={addMedication} disabled={!newMedication.name}>
                        <Plus className="w-4 h-4 ml-1" />
                        إضافة
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {medications.map((m, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-700 border dark:border-slate-600">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                          <div className="flex gap-2 mt-1">
                            {m.dosage && <Badge variant="outline" className="dark:border-slate-500">الجرعة: {m.dosage}</Badge>}
                            {m.frequency && <Badge variant="outline" className="dark:border-slate-500">{m.frequency}</Badge>}
                          </div>
                          {m.start_date && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              من {format(new Date(m.start_date), 'd/M/yyyy')}
                              {m.end_date && ` إلى ${format(new Date(m.end_date), 'd/M/yyyy')}`}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeMedication(i)} className="text-red-500">
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {medications.length === 0 && (
                    <p className="text-center text-slate-400 dark:text-slate-500 py-8">لا توجد أدوية مسجلة</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}