/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Settings, 
  PhoneCall, 
  HeartHandshake, 
  AlertOctagon, 
  ChevronRight, 
  Users, 
  Smartphone,
  Shield,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { Elder } from '../types';

interface MineViewProps {
  selectedElder: Elder;
  elders: Elder[];
}

export default function MineView({ selectedElder, elders }: MineViewProps) {
  const [sosStatus, setSosStatus] = useState<boolean>(true);
  const [activeTab, setActiveTab ] = useState<string>('config');

  // Contact list state
  const [contacts, setContacts] = useState([
    { name: '李阿姨 (社区专属网格护理专员)', phone: '138-xxxx-4592', main: true },
    { name: '王医生 (全科定点门诊医生)', phone: '139-xxxx-0812', main: true },
    { name: '李静雅 (大女儿 - 紧急第一联系人)', phone: '135-xxxx-9823', main: false },
  ]);

  return (
    <div id="mine-view-container" className="flex flex-col gap-3.5 pb-20">
      
      {/* Profile Card Header */}
      <div id="user-profile-header" className="bg-gradient-to-br from-[#059669] to-emerald-700 rounded-2xl p-4 shadow-sm text-white relative overflow-hidden">
        <div className="absolute right-0 -bottom-6 w-32 h-32 rounded-full bg-white/5" />
        
        <div className="flex gap-3.5 items-center relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold">
            李
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold">李静雅</h4>
              <span className="bg-white/20 text-white text-[8px] font-semibold px-2 py-0.5 rounded-full">
                对口家属
              </span>
            </div>
            <p className="text-[10px] text-emerald-100 mt-1">
              家庭守护组编号: GQ-2026-0568
            </p>
          </div>
        </div>
      </div>

      {/* Monitored Elders Management list */}
      <div id="managed-elders-group" className="bg-white rounded-2xl p-4 shadow-2xs border border-[#ecf3f0]">
        <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-600" />
          我加入的守护长者组 ({elders.length})
        </h4>

        <div className="space-y-2">
          {elders.map((el) => (
            <div key={el.id} className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100/50">
              <div className="flex items-center gap-2.5">
                <img 
                  src={el.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover border border-[#059669]/10"
                />
                <div>
                  <p className="text-xs font-bold text-gray-700">{el.name}</p>
                  <p className="text-[9px] text-gray-400">{el.room}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-[#059669] font-semibold">健康智联中</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Quick Emergency Contacts */}
      <div id="sos-contacts" className="bg-white rounded-2xl p-4 shadow-2xs border border-[#ecf3f0]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            一键 SOS 紧急派单联动
          </h4>
          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
            自启动守护中
          </span>
        </div>

        <div className="space-y-2">
          {contacts.map((ct, idx) => (
            <div key={idx} className="bg-gray-50/50 border border-gray-100 p-2.5 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-700">{ct.name}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">派送电话: {ct.phone}</p>
              </div>
              <button 
                onClick={() => alert(`[智能安全触发] 正在模拟拨打紧急服务专线给: ${ct.name} (${ct.phone})`)}
                className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold py-1.5 px-3 rounded-lg shadow-2xs cursor-pointer active:scale-95 transition-all text-center"
              >
                拨号
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Server Info */}
      <div id="cloud-info-card" className="bg-[#f0fdf4] border border-[#d1fae5] rounded-xl p-3.5 flex gap-2.5">
        <Shield className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold text-emerald-900">耆安居·社区康养守护终端</h5>
          <p className="text-[10px] text-emerald-800 leading-relaxed mt-1 font-light">
            本客户端与社区健康守护 IoT 设备直连，智能穿戴（手环/血压计/血糖仪/监测贴）所有脱敏体征指标经安全网关进行加密汇聚与分析，为您守护长者居家健康安全。
          </p>
        </div>
      </div>

    </div>
  );
}
