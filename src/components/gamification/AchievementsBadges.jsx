import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Target, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementsBadges({ memberEmail }) {
  const { data: memberAchievements = [] } = useQuery({
    queryKey: ['memberAchievements', memberEmail],
    queryFn: () => base44.entities.MemberAchievement.filter({ member_email: memberEmail }),
    enabled: !!memberEmail,
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.filter({ is_active: true }),
  });

  const earnedIds = new Set(memberAchievements.map(ma => ma.achievement_id));
  const earnedAchievements = allAchievements.filter(a => earnedIds.has(a.id));
  const lockedAchievements = allAchievements.filter(a => !earnedIds.has(a.id));

  const getIcon = (type) => {
    const icons = {
      tasks_completed: Target,
      consecutive_days: Zap,
      points_earned: Star,
      category_tasks: Trophy,
      pet_care: Award,
      custom: Crown,
    };
    return icons[type] || Award;
  };

  const renderAchievement = (achievement, earned, index) => {
    const Icon = getIcon(achievement.criteria_type);
    
    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={`relative p-4 rounded-xl transition-all ${
          earned 
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 shadow-md' 
            : 'bg-gray-100 border-2 border-gray-300 opacity-60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-full ${earned ? 'bg-yellow-400' : 'bg-gray-300'}`}>
            <Icon className={`h-6 w-6 ${earned ? 'text-white' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1">
            <h4 className={`font-bold ${earned ? 'text-gray-900' : 'text-gray-600'}`}>
              {achievement.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
            
            <div className="flex items-center gap-2 mt-2">
              {achievement.bonus_points > 0 && (
                <Badge className="bg-purple-600">
                  +{achievement.bonus_points} نقطة
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {achievement.criteria_value} {
                  achievement.criteria_type === 'tasks_completed' ? 'مهمة' :
                  achievement.criteria_type === 'consecutive_days' ? 'يوم متتالي' :
                  achievement.criteria_type === 'points_earned' ? 'نقطة' : ''
                }
              </Badge>
            </div>
          </div>
          {earned && (
            <div className="absolute top-2 left-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-600" />
          الشارات والإنجازات
        </CardTitle>
        <p className="text-sm text-gray-500">
          {earnedAchievements.length} من {allAchievements.length} إنجاز
        </p>
      </CardHeader>
      <CardContent>
        {earnedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              الإنجازات المحققة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {earnedAchievements.map((achievement, index) => 
                renderAchievement(achievement, true, index)
              )}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 text-gray-500">
              الإنجازات المقفلة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lockedAchievements.map((achievement, index) => 
                renderAchievement(achievement, false, index)
              )}
            </div>
          </div>
        )}

        {allAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>لا توجد إنجازات متاحة حالياً</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}