import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedingSchedule({ pet, onUpdate }) {
  const [feedingSchedule, setFeedingSchedule] = useState(pet.feeding_schedule || []);
  const [newMeal, setNewMeal] = useState({
    time: '08:00',
    food_type: '',
    amount: '',
    reminder_enabled: true
  });

  const addMeal = () => {
    if (!newMeal.food_type || !newMeal.amount) return;
    
    const updated = [...feedingSchedule, newMeal];
    setFeedingSchedule(updated);
    onUpdate({ ...pet, feeding_schedule: updated });
    setNewMeal({
      time: '08:00',
      food_type: '',
      amount: '',
      reminder_enabled: true
    });
  };

  const removeMeal = (index) => {
    const updated = feedingSchedule.filter((_, i) => i !== index);
    setFeedingSchedule(updated);
    onUpdate({ ...pet, feeding_schedule: updated });
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <UtensilsCrossed className="w-5 h-5" />
        جدول الطعام
      </h3>

      {/* Add Meal Form */}
      <Card className="bg-slate-50 dark:bg-slate-700/50 border-0 mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">الوقت</Label>
              <Input
                type="time"
                value={newMeal.time}
                onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                className="dark:bg-slate-600 dark:border-slate-500"
              />
            </div>
            <div>
              <Label className="text-xs">نوع الطعام</Label>
              <Input
                value={newMeal.food_type}
                onChange={(e) => setNewMeal({...newMeal, food_type: e.target.value})}
                placeholder="دراي فود"
                className="dark:bg-slate-600 dark:border-slate-500"
              />
            </div>
            <div>
              <Label className="text-xs">الكمية</Label>
              <Input
                value={newMeal.amount}
                onChange={(e) => setNewMeal({...newMeal, amount: e.target.value})}
                placeholder="كوب واحد"
                className="dark:bg-slate-600 dark:border-slate-500"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addMeal} 
                className="w-full"
                disabled={!newMeal.food_type || !newMeal.amount}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <div className="space-y-2">
        {feedingSchedule.map((meal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white dark:bg-slate-700 border dark:border-slate-600">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        {meal.time}
                      </Badge>
                      <h4 className="font-bold text-slate-900 dark:text-white">{meal.food_type}</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      الكمية: {meal.amount}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMeal(index)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {feedingSchedule.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لم تضف وجبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}