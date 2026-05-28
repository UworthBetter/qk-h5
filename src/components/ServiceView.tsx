/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Stethoscope, 
  Activity, 
  Check, 
  ShieldAlert, 
  ChevronRight, 
  Calendar, 
  Clock, 
  UserPlus, 
  Grid,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { HealthService, Elder, MessageItem } from '../types';
import { mockServices } from '../mockData';

interface ServiceViewProps {
  selectedElder: Elder;
  elders: Elder[];
  messages: MessageItem[];
  onUpdateMessages: (updated: MessageItem[]) => void;
  onNavigateToMessages: () => void;
}

export default function ServiceView({ 
  selectedElder, 
  elders, 
  messages, 
  onUpdateMessages,
  onNavigateToMessages
}: ServiceViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookingService, setBookingService] = useState<HealthService | null>(null);
  
  // Booking form states
  const [targetElderId, setTargetElderId] = useState<string>(selectedElder.id);
  const [bookingDate, setBookingDate] = useState<string>('2026-06-18');
  const [bookingTime, setBookingTime] = useState<string>('10:00-11:00');
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Dynamic icon selector mapping
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-[#059669]" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-[#ea580c]" />;
      case 'UserCheck':
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Filter services
  const filteredServices = mockServices.filter((srv) => {
    const matchesCategory = activeCategory === '全部' || srv.category === activeCategory;
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenBooking = (srv: HealthService) => {
    setBookingService(srv);
    setTargetElderId(selectedElder.id);
  };

  const handleConfirmBooking = () => {
    if (!bookingService) return;
    
    // Choose selected elder name
    const elderChosen = elders.find(e => e.id === targetElderId) || selectedElder;

    // Build service booked message item
    const newServiceMessage: MessageItem = {
      id: `srv-book-${Date.now()}`,
      sender: '健康服务',
      senderRole: '服务提醒',
      type: 'service',
      tag: '服务提醒',
      title: `${elderChosen.name} - ${bookingService.name} 预约成功`,
      time: '刚刚 08:30',
      content: `服务订单：您已为 ${elderChosen.name} 预约 [${bookingService.name}]。服务时间：${bookingDate} (${bookingTime})。上门派单：主治护理团队及相关医生已完成排班审核，届时请保持电话畅通，如有备忘: "${extraNotes || '无'}"。`,
      status: 'unread',
      statusText: '待查看'
    };

    onUpdateMessages([newServiceMessage, ...messages]);
    setBookingService(null);
    setExtraNotes('');
    setIsSuccessModalOpen(true);
  };

  return (
    <div id="service-view-container" className="flex flex-col gap-3.5 pb-20">
      
      {/* Search Header */}
      <div id="service-search-bar" className="bg-white rounded-xl p-3 shadow-xs border border-[#ecf3f0] flex items-center gap-2.5">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input 
          type="text" 
          placeholder="搜索 医生上门、陪诊、康复理疗..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs text-gray-700 bg-transparent w-full focus:outline-hidden"
        />
      </div>

      {/* Tabs / Categories Filter */}
      <div id="service-category-tabs" className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
        {['全部', '医疗健康', '生活护理', '康复理疗'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors border ${
              activeCategory === cat 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid List */}
      <div id="services-grid" className="grid grid-cols-1 gap-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-400 p-4">
            <p className="text-xs">未搜索到相关养老服务项目</p>
          </div>
        ) : (
          filteredServices.map((srv) => (
            <div 
              key={srv.id} 
              className="bg-white rounded-2xl p-4 border border-[#ecf3f0] flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100/50">
                  {renderServiceIcon(srv.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-gray-800">{srv.name}</h4>
                    <span className="bg-gray-50 text-[8px] text-gray-500 border border-gray-100 px-1.5 py-0.2 rounded-sm">
                      {srv.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-2">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                <span className="text-xs font-bold font-mono text-emerald-600">
                  {srv.price}
                </span>

                <button
                  onClick={() => handleOpenBooking(srv)}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg active:scale-95 transition-transform"
                >
                  立即预约
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Dialog Modal Form */}
      <AnimatePresence>
        {bookingService && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
              onClick={() => setBookingService(null)}
            />
            {/* Slide-up booking layout sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl shadow-xl z-50 overflow-hidden border-t border-gray-100"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3" />
              
              <div className="px-5 pb-8 pt-2">
                <div className="mb-4">
                  <span className="text-[9px] bg-emerald-50 text-[#059669] font-bold px-2 py-0.5 rounded-sm">
                    智慧养老专项派单
                  </span>
                  <h4 className="text-base font-bold text-gray-800 mt-1">{bookingService.name} 预约申请</h4>
                  <p className="text-xs text-gray-400 mt-0.5">请录入长者及时间，平台会在10分钟内匹配专属管家助理。</p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Select Elder Subject */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">1. 选择接受服务长者</label>
                    <div className="grid grid-cols-3 gap-2">
                      {elders.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setTargetElderId(e.id)}
                          className={`text-xs p-2 rounded-xl text-center border font-medium ${
                            targetElderId === e.id
                              ? 'bg-[#ecfdf5] border-[#34d399] text-emerald-800 font-bold'
                              : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                          }`}
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Booking Date choice */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      2. 选择服务日期
                    </label>
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 font-medium text-gray-700 focus:outline-[#34d399]"
                    />
                  </div>

                  {/* Booking Time Selection */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      3. 选择服务时间段
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['09:00-11:00 (上午段)', '14:00-16:00 (下午段)'].map((seg) => {
                        const isChosen = bookingTime.includes(seg.split(' ')[0]);
                        return (
                          <button
                            key={seg}
                            type="button"
                            onClick={() => setBookingTime(seg.split(' ')[0])}
                            className={`text-xs p-2.5 rounded-xl text-center border font-medium ${
                              isChosen
                                ? 'bg-[#ecfdf5] border-[#34d399] text-emerald-800 font-bold'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            {seg}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal notes */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">4. 特殊陪护备注 / 备忘</label>
                    <textarea 
                      placeholder="例如：老人平时使用轮椅，需要护士携带血压表；喜温软饮食等..."
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 h-16 resize-none focus:outline-[#34d399] text-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleConfirmBooking}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors"
                  >
                    确认支付款项并完成排班
                  </button>
                  <button 
                    onClick={() => setBookingService(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Booking SUCCESS Celebration modal overlay */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-4 border border-emerald-50"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-[#059669]">
                  <CheckCircle2 className="w-8 h-8 fill-current text-emerald-600 animate-pulse" />
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-gray-800">医疗护理上门服务已预约</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    智慧管理平台已同步派单！我们的专属护士或全科医生已经开始配班审核。您可以随时转到消息中心查看最新的派单状态以及服务提示。
                  </p>
                </div>

                <div className="flex gap-2.5 w-full mt-2">
                  <button
                    onClick={() => {
                      setIsSuccessModalOpen(false);
                      onNavigateToMessages();
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs"
                  >
                    前往消息台查看
                  </button>
                  <button
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl"
                  >
                    留在此页继续
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
