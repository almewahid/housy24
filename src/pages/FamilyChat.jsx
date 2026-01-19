import React, { useState, useEffect, useRef } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Image as ImageIcon, Bell, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function FamilyChat() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 100),
    refetchInterval: 5000
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      setMessage('');
      scrollToBottom();
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
    onSuccess: (imageUrl) => {
      sendMessageMutation.mutate({
        message: 'أرسل صورة',
        sender_name: user?.full_name || 'مستخدم',
        sender_email: user?.email,
        image_url: imageUrl,
        message_type: 'image'
      });
      setUploading(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      sender_name: user?.full_name || 'مستخدم',
      sender_email: user?.email,
      message_type: 'text'
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const unreadCount = messages.filter(m => 
    !m.read_by?.includes(user?.email) && m.sender_email !== user?.email
  ).length;

  const reversedMessages = [...messages].reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">محادثة العائلة</h1>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">{familyMembers.length} أفراد متصلين</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white px-4 py-2 text-lg">
                <Bell className="w-4 h-4 ml-1" />
                {unreadCount} جديد
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 bg-white/90 dark:bg-slate-800/90 border-0 shadow-lg flex flex-col mb-6 overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {reversedMessages.map((msg, index) => {
                  const isMe = msg.sender_email === user?.email;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                        {!isMe && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 px-2">
                            {msg.sender_name}
                          </p>
                        )}
                        <div 
                          className={`p-4 rounded-2xl ${
                            isMe 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          }`}
                        >
                          {msg.message_type === 'image' && msg.image_url && (
                            <img 
                              src={msg.image_url} 
                              alt="صورة" 
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}
                          {msg.message_type === 'announcement' && (
                            <Badge className="mb-2 bg-amber-500">إعلان</Badge>
                          )}
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-2 ${isMe ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {format(new Date(msg.created_date), 'hh:mm a', { locale: ar })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* Input */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('image-upload').click()}
                disabled={uploading}
                className="dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالتك..."
                className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || uploading}
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Send className="w-5 h-5" />
                إرسال
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}