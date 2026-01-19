import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function CommentSection({ entityType, entityId, entityName }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => base44.entities.Comment.filter({ entity_type: entityType, entity_id: entityId }, '-created_date')
  });

  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
      setNewComment('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] })
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    const user = await base44.auth.me();
    const member = members.find(m => m.email === user?.email);
    
    createMutation.mutate({
      text: newComment,
      author_name: member?.name || user?.full_name || 'مجهول',
      entity_type: entityType,
      entity_id: entityId
    });
  };

  const getMemberColor = (name) => {
    const member = members.find(m => m.name === name);
    return member?.avatar_color || '#94a3b8';
  };

  return (
    <Card className="bg-white/90 border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          التعليقات على {entityName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="max-h-60 overflow-y-auto space-y-3">
          {comments.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-4">لا توجد تعليقات بعد</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback style={{ backgroundColor: getMemberColor(comment.author_name) }}>
                    {comment.author_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{comment.author_name}</span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.text}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500"
                  onClick={() => deleteMutation.mutate(comment.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* New Comment Input */}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="min-h-[60px] resize-none"
          />
          <Button 
            size="icon" 
            onClick={handleSubmit}
            disabled={!newComment.trim() || createMutation.isPending}
            className="h-auto bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}