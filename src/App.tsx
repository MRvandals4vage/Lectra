import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import MeetingRoom from './MeetingRoom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';

type Screen = 'landing' | 'dashboard' | 'meeting';

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const handleStartMeeting = (roomId: string) => {
    setSelectedRoomId(roomId);
    setScreen('meeting');
  };

  useEffect(() => {
    if (user && screen === 'landing') {
      setScreen('dashboard');
    } else if (!user && screen !== 'landing') {
      setScreen('landing');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 selection:bg-primary/30">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onGetStarted={() => setIsAuthModalOpen(true)} />
          </motion.div>
        )}
        {screen === 'dashboard' && user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard onStartClass={handleStartMeeting} />
          </motion.div>
        )}
        {screen === 'meeting' && user && (
          <motion.div
            key="meeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MeetingRoom roomId={selectedRoomId} onLeave={() => setScreen('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => setScreen('dashboard')}
      />
    </div>
  );
}
