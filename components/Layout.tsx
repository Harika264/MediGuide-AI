import React from 'react';
import { Activity, ShieldCheck, Menu, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onHomeClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onHomeClick}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-900">MediGuide AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={onHomeClick} className="hover:text-blue-600 transition-colors">Home</button>
            <button className="hover:text-blue-600 transition-colors">History</button>
            <button className="hover:text-blue-600 transition-colors">Education</button>
          </nav>

          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-slate-100 rounded-full md:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-xs">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-200 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">Private & Secure</span>
          </div>
          <p>
            MediGuide AI is an informational tool and does not provide medical diagnosis. 
            Always consult a qualified healthcare professional for medical advice.
          </p>
          <p>&copy; {new Date().getFullYear()} MediGuide AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};