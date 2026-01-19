import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, ShoppingBag, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RewardsStore({ currentMember }) {
  const [selectedReward, setSelectedReward] = useState(null);
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.filter({ is_active: true }),
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ['redemptions', currentMember?.email],
    queryFn: () => base44.entities.RewardRedemption.filter({ member_email: currentMember?.email }),
    enabled: !!currentMember?.email,
  });

  const redeemMutation = useMutation({
    mutationFn: async (reward) => {
      await base44.entities.RewardRedemption.create({
        member_email: currentMember.email,
        member_name: currentMember.name,
        reward_id: reward.id,
        reward_title: reward.title,
        points_spent: reward.points_required,
        redemption_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      });

      const newPoints = (currentMember.total_points || 0) - reward.points_required;
      await base44.entities.FamilyMember.update(currentMember.id, {
        total_points: newPoints,
      });

      await base44.entities.Reward.update(reward.id, {
        times_redeemed: (reward.times_redeemed || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setSelectedReward(null);
    },
  });

  const canAfford = (reward) => {
    return (currentMember?.total_points || 0) >= reward.points_required;
  };

  const isLimitReached = (reward) => {
    return reward.redemption_limit && reward.times_redeemed >= reward.redemption_limit;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-purple-600" />
          متجر المكافآت
        </CardTitle>
        {currentMember && (
          <div className="flex items-center gap-2 mt-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-bold">{currentMember.total_points || 0} نقطة متاحة</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${
                !canAfford(reward) || isLimitReached(reward) ? 'opacity-60' : 'hover:shadow-lg transition-shadow'
              }`}>
                <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex items-start justify-between">
                    <ShoppingBag className="h-8 w-8 text-purple-600" />
                    <Badge className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      {reward.points_required}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  
                  {reward.category && (
                    <Badge variant="outline" className="mb-3">
                      {reward.category}
                    </Badge>
                  )}

                  {isLimitReached(reward) ? (
                    <Badge variant="destructive" className="w-full justify-center">
                      نفدت الكمية
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => redeemMutation.mutate(reward)}
                      disabled={!canAfford(reward) || !currentMember}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {canAfford(reward) ? 'استبدل الآن' : 'نقاط غير كافية'}
                    </Button>
                  )}

                  {reward.redemption_limit && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {reward.times_redeemed || 0} / {reward.redemption_limit} تم استبدالها
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>لا توجد مكافآت متاحة حالياً</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}