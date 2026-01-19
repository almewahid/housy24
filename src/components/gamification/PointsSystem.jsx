import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';

export default function PointsSystem({ member, rank, totalMembers }) {
  const level = Math.floor(member.total_points / 100) + 1;
  const pointsToNextLevel = (level * 100) - member.total_points;
  const progress = ((member.total_points % 100) / 100) * 100;

  const getRankBadge = () => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (rank === 2) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-50' };
    if (rank === 3) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  const badge = getRankBadge();
  const RankIcon = badge.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${badge.bg}`}>
              <RankIcon className={`h-5 w-5 ${badge.color}`} />
            </div>
            {member.name}
          </CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            #{rank}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">إجمالي النقاط</p>
            <p className="text-3xl font-bold text-indigo-600">{member.total_points}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">المستوى</p>
            <p className="text-2xl font-bold text-purple-600">{level}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">التقدم للمستوى التالي</span>
            <span className="text-sm font-medium">{pointsToNextLevel} نقطة</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {member.level && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>المستوى الحالي: {member.level}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}