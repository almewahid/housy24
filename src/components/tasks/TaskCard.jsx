import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function TaskCard({ task, onEdit, onDelete }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
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

  const categoryLabels = {
    cleaning: 'تنظيف',
    cooking: 'طبخ',
    shopping: 'تسوق',
    laundry: 'غسيل',
    childcare: 'رعاية الأطفال',
    maintenance: 'صيانة',
    organization: 'تنظيم',
    other: 'أخرى',
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`hover:shadow-xl transition-all duration-300 border ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-bold text-gray-900 flex-1">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="hover:bg-indigo-100 hover:text-indigo-600">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(task)} className="hover:bg-red-100 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {categoryLabels[task.category]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {task.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                {format(new Date(task.due_date), 'PPP', { locale: ar })}
              </span>
              {isOverdue && <Badge className="bg-red-500 text-white text-xs">متأخرة</Badge>}
            </div>

            {task.assigned_to && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{task.assigned_to}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span>التقدم: {task.progress}%</span>
            </div>
          </div>

          {task.progress > 0 && (
            <div className="space-y-2">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    task.progress === 100 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}