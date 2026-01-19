import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/components/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // ✅ Supabase يتعامل مع الـ hash تلقائياً
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Callback error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (data.session) {
          // ✅ Session موجود - انتقل للصفحة الرئيسية
          console.log('Login successful!', data.session.user.email);
          navigate('/Home', { replace: true });
        } else {
          // لا يوجد session
          console.log('No session found');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Callback error:', error);
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