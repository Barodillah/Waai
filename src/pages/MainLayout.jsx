import { Outlet } from 'react-router-dom';
import { MessageSquare, CircleDashed } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { useChat } from '../context/ChatContext';
import ContactInfo from '../components/ContactInfo';
import MessageSearch from '../components/MessageSearch';
import ProfileFeatureView from '../components/ProfileFeatureView';
import ApiKeyView from '../components/ApiKeyView';
import NewPersonaView from '../components/NewPersonaView';

export default function MainLayout() {
  const { toastMessage, activeSessionId, showContactInfo, showSearchInfo, sessions, activeMobileTab, setActiveMobileTab, activeProfileFeature } = useChat();

  return (
    <div className="w-full h-[100dvh] flex flex-col font-sans overflow-hidden select-none bg-[#f0f2f5] text-[#111b21]">
      {toastMessage && <Toast message={toastMessage} />}

      <div className="flex-1 flex overflow-hidden w-full h-full relative">
        {/* Desktop Thin Nav */}
        <div className="hidden md:flex flex-col items-center py-4 w-[60px] bg-[#f0f2f5] border-r border-[#e9edef] shrink-0 z-20">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setActiveMobileTab('chats')}
              className={`relative w-12 h-8 flex items-center justify-center rounded-full transition-colors ${activeMobileTab === 'chats' ? 'bg-[#dcf8c6] text-[#008069]' : 'text-[#54656f] hover:bg-gray-200'}`}
            >
              <MessageSquare size={22} className={activeMobileTab === 'chats' ? 'fill-current' : ''} />
              {sessions.length > 0 && (
                <span className="absolute -top-1 right-0 bg-[#ea0038] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                  {sessions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveMobileTab('status')}
              className={`w-12 h-8 flex items-center justify-center rounded-full transition-colors ${activeMobileTab === 'status' ? 'bg-[#dcf8c6] text-[#008069]' : 'text-[#54656f] hover:bg-gray-200'}`}
            >
              <CircleDashed size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <button
              onClick={() => setActiveMobileTab('profile')}
              className={`w-12 h-8 flex items-center justify-center rounded-full transition-colors ${activeMobileTab === 'profile' ? 'bg-[#dcf8c6]' : 'hover:bg-gray-200'}`}
            >
              <img src="https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg" alt="Anda" className="w-6 h-6 rounded-full object-cover" />
            </button>
          </div>
        </div>

        <Sidebar />

        {/* Panel Kanan (Profile Feature View, Outlet merender EmptyChat atau ActiveChat) */}
        <div
          className={`flex-1 h-full flex flex-col relative bg-[#efeae2] ${
            ((activeSessionId && activeMobileTab === 'chats') || activeProfileFeature === 'new_persona') 
              ? 'flex w-full' 
              : 'hidden md:flex'
          }`}
        >
          {activeProfileFeature === 'new_persona' ? (
            <div className="w-full h-full">
              <NewPersonaView />
            </div>
          ) : activeMobileTab === 'profile' ? (
            <div className="w-full h-full">
               {activeProfileFeature === 'apikey' ? (
                 <ApiKeyView isMobile={false} />
               ) : (
                 <ProfileFeatureView />
               )}
            </div>
          ) : (
            <Outlet />
          )}
        </div>

        {/* Panel Info Kontak */}
        {showContactInfo && activeSessionId && (
          <ContactInfo />
        )}

        {/* Panel Search Pesan */}
        {showSearchInfo && activeSessionId && (
          <MessageSearch />
        )}
      </div>
    </div>
  );
}
