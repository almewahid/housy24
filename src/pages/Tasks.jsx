import React, { useState, useEffect } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Repeat } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import TaskForm from '../components/tasks/TaskForm';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import RecurringTaskForm from '../components/tasks/RecurringTaskForm';
import RecurringTaskList from '../components/tasks/RecurringTaskList';
import { addDays, addWeeks, addMonths, addYears, parseISO, isBefore, isAfter } from 'date-fns';

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_at'), // تم التصحيح: created_at بدلاً من created_date
  });

  const { data: recurringTasks = [] } = useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: () => base44.entities.RecurringTask.list('-created_at'), // تم التصحيح
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const newTask = await base44.entities.Task.create(taskData);
      
      if (taskData.assigned_to && taskData.assigned_to !== user?.email) {
        await base44.entities.Notification.create({
          title: 'مهمة جديدة مسندة إليك',
          message: `تم تعيين المهمة "${taskData.title}" لك`,
          type: 'task_assigned',
          user_email: taskData.assigned_to,
          related_task_id: newTask.id,
        });
      }
      
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, taskData }) => {
      const oldTask = tasks.find(t => t.id === id);
      const updatedTask = await base44.entities.Task.update(id, taskData);
      
      if (oldTask?.assigned_to && taskData.assigned_to && oldTask.assigned_to !== user?.email) {
        await base44.entities.Notification.create({
          title: 'تحديث على المهمة',
          message: `تم تحديث المهمة "${taskData.title}"`,
          type: 'task_updated',
          user_email: oldTask.assigned_to,
          related_task_id: id,
        });
      }
      
      if (taskData.status === 'completed' && oldTask?.status !== 'completed') {
        if (oldTask?.created_by && oldTask.created_by !== user?.email) {
          await base44.entities.Notification.create({
            title: 'مهمة مكتملة',
            message: `تم إكمال المهمة "${taskData.title}"`,
            type: 'task_completed',
            user_email: oldTask.created_by,
            related_task_id: id,
          });
        }
      }
      
      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSubmit = (taskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (task) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const createRecurringTaskMutation = useMutation({
    mutationFn: async (recurringData) => {
      const recurringTask = await base44.entities.RecurringTask.create(recurringData);
      await generateTasksFromRecurring(recurringTask);
      return recurringTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowRecurringForm(false);
    },
  });

  const toggleRecurringTaskMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.RecurringTask.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
  });

  const deleteRecurringTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.RecurringTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
  });

  const generateTasksFromRecurring = async (recurringTask) => {
    const today = new Date();
    const startDate = parseISO(recurringTask.start_date);
    const endDate = recurringTask.end_date ? parseISO(recurringTask.end_date) : addYears(today, 1);
    
    let currentDate = startDate;
    const tasksToCreate = [];

    while (isBefore(currentDate, endDate) || currentDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]) {
      if (!isBefore(currentDate, today)) {
        tasksToCreate.push({
          title: recurringTask.title,
          description: recurringTask.description || null,
          status: 'pending',
          priority: recurringTask.priority,
          category: recurringTask.category,
          assigned_to: recurringTask.assigned_to || null,
          due_date: currentDate.toISOString().split('T')[0],
          progress: 0,
        });
      }

      switch (recurringTask.recurrence_type) {
        case 'daily':
          currentDate = addDays(currentDate, recurringTask.recurrence_interval || 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, recurringTask.recurrence_interval || 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, recurringTask.recurrence_interval || 1);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, recurringTask.recurrence_interval || 1);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }

      if (tasksToCreate.length >= 100) break;
    }

    if (tasksToCreate.length > 0) {
      await base44.entities.Task.bulkCreate(tasksToCreate);
    }
  };

  const handleRecurringSubmit = (recurringData) => {
    createRecurringTaskMutation.mutate(recurringData);
  };

  const handleToggleRecurring = (task) => {
    toggleRecurringTaskMutation.mutate({ id: task.id, is_active: !task.is_active });
  };

  const handleDeleteRecurring = (task) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة المتكررة؟ لن يتم حذف المهام التي تم إنشاؤها مسبقاً.')) {
      deleteRecurringTaskMutation.mutate(task.id);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchStatus = filters.status === 'all' || task.status === filters.status;
    const matchPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchCategory = filters.category === 'all' || task.category === filters.category;
    
    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المهام</h1>
          <p className="text-gray-600">تنظيم وتتبع جميع المهام المنزلية</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setShowForm(false);
              setShowRecurringForm(!showRecurringForm);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
          >
            <Repeat className="ml-2 h-5 w-5" />
            مهمة متكررة
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null);
              setShowRecurringForm(false);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          >
            <Plus className="ml-2 h-5 w-5" />
            مهمة جديدة
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}
        {showRecurringForm && (
          <RecurringTaskForm
            onSubmit={handleRecurringSubmit}
            onCancel={() => setShowRecurringForm(false)}
          />
        )}
      </AnimatePresence>

      <RecurringTaskList
        recurringTasks={recurringTasks}
        onToggleActive={handleToggleRecurring}
        onDelete={handleDeleteRecurring}
      />

      <TaskFilters filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا توجد مهام تطابق معايير البحث</p>
        </div>
      )}
    </div>
  );
}