import React, { useState, useEffect } from 'react';
import { supabase } from '@/components/api/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, User, MessageSquare, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function AdminSupport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, replied, closed

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      let query = supabase
        .from('ContactRequest')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'معلق');
      } else if (filter === 'replied') {
        query = query.eq('status', 'تم الرد');
      } else if (filter === 'closed') {
        query = query.eq('status', 'مغلق');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('ContactRequest')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const deleteRequest = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('ContactRequest')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'معلق': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'تم الرد': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'مغلق': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig['معلق'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            إدارة رسائل الدعم
          </h1>
          <p className="text-slate-600">
            إجمالي الرسائل: {requests.length}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            الكل ({requests.length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            معلق
          </Button>
          <Button
            onClick={() => setFilter('replied')}
            variant={filter === 'replied' ? 'default' : 'outline'}
            className={filter === 'replied' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            تم الرد
          </Button>
          <Button
            onClick={() => setFilter('closed')}
            variant={filter === 'closed' ? 'default' : 'outline'}
            className={filter === 'closed' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          >
            مغلق
          </Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد رسائل</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-slate-600" />
                        <CardTitle className="text-xl">{request.name}</CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${request.email}`} className="hover:text-emerald-600">
                            {request.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{request.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {request.status === 'معلق' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, 'تم الرد')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          تم الرد
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(request.id, 'مغلق')}
                        >
                          إغلاق
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'تم الرد' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(request.id, 'مغلق')}
                      >
                        إغلاق
                      </Button>
                    )}

                    {request.status === 'مغلق' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(request.id, 'معلق')}
                      >
                        إعادة فتح
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteRequest(request.id)}
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>

                    <a
                      href={`mailto:${request.email}?subject=رد على: ${request.request_type}`}
                      className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50"
                    >
                      <Mail className="w-4 h-4 ml-1" />
                      الرد عبر البريد
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}