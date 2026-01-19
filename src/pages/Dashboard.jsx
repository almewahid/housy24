import React, { useState, useEffect } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Clock, TrendingUp, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import RecentTasks from '../components/dashboard/RecentTasks';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);

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

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Task.filter({ assigned_to: user.email });
    },
    enabled: !!user,
  });

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    myTasks: myTasks.length,
  };

  const statusDistribution = {
    pending: stats.pending,
    in_progress: stats.inProgress,
    completed: stats.completed,
    cancelled: allTasks.filter(t => t.status === 'cancelled').length,
  };

  const recentTasks = allTasks.slice(0, 5);

  const todayTasks = allTasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.due_date === today;
  }).length;

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
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">نظرة شاملة على جميع المهام والأنشطة</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المهام"
          value={stats.total}
          icon={CheckSquare}
          color="blue"
          index={0}
        />
        <StatsCard
          title="قيد التنفيذ"
          value={stats.inProgress}
          icon={TrendingUp}
          color="purple"
          index={1}
        />
        <StatsCard
          title="مهام اليوم"
          value={todayTasks}
          icon={CalendarIcon}
          color="green"
          index={2}
        />
        <StatsCard
          title="المهام المسندة لي"
          value={stats.myTasks}
          icon={AlertCircle}
          color="orange"
          index={3}
        />
      </div>

      {/* Charts and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressChart data={statusDistribution} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentTasks tasks={recentTasks} />
        </motion.div>
      </div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">معدل الإنجاز</h3>
            <p className="text-indigo-100">نسبة المهام المكتملة من الإجمالي</p>
          </div>
          <div className="text-5xl font-bold">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </div>
        </div>
        <div className="mt-6 h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
}