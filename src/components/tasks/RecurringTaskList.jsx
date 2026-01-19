import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, Trash2, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecurringTaskList({ recurringTasks, onToggleActive, onDelete }) {
  const recurrenceLabels = {
    daily: 'يومياً',
    weekly: 'أسبوعياً',
    monthly: 'شهرياً',
    yearly: 'سنوياً',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const priorityLabels = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };

  if (recurringTasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-900">
          <Repeat className="h-5 w-5" />
          المهام المتكررة ({recurringTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {recurringTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                task.is_active 
                  ? 'bg-white border-purple-200 shadow-sm' 
                  : 'bg-gray-100 border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <Repeat className="h-3 w-3 ml-1" />
                      {recurrenceLabels[task.recurrence_type]}
                    </Badge>
                    <Badge className={priorityColors[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                    {task.assigned_to && (
                      <Badge variant="outline" className="text-xs">
                        {task.assigned_to}
                      </Badge>
                    )}
                    {!task.is_active && (
                      <Badge className="bg-gray-500 text-white">
                        متوقفة
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(task)}
                    className={task.is_active ? 'hover:bg-orange-100 hover:text-orange-600' : 'hover:bg-green-100 hover:text-green-600'}
                  >
                    {task.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task)}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}