/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  MessageSquare,
  HeartHandshake,
  User,
  MoreHorizontal,
  CircleDot,
} from 'lucide-react';

import { Elder, MessageItem } from './types';
import { mockElders as initialElders, mockMessages as initialMessages } from './mockData';

// Subviews
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import MessageView from './components/MessageView';
import ServiceView from './components/ServiceView';
import MineView from './components/MineView';

type TabType = 'home' | 'message' | 'service' | 'mine';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(
    () => localStorage.getItem('qkyd_user') || null
  );
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [elders, setElders] = useState<Elder[]>(initialElders);
  const [selectedElder, setSelectedElder] = useState<Elder>(initialElders[0]);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username: string) => {
    localStorage.setItem('qkyd_user', username);
    setLoggedInUser(username);
  };

  if (!loggedInUser) {
    return (
      <div id="mobile-app" className="h-dvh w-full bg-white">
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  // Update dynamic count of unread messages for badges
  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;

  const handleUpdateMessages = (updated: MessageItem[]) => {
    setMessages(updated);
  };

  const handleSelectElder = (elder: Elder) => {
    setSelectedElder(elder);
  };

  const renderLogo = () => (
    <img src="/logo-qkyd-wide.png" alt="耆康云盾" className="h-9 object-contain shrink-0" />
  );

  return (
    <div id="mobile-app" className="h-dvh w-full bg-white flex flex-col relative">

      {/* App Header */}
      <div id="app-header-navigation" className="bg-[#fcfdfd] border-b border-[#f3f7f4] py-3.5 px-4 flex justify-between items-center relative z-40 shrink-0 select-none safe-area-top">
        {activeTab === 'home' ? (
          <div className="flex items-center gap-2.5">
            {renderLogo()}
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight">耆安云盾</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 font-light">守护长者健康 · 关爱每一天</p>
            </div>
          </div>
        ) : activeTab === 'message' ? (
          <div className="flex items-center gap-2.5">
            {renderLogo()}
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight">消息中心</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 font-light">及时查看健康提醒与平台通知</p>
            </div>
          </div>
        ) : activeTab === 'service' ? (
          <div className="flex items-center gap-2.5">
            {renderLogo()}
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight">健康服务</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 font-light">智连配单，护士理疗送医上门</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            {renderLogo()}
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight">我的健康关怀</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 font-light">安全物联管家，紧急第一站</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 border border-gray-150 bg-white/80 py-1.5 px-3 rounded-full shadow-3xs">
          <MoreHorizontal className="w-4 h-4 text-slate-800 font-semibold cursor-pointer active:scale-90 transition-transform" />
          <div className="w-[1px] h-3 bg-gray-200" />
          <CircleDot className="w-4 h-4 text-slate-800 cursor-pointer active:scale-90 transition-transform" />
        </div>
      </div>

      {/* Main Content */}
      <div id="app-viewport-body" className="flex-1 overflow-y-auto bg-slate-50/60 px-4 py-3.5 select-none relative box-border">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white flex flex-col items-center justify-center z-40 gap-3"
            >
              <div className="relative">
                {renderLogo()}
                <span className="absolute -inset-2 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800 tracking-wide">耆安云盾</p>
                <p className="text-[10.5px] text-gray-400 mt-1 font-light">专注高龄长者，智连生命体征监控网</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="h-full"
            >
              {activeTab === 'home' && (
                <HomeView
                  elders={elders}
                  selectedElder={selectedElder}
                  onSelectElder={handleSelectElder}
                  onNavigateToMessages={() => setActiveTab('message')}
                  onNavigateToServices={() => setActiveTab('service')}
                />
              )}
              {activeTab === 'message' && (
                <MessageView
                  messages={messages}
                  onUpdateMessages={handleUpdateMessages}
                />
              )}
              {activeTab === 'service' && (
                <ServiceView
                  selectedElder={selectedElder}
                  elders={elders}
                  messages={messages}
                  onUpdateMessages={handleUpdateMessages}
                  onNavigateToMessages={() => setActiveTab('message')}
                />
              )}
              {activeTab === 'mine' && (
                <MineView
                  selectedElder={selectedElder}
                  elders={elders}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tab Bar */}
      <div id="app-navigation-bar" className="h-[70px] bg-white border-t border-gray-100 flex items-center justify-around pb-[env(safe-area-inset-bottom)] pt-2.5 px-2 relative z-40 shrink-0 select-none">

        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors relative ${
            activeTab === 'home' ? 'text-[#059669]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium font-sans">首页</span>
        </button>

        <button
          onClick={() => setActiveTab('message')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors relative ${
            activeTab === 'message' ? 'text-[#059669]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5.5 h-5.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 text-[8px] bg-red-500 text-white font-bold rounded-full min-w-[14px] flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium font-sans">消息</span>
        </button>

        <button
          onClick={() => setActiveTab('service')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors relative ${
            activeTab === 'service' ? 'text-[#059669]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <HeartHandshake className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium font-sans">健康服务</span>
        </button>

        <button
          onClick={() => setActiveTab('mine')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors relative ${
            activeTab === 'mine' ? 'text-[#059669]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[10px] font-medium font-sans">我的</span>
        </button>

      </div>

    </div>
  );
}
