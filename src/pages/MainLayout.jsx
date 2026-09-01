import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { useChat } from '../context/ChatContext';

export default function MainLayout() {
  const { toastMessage, activeSessionId } = useChat();

  return (
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden select-none bg-[#f0f2f5] text-[#111b21]">
      {toastMessage && <Toast message={toastMessage} />}

      <div className="flex-1 flex overflow-hidden w-full h-full relative">
        <Sidebar />
        
        {/* Panel Kanan (Outlet merender EmptyChat atau ActiveChat) */}
        <div
          className={`flex-1 h-full flex flex-col relative bg-[#efeae2] ${
            activeSessionId ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
