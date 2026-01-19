import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/components/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // معالجة الـ token من الـ URL
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // الانتقال للصفحة الرئيسية
        navigate('/', { replace: true });
      } else {
        // في حالة الخطأ
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}