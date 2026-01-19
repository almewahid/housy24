import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Gift, Award, Users } from 'lucide-react';
import Leaderboard from '../components/gamification/Leaderboard';
import PointsSystem from '../components/gamification/PointsSystem';
import RewardsStore from '../components/gamification/RewardsStore';
import AchievementsBadges from '../components/gamification/AchievementsBadges';

export default function GamificationPage() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
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

  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const currentMember = members.find(m => m.email === user?.email);
  const sortedMembers = [...members].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
  const currentRank = sortedMembers.findIndex(m => m.id === currentMember?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            نظام التحفيز والمكافآت
          </h1>
          <p className="text-gray-600">تنافس مع أفراد عائلتك واكسب النقاط والمكافآت!</p>
        </div>

        {currentMember && (
          <div className="mb-6">
            <PointsSystem 
              member={currentMember} 
              rank={currentRank}
              totalMembers={members.length}
            />
          </div>
        )}

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              الصدارة
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              المكافآت
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              الإنجازات
            </TabsTrigger>
            <TabsTrigger value="all-members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الأعضاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Leaderboard members={members} />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsStore currentMember={currentMember} />
          </TabsContent>

          <TabsContent value="achievements">
            {currentMember ? (
              <AchievementsBadges memberEmail={currentMember.email} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                يرجى تسجيل الدخول لعرض الإنجازات
              </div>
            )}
          </TabsContent>

          <TabsContent value="all-members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMembers.map((member, index) => (
                <PointsSystem 
                  key={member.id}
                  member={member} 
                  rank={index + 1}
                  totalMembers={members.length}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}