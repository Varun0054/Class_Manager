'use client';

import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import Lottery from '../components/Lottery';
import Leaderboard from '../components/Leaderboard';
import Teams from '../components/Teams';
import Database from '../components/Database';
import Analytics from '../components/Analytics';
import History from '../components/History';
import Settings from '../components/Settings';
import AuthPlaceholder from '../components/AuthPlaceholder';
import TeacherDashboard from '../components/TeacherDashboard';
import { Loader2 } from 'lucide-react';
import { client } from '../lib/appwrite';

export default function Home() {
  const { appView, activeTab, setAppView, setTeacherUser, hydrateFromCloud, processSyncQueue } = useStore();

  // Appwrite Backend Setup Verification
  useEffect(() => {
    client.ping().then(() => {
      console.log('Appwrite connection successfully verified (pinged).');
    }).catch((err) => {
      console.error('Failed to verify Appwrite connection:', err);
    });
  }, []);

  // Sync Queue Background Loop
  useEffect(() => {
    // Run the sync queue every 30 seconds
    const interval = setInterval(() => {
      processSyncQueue();
    }, 30000);

    // Also try syncing immediately if network comes back online
    const handleOnline = () => processSyncQueue();
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [processSyncQueue]);

  // Real initial auth check (hydration)
  useEffect(() => {
    if (appView === 'loading') {
      const checkAuth = async () => {
        const storedTeacher = localStorage.getItem('classArenaTeacher');
        if (storedTeacher) {
          try {
            const user = JSON.parse(storedTeacher);
            
            // Verify with Appwrite that we actually have a valid active session
            const { account } = await import('../lib/appwrite');
            const currentUser = await account.get();
            
            if (currentUser.$id !== user.id) {
               throw new Error('Local user ID does not match active Appwrite session');
            }

            setTeacherUser(user);
            setAppView('teacher-dashboard');
            // Hydrate data from cloud in the background
            hydrateFromCloud();
          } catch (e) {
            console.error('Auth verification failed, forcing re-login', e);
            localStorage.removeItem('classArenaTeacher'); // Clear fake UUIDs
            setAppView('auth');
          }
        } else {
          setAppView('auth');
        }
      };
      
      checkAuth();
    }
  }, [appView, setAppView, setTeacherUser, hydrateFromCloud]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'lottery':
        return <Lottery />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'teams':
        return <Teams />;
      case 'database':
        return <Database />;
      case 'analytics':
        return <Analytics />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (appView === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (appView === 'auth') {
    return <AuthPlaceholder />;
  }

  if (appView === 'teacher-dashboard') {
    return <TeacherDashboard />;
  }

  return (
    <div className="relative min-h-screen pb-24 pt-32 px-4 md:px-8 max-w-7xl mx-auto z-10">
      
      {/* Floating Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Blob 1 */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-300/30 rounded-full blur-[90px] animate-blob-1" />
        {/* Blob 2 */}
        <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-purple-300/30 rounded-full blur-[110px] animate-blob-2" />
        {/* Blob 3 */}
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-pink-300/25 rounded-full blur-[100px] animate-blob-3" />
        {/* Blob 4 (Cyan) */}
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-cyan-300/20 rounded-full blur-[80px] animate-blob-1" />
      </div>

      {/* Floating Navbar */}
      <Navbar />

      {/* Main Content Router Stage */}
      <main className="w-full mt-4">
        {renderActiveComponent()}
      </main>

    </div>
  );
}
