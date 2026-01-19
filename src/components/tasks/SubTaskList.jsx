import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubTaskList({ taskId }) {
  const queryClient = useQueryClient();
  const [newSubTask, setNewSubTask] = useState('');

  const { data: subTasks = [] } = useQuery({
    queryKey: ['subTasks', taskId],
    queryFn: () => base44.entities.SubTask.filter({ parent_task_id: taskId })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SubTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subTasks'] });
      setNewSubTask('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubTask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subTasks'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubTask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subTasks'] })
  });

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    createMutation.mutate({
      parent_task_id: taskId,
      title: newSubTask,
      order: subTasks.length
    });
  };

  const toggleComplete = (subTask) => {
    updateMutation.mutate({
      id: subTask.id,
      data: { ...subTask, is_completed: !subTask.is_completed }
    });
  };

  const completedCount = subTasks.filter(st => st.is_completed).length;
  const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

  return (
    <div className="space-y-3">
      {subTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
            <span>التقدم</span>
            <span>{completedCount} من {subTasks.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {subTasks.map((subTask) => (
            <motion.div
              key={subTask.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg group"
            >
              <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-move" />
              <Checkbox
                checked={subTask.is_completed}
                onCheckedChange={() => toggleComplete(subTask)}
              />
              <span className={`flex-1 text-sm ${subTask.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {subTask.title}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500"
                onClick={() => deleteMutation.mutate(subTask.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="إضافة مهمة فرعية..."
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
          className="text-sm dark:bg-slate-700 dark:border-slate-600"
        />
        <Button size="sm" onClick={handleAddSubTask} disabled={!newSubTask.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}