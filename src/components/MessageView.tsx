/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Trash2,
  ChevronRight,
  Calendar,
  Check
} from 'lucide-react';
import { MessageItem } from '../types';

interface MessageViewProps {
  messages: MessageItem[];
  onUpdateMessages: (updated: MessageItem[]) => void;
}

export default function MessageView({
  messages,
  onUpdateMessages
}: MessageViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'alert' | 'system'>('all');
  const [selectedMsg, setSelectedMsg] = useState<MessageItem | null>(null);

  // Filter messages based on active tab
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'all') return true;
    return msg.type === activeTab;
  });

  // Count unreads for display badges
  const unreadAlertsCount = messages.filter(m => m.type === 'alert' && m.status === 'unread').length;
  const unreadSystemsCount = messages.filter(m => m.type === 'system' && m.status === 'unread').length;

  // Mark single as read
  const handleMarkAsReadAndSelect = (msg: MessageItem) => {
    setSelectedMsg(msg);
    if (msg.status === 'unread') {
      const updated = messages.map((m) => 
        m.id === msg.id ? { ...m, status: m.type === 'alert' ? 'read' as const : 'read' as const, statusText: '已查看' } : m
      );
      onUpdateMessages(updated);
    }
  };

  // Change emergency warning state to Handled
  const handleResolveAlert = (id: string) => {
    const updated = messages.map((m) => 
      m.id === id ? { ...m, status: 'handled' as const, statusText: '已处理' } : m
    );
    onUpdateMessages(updated);
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg({ ...selectedMsg, status: 'handled' as const, statusText: '已处理' });
    }
  };

  // Delete message
  const handleDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = messages.filter((m) => m.id !== id);
    onUpdateMessages(updated);
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg(null);
    }
  };

  return (
    <div id="message-view-container" className="flex flex-col gap-3.5 pb-20">
      {/* Tabs navigation */}
      <div id="message-filters" className="flex bg-white rounded-xl p-1.5 shadow-xs border border-[#ecf3f0] justify-between">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-colors relative ${
            activeTab === 'all' 
              ? 'bg-[#ecfdf5] text-[#059669]' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setActiveTab('alert')}
          className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-colors relative ${
            activeTab === 'alert' 
              ? 'bg-[#ecfdf5] text-[#059669]' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          健康预警
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1 px-1.5 py-0.2 text-[8px] bg-red-500 text-white font-bold rounded-full min-w-[14px]">
              {unreadAlertsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-colors relative ${
            activeTab === 'system' 
              ? 'bg-[#ecfdf5] text-[#059669]' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          系统通知
          {unreadSystemsCount > 0 && (
            <span className="absolute top-1.5 right-1 px-1.5 py-0.2 text-[8px] bg-red-400 text-white font-bold rounded-full min-w-[14px]">
              {unreadSystemsCount}
            </span>
          )}
        </button>
      </div>

      {/* Message Cards List */}
      <div id="message-item-list" className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {filteredMessages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1.5 p-4 text-gray-400"
            >
              <Bell className="w-8 h-8 text-gray-300 stroke-[1.5]" />
              <p className="text-xs">暂无此分类消息记录</p>
            </motion.div>
          ) : (
            filteredMessages.map((msg) => {
              // Styling based on message type/status
              const isAlert = msg.type === 'alert';
              const isUnread = msg.status === 'unread';
              const isHandled = msg.status === 'handled';
              
              // Define sender icons
              let iconTheme = 'bg-red-50 text-red-500';
              let Icon = AlertTriangle;

              if (msg.sender === '护理人员') {
                iconTheme = 'bg-emerald-50 text-emerald-600';
                Icon = CheckCircle2;
              } else if (msg.sender === '平台通知') {
                iconTheme = 'bg-sky-50 text-sky-600';
                Icon = Cpu;
              } else if (msg.sender === '健康服务') {
                iconTheme = 'bg-orange-50 text-orange-500';
                Icon = Calendar;
              }

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleMarkAsReadAndSelect(msg)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative hover:shadow-xs ${
                    isUnread
                      ? isAlert 
                        ? 'border-red-100 bg-red-50/5 ring-1 ring-red-500/5' 
                        : 'border-sky-100 bg-sky-50/5'
                      : 'border-[#ecf3f0]'
                  }`}
                >
                  {/* Unread Active Red Spot Indicator */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}

                  <div className="flex gap-3">
                    {/* Item Icon */}
                    <div className={`p-3 rounded-full w-11 h-11 flex items-center justify-center shrink-0 ${iconTheme}`}>
                      <Icon className="w-5 h-5 fill-none" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-500 font-semibold">{msg.sender}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            isAlert 
                              ? 'bg-red-50 text-red-600' 
                              : msg.senderRole === '服务提醒'
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-sky-50 text-sky-600'
                          }`}>
                            {msg.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{msg.time}</span>
                      </div>

                      <h4 className="text-xs font-bold text-gray-800 mb-1.5 leading-snug line-clamp-1">
                        {msg.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {msg.content}
                      </p>

                      <div className="flex items-center justify-between border-t border-gray-100/60 pt-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isHandled 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : isUnread 
                              ? 'bg-red-50 text-red-700' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isHandled ? '已处理' : isUnread ? '待查看' : '已查看'}
                        </span>

                        <div className="flex items-center gap-3">
                          {isAlert && isUnread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveAlert(msg.id);
                              }}
                              className="text-[10px] text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100 py-1 px-2.5 rounded-md transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              一键消警
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteMessage(msg.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                            title="删除消息"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] text-[#059669] font-medium flex items-center hover:translate-x-0.5 transition-transform">
                            查看详情 <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Slide-up detailed Alert dialog container */}
      <AnimatePresence>
        {selectedMsg && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
              onClick={() => setSelectedMsg(null)}
            />
            {/* Modal Drawer Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl shadow-xl z-50 overflow-hidden border-t border-gray-100"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3" />
              
              <div className="px-5 pb-8 pt-2">
                <div className="flex items-start gap-3.5 mb-5">
                  <div className={`p-3.5 rounded-full ${
                    selectedMsg.type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-sky-600'
                  }`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-800">{selectedMsg.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span>分类: {selectedMsg.sender}</span>
                      <span>•</span>
                      <span>时间: {selectedMsg.time}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {selectedMsg.content}
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">看护联动进度追踪</h5>
                  <div className="space-y-3.5 relative pl-4 before:absolute before:left-1 before:top-1.5 before:bottom-1 before:w-[1px] before:bg-gray-200">
                    <div className="relative">
                      {/* Step Indicator Bullets */}
                      <span className="absolute -left-4.5 top-1 w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-emerald-100" />
                      <p className="text-xs font-bold text-gray-800">1. 手表/雷达数据异常触发</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">健康中心毫秒级判定异常状态，并发起自动预警通报</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-4.5 top-1 w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-emerald-100" />
                      <p className="text-xs font-bold text-gray-800">2. 社区医生与网格员即刻联动</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">就近派单网格员响应并立即进行紧急上门核查区情</p>
                    </div>
                    <div className="relative">
                      <span className={`absolute -left-4.5 top-1 w-2 h-2 rounded-full ${
                        selectedMsg.status === 'handled' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-300 ring-4 ring-gray-100'
                      }`} />
                      <p className={`text-xs font-bold ${selectedMsg.status === 'handled' ? 'text-gray-800' : 'text-gray-400'}`}>
                        3. 状态处置平稳与解除复位
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {selectedMsg.status === 'handled' ? '网格员进行入户核验，长者状态良好且情绪平稳，手动确认解除' : '目前正在等待网格员上门处理反馈...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedMsg.type === 'alert' && selectedMsg.status === 'unread' && (
                    <button 
                      onClick={() => {
                        handleResolveAlert(selectedMsg.id);
                        setSelectedMsg(null);
                      }}
                      className="flex-1 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors"
                    >
                      安全处置/解除警报
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedMsg(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3.5 px-4 rounded-xl transition-colors"
                  >
                    返回列表
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
