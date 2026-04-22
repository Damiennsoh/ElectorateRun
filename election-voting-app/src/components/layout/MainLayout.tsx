import React from 'react';
import { Header } from './Header';
import { FiHelpCircle } from 'react-icons/fi';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  status?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Header />
      
      <main>
        {children}
      </main>

      {/* Help Button */}
      <button className="fixed bottom-6 right-6 bg-[#FF6600] hover:bg-orange-600 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-colors z-50">
        <FiHelpCircle className="w-5 h-5" />
        <span className="font-medium">Help</span>
      </button>
    </div>
  );
};
