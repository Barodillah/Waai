import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Simpan token ke localStorage
      localStorage.setItem('waai_auth_token', token);
      
      // Redirect ke halaman utama Chat
      navigate('/');
    } else {
      // Jika tidak ada token (error), kembalikan ke halaman login
      navigate('/auth');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-[#008069] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#54656f] text-sm">Mengautentikasi akun Anda...</p>
    </div>
  );
}
