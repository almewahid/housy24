import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ members }) {
  const sortedMembers = [...members].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

  const getMedalIcon = (rank) => {
    if (rank === 1) return { Icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (rank === 2) return { Icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50' };
    if (rank === 3) return { Icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50' };
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          لوحة الصدارة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMembers.map((member, index) => {
            const rank = index + 1;
            const medal = getMedalIcon(rank);
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  rank <= 3 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {medal ? (
                    <div className={`p-3 rounded-full ${medal.bg}`}>
                      <medal.Icon className={`h-6 w-6 ${medal.color}`} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">#{rank}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role || 'عضو'}</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <Badge className="bg-indigo-600 text-lg px-4 py-1">
                    {member.total_points || 0} نقطة
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    المستوى {Math.floor((member.total_points || 0) / 100) + 1}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}