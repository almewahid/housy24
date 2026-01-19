import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Plus, ThumbsUp, ThumbsDown, Store, Loader2, X } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function StarRating({ value, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${starSize} ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function StoreReviews({ storeName, supplierId, open, onClose }) {
  const queryClient = useQueryClient();
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    price_rating: 0,
    quality_rating: 0,
    service_rating: 0,
    review_text: '',
    pros: [''],
    cons: ['']
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['storeReviews', storeName, supplierId],
    queryFn: () => {
      if (supplierId) {
        return base44.entities.StoreReview.filter({ supplier_id: supplierId }, '-created_date');
      }
      return base44.entities.StoreReview.filter({ store_name: storeName }, '-created_date');
    },
    enabled: !!(storeName || supplierId)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StoreReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeReviews', storeName, supplierId] });
      setShowAddReview(false);
      setNewReview({
        rating: 0,
        price_rating: 0,
        quality_rating: 0,
        service_rating: 0,
        review_text: '',
        pros: [''],
        cons: ['']
      });
    }
  });

  const handleAddReview = () => {
    if (!newReview.rating) return;
    createMutation.mutate({
      store_name: storeName,
      supplier_id: supplierId,
      rating: newReview.rating,
      price_rating: newReview.price_rating || null,
      quality_rating: newReview.quality_rating || null,
      service_rating: newReview.service_rating || null,
      review_text: newReview.review_text,
      pros: newReview.pros.filter(p => p.trim()),
      cons: newReview.cons.filter(c => c.trim())
    });
  };

  const addProsCons = (type) => {
    setNewReview(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const updateProsCons = (type, index, value) => {
    setNewReview(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  // Calculate averages
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;
  const avgPrice = reviews.filter(r => r.price_rating).length > 0
    ? (reviews.filter(r => r.price_rating).reduce((sum, r) => sum + r.price_rating, 0) / reviews.filter(r => r.price_rating).length).toFixed(1)
    : null;
  const avgQuality = reviews.filter(r => r.quality_rating).length > 0
    ? (reviews.filter(r => r.quality_rating).reduce((sum, r) => sum + r.quality_rating, 0) / reviews.filter(r => r.quality_rating).length).toFixed(1)
    : null;
  const avgService = reviews.filter(r => r.service_rating).length > 0
    ? (reviews.filter(r => r.service_rating).reduce((sum, r) => sum + r.service_rating, 0) / reviews.filter(r => r.service_rating).length).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            تقييمات: {storeName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Overall Rating */}
            {reviews.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-amber-700">{avgRating}</p>
                      <StarRating value={Math.round(avgRating)} size="sm" />
                      <p className="text-sm text-amber-600 mt-1">{reviews.length} تقييم</p>
                    </div>
                    <div className="text-sm space-y-1">
                      {avgPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">الأسعار:</span>
                          <span className="font-medium">{avgPrice}/5</span>
                        </div>
                      )}
                      {avgQuality && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">الجودة:</span>
                          <span className="font-medium">{avgQuality}/5</span>
                        </div>
                      )}
                      {avgService && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">الخدمة:</span>
                          <span className="font-medium">{avgService}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Review Button */}
            <Button onClick={() => setShowAddReview(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              إضافة تقييم
            </Button>

            {/* Add Review Form */}
            {showAddReview && (
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    إضافة تقييم
                    <Button variant="ghost" size="icon" onClick={() => setShowAddReview(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>التقييم العام *</Label>
                    <StarRating value={newReview.rating} onChange={(v) => setNewReview({ ...newReview, rating: v })} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">الأسعار</Label>
                      <StarRating value={newReview.price_rating} onChange={(v) => setNewReview({ ...newReview, price_rating: v })} size="sm" />
                    </div>
                    <div>
                      <Label className="text-xs">الجودة</Label>
                      <StarRating value={newReview.quality_rating} onChange={(v) => setNewReview({ ...newReview, quality_rating: v })} size="sm" />
                    </div>
                    <div>
                      <Label className="text-xs">الخدمة</Label>
                      <StarRating value={newReview.service_rating} onChange={(v) => setNewReview({ ...newReview, service_rating: v })} size="sm" />
                    </div>
                  </div>

                  <div>
                    <Label>التعليق</Label>
                    <Textarea
                      value={newReview.review_text}
                      onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
                      placeholder="شاركنا تجربتك..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        المميزات
                      </Label>
                      {newReview.pros.map((pro, i) => (
                        <input
                          key={i}
                          value={pro}
                          onChange={(e) => updateProsCons('pros', i, e.target.value)}
                          className="w-full p-2 text-sm border rounded mt-1"
                          placeholder="ميزة..."
                        />
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => addProsCons('pros')} className="mt-1">
                        <Plus className="w-3 h-3 ml-1" /> إضافة
                      </Button>
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        العيوب
                      </Label>
                      {newReview.cons.map((con, i) => (
                        <input
                          key={i}
                          value={con}
                          onChange={(e) => updateProsCons('cons', i, e.target.value)}
                          className="w-full p-2 text-sm border rounded mt-1"
                          placeholder="عيب..."
                        />
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => addProsCons('cons')} className="mt-1">
                        <Plus className="w-3 h-3 ml-1" /> إضافة
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddReview} 
                    className="w-full"
                    disabled={!newReview.rating || createMutation.isPending}
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر التقييم'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="bg-slate-50 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-slate-500">
                          {format(new Date(review.created_date), 'dd/MM/yyyy', { locale: ar })}
                        </span>
                      </div>
                      
                      {review.review_text && (
                        <p className="text-sm text-slate-700 mb-3">{review.review_text}</p>
                      )}

                      {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {review.pros?.length > 0 && (
                            <div>
                              {review.pros.map((pro, i) => (
                                <div key={i} className="flex items-center gap-1 text-green-600">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{pro}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {review.cons?.length > 0 && (
                            <div>
                              {review.cons.map((con, i) => (
                                <div key={i} className="flex items-center gap-1 text-red-600">
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>{con}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            )}

            {!isLoading && reviews.length === 0 && !showAddReview && (
              <div className="text-center py-8 text-slate-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد تقييمات بعد</p>
                <p className="text-sm">كن أول من يقيم هذا المتجر</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}