/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Droplets, 
  Thermometer, 
  Footprints, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  TrendingUp, 
  Smartphone,
  Shield,
  FileText,
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react';
import { Elder, HealthMetric } from '../types';

interface HomeViewProps {
  elders: Elder[];
  selectedElder: Elder;
  onSelectElder: (elder: Elder) => void;
  onNavigateToMessages: () => void;
  onNavigateToServices: () => void;
}

export default function HomeView({
  elders,
  selectedElder,
  onSelectElder,
  onNavigateToMessages,
  onNavigateToServices
}: HomeViewProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMetricKey, setActiveMetricKey] = useState<keyof Elder['metrics']>('heartRate');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(selectedElder.aiAnalysis);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const now = new Date();
  const dataTimeStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Sync AI analysis when elder changes
  useEffect(() => {
    setAiAnalysis(selectedElder.aiAnalysis);
  }, [selectedElder]);

  const loadingPhrases = [
    '正在连线智能云盾健康顾问...',
    '正在多维检索近7日体征趋势波动...',
    '正在调用医学知识大语言模型...',
    '智能生成精细化医疗日常监护建议...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // Request real server-side Gemini API
  const handleAiInterpret = async () => {
    setIsAiLoading(true);
    setLoadingPhraseIndex(0);
    try {
      const response = await fetch('/api/gemini/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedElder.name,
          role: selectedElder.role,
          room: selectedElder.room,
          heartRate: selectedElder.metrics.heartRate.current,
          oxygen: selectedElder.metrics.oxygen.current,
          temp: selectedElder.metrics.temp.current,
          steps: selectedElder.metrics.steps.current
        }),
      });
      const data = await response.json();
      if (data.success && data.text) {
        setAiAnalysis(data.text);
      } else {
        setAiAnalysis('智能云端响应超时。当前分析：长者生命体征平稳，若心率体温有高频振荡，请提醒当值护理。');
      }
    } catch (error) {
      console.error('Error interpretation:', error);
      setAiAnalysis('连接AI模块异常，请检查配置。建议：维持室温在24°C，长者应适当散步。');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getMetricIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart className={`w-6 h-6 ${colorClass}`} />;
      case 'droplet':
        return <Droplets className={`w-6 h-6 ${colorClass}`} />;
      case 'thermometer':
        return <Thermometer className={`w-6 h-6 ${colorClass}`} />;
      case 'footprints':
        return <Footprints className={`w-6 h-6 ${colorClass}`} />;
      default:
        return <Heart className={`w-6 h-6 ${colorClass}`} />;
    }
  };

  // Dynamic Helper for Health Rating and Gauge breakdown
  const getHealthScoreDetails = (elder: Elder) => {
    if (elder.id === 'zhang') {
      return {
        score: 96,
        status: '体征极优',
        colorClass: 'text-emerald-600',
        strokeColor: '#10b981',
        comment: '张爷爷今天生理机能指标极其平稳。心率舒缓，血氧维持在 97% 的黄金档，温和行走步数稳定，心肺代偿平稳。'
      };
    } else if (elder.id === 'li') {
      return {
        score: 98,
        status: '机能卓越',
        colorClass: 'text-emerald-600',
        strokeColor: '#10b981',
        comment: '李奶奶各项生命机能评分极高，体温微凉恒融，静息心率极有动力，双腿部肌肉泵力在运动后呈良性平稳。'
      };
    } else {
      return {
        score: 58,
        status: '高度预警',
        colorClass: 'text-rose-600',
        strokeColor: '#f43f5e',
        comment: '提示：王爷爷今日处于异常预警态（体征波幅超过±15%）。心率偏快且有低烧，血氧处于边缘态，需立即核验体温。'
      };
    }
  };

  // Micro sparkline generator for individual card view grids
  const renderSparkline = (key: keyof Elder['metrics'], color: string) => {
    const trend = selectedElder.hasTrends[key];
    if (!trend || trend.length === 0) return null;
    const vals = trend.map(d => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const valRange = max - min || 1;
    const h = 24;
    const w = 70;
    const paddingX = 4;
    const points = trend.map((d, index) => {
      const x = paddingX + (index / (trend.length - 1)) * (w - paddingX * 2);
      const ratio = (d.value - min) / valRange;
      const y = h - 3 - ratio * (h - 6);
      return { x, y };
    });

    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    const sparkGradId = `spark-grad-${key}`;
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`
      : '';

    return (
      <div className="w-[70px] h-[24px] self-end opacity-90">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={sparkGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {areaD && <path d={areaD} fill={`url(#${sparkGradId})`} />}
          {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
          {points.length > 0 && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
          )}
        </svg>
      </div>
    );
  };

  // Render SVG Graph precisely looking like reference with dynamic reference corridor
  const renderInteractiveChart = () => {
    const trendData = selectedElder.hasTrends[activeMetricKey];
    if (!trendData || trendData.length === 0) return null;

    const values = trendData.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    const valRange = maxVal - minVal || 1;

    // Expand boundaries slightly for nice visual padding (at least 20% on each side)
    const chartMin = minVal - valRange * 0.22;
    const chartMax = maxVal + valRange * 0.22;
    const overallRange = chartMax - chartMin;

    const width = 330;
    const height = 135;
    const paddingLeftRight = 25;
    const paddingTopBottom = 22;

    const points = trendData.map((d, index) => {
      const x = paddingLeftRight + (index / (trendData.length - 1)) * (width - paddingLeftRight * 2);
      const ratio = (d.value - chartMin) / overallRange;
      const y = height - paddingTopBottom - ratio * (height - paddingTopBottom * 2);
      return { x, y, value: d.value, date: d.date };
    });

    // Helper to map values directly to y status axis
    const getYForValue = (val: number) => {
      const ratio = (val - chartMin) / overallRange;
      const y = height - paddingTopBottom - ratio * (height - paddingTopBottom * 2);
      return Math.max(paddingTopBottom / 2, Math.min(height - paddingTopBottom / 2, y));
    };

    // Make elegant cubic bezier path
    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - 18} L ${points[0].x} ${height - 18} Z`
      : '';

    // Get color themes based on key
    let strokeColor = '#059669'; // Emerald
    let gradientStart = '#34d399';
    let gradientId = 'grad-heart';
    let unit = '次/分';

    // Normal safe guidelines per metric
    let normalMin = 60;
    let normalMax = 100;
    let corridorColor = 'rgba(16, 185, 129, 0.04)';
    let corridorBorderColor = 'rgba(16, 185, 129, 0.15)';
    let labelText = '正常硬标准范围: 60-100 次/分';

    if (activeMetricKey === 'oxygen') {
      strokeColor = '#0284c7'; // Sky
      gradientStart = '#7dd3fc';
      gradientId = 'grad-oxy';
      unit = '%';
      normalMin = 95;
      normalMax = 100;
      corridorColor = 'rgba(2, 132, 199, 0.04)';
      corridorBorderColor = 'rgba(2, 132, 199, 0.15)';
      labelText = '标准血氧上限: 95%-100%';
    } else if (activeMetricKey === 'temp') {
      strokeColor = '#ea580c'; // Orange
      gradientStart = '#fdba74';
      gradientId = 'grad-temp';
      unit = '°C';
      normalMin = 36.0;
      normalMax = 37.3;
      corridorColor = 'rgba(234, 88, 12, 0.03)';
      corridorBorderColor = 'rgba(234, 88, 12, 0.15)';
      labelText = '黄金核心体温: 36.0°C-37.3°C';
    } else if (activeMetricKey === 'steps') {
      strokeColor = '#4f46e5'; // Indigo
      gradientStart = '#a5b4fc';
      gradientId = 'grad-steps';
      unit = '步';
      normalMin = 3000;
      normalMax = 8000;
      corridorColor = 'rgba(79, 70, 229, 0.03)';
      corridorBorderColor = 'rgba(79, 70, 229, 0.15)';
      labelText = '推荐日常训练: 3000-8000 步';
    }

    const safeMinY = getYForValue(normalMin);
    const safeMaxY = getYForValue(normalMax);
    const rectTopY = Math.min(safeMinY, safeMaxY);
    const rectBottomY = Math.max(safeMinY, safeMaxY);
    const rectHeight = Math.max(4, rectBottomY - rectTopY);

    // Formulate a clean judgment for health index stability
    const getStabilityLabel = () => {
      const range = maxVal - minVal;
      if (activeMetricKey === 'heartRate') {
        return range > 14 
          ? { text: '脉率变动大', color: 'text-orange-600 bg-orange-50' }
          : { text: '静息稳态优', color: 'text-emerald-600 bg-[#eefbf6]' };
      }
      if (activeMetricKey === 'oxygen') {
        return range > 2 
          ? { text: '曾发低血氧', color: 'text-rose-600 bg-rose-50' }
          : { text: '富氧均配好', color: 'text-emerald-600 bg-[#eefbf6]' };
      }
      if (activeMetricKey === 'temp') {
        return range > 0.5
          ? { text: '日内有发热', color: 'text-orange-600 bg-orange-50' }
          : { text: '恒温守护中', color: 'text-emerald-600 bg-[#eefbf6]' };
      }
      return range > 3000 
        ? { text: '日行充沛', color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' }
        : { text: '常规活动量', color: 'text-gray-500 bg-gray-50' };
    };

    const stability = getStabilityLabel();

    return (
      <div id="health-chart-wrapper" className="bg-white rounded-2xl p-4 shadow-xs border border-[#ecf3f0] flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            连续健康波幅分析 (近7天)
          </h4>
          <div className="relative">
            <select
              value={activeMetricKey}
              onChange={(e) => setActiveMetricKey(e.target.value as keyof Elder['metrics'])}
              className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg focus:outline-hidden font-medium"
            >
              <option value="heartRate">脉搏心率 趋势</option>
              <option value="oxygen">血氧脉通 趋势</option>
              <option value="temp">额温内核 趋势</option>
              <option value="steps">日常步速 趋势</option>
            </select>
          </div>
        </div>

        {/* The Graphic Stage Container */}
        <div className="relative h-[135px] w-full flex justify-center items-center pb-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientStart} stopOpacity="0.25" />
                <stop offset="100%" stopColor={gradientStart} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Standard Normal reference safety corridor band behind curves */}
            <rect 
              x={paddingLeftRight} 
              y={rectTopY} 
              width={width - paddingLeftRight * 2} 
              height={rectHeight} 
              fill={corridorColor} 
              stroke={corridorBorderColor}
              strokeWidth="0.8"
              strokeDasharray="2,2"
              rx="4"
            />

            {/* Transparent Corridor Annotation text */}
            <text 
              x={paddingLeftRight + 6} 
              y={rectTopY + 11} 
              fontSize="7.5" 
              fontWeight="bold"
              className="fill-gray-400 opacity-80 uppercase tracking-wider select-none"
            >
              {labelText}
            </text>

            {/* Horizontal Helper grid lines */}
            <line x1="20" y1={height - paddingTopBottom} x2={width - 20} y2={height - paddingTopBottom} stroke="#f3f4f6" strokeWidth="1" />
            <line x1="20" y1={height / 2} x2={width - 20} y2={height / 2} stroke="#f9fafb" strokeWidth="0.5" />
            <line x1="20" y1={paddingTopBottom} x2={width - 20} y2={paddingTopBottom} stroke="#f9fafb" strokeWidth="0.5" />

            {/* Area under curve */}
            {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

            {/* Curved graph line */}
            {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />}

            {/* Points, values and label decoration */}
            {points.map((pt, i) => {
              const isLast = i === points.length - 1;
              const isMax = pt.value === maxVal;
              const isMin = pt.value === minVal;
              const showMaxFlag = isMax && maxVal !== minVal;
              const showMinFlag = isMin && maxVal !== minVal && !isMax;

              return (
                <g key={i}>
                  {/* Vertical dotted helper linking grid for node endpoints */}
                  {isLast && (
                    <line 
                      x1={pt.x} 
                      y1={pt.y} 
                      x2={pt.x} 
                      y2={height - paddingTopBottom} 
                      stroke={strokeColor} 
                      strokeDasharray="2,2" 
                      strokeWidth="1"
                    />
                  )}

                  {/* Pulsing Vertex highlights for Peak extrema */}
                  {showMaxFlag && (
                    <g>
                      <circle cx={pt.x} cy={pt.y} r="6.5" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,1.5" className="animate-pulse" />
                      <g transform={`translate(${pt.x}, ${pt.y - 12})`}>
                        <rect x="-18" y="-9" width="36" height="10" rx="3" fill={strokeColor} className="opacity-95" />
                        <text textAnchor="middle" y="-2" fontSize="7" fontWeight="bold" fill="white">
                          MAX {pt.value}
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Valley extrema callout bubbles */}
                  {showMinFlag && (
                    <g>
                      <circle cx={pt.x} cy={pt.y} r="6.5" fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,1.5" className="animate-pulse" />
                      <g transform={`translate(${pt.x}, ${pt.y + 15})`}>
                        <rect x="-18" y="-3" width="36" height="10" rx="3" fill="#6b7280" className="opacity-95" />
                        <text textAnchor="middle" y="4" fontSize="7" fontWeight="bold" fill="white">
                          MIN {pt.value}
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Center Node Dot */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={isLast ? "5" : "3.5"} 
                    fill="white" 
                    stroke={strokeColor} 
                    strokeWidth={isLast ? "3" : "2"} 
                  />

                  {/* Standard Node value when not extreme to avoid text overlaps */}
                  {!showMaxFlag && !showMinFlag && (
                    <text 
                      x={pt.x} 
                      y={pt.y - 8} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fontWeight={isLast ? "bold" : "500"}
                      fill={isLast ? "#111827" : "#4b5563"}
                    >
                      {pt.value}
                    </text>
                  )}

                  {/* Date coordinate labels */}
                  <text 
                    x={pt.x} 
                    y={height - 2} 
                    textAnchor="middle" 
                    fontSize="9.5" 
                    fontWeight="500"
                    fill="#9ca3af"
                  >
                    {pt.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Highlight badges */}
          <div className="absolute right-1 top-[5px] bg-[#059669] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <span className="h-1 w-1 bg-white rounded-full animate-ping" />
            连续采信
          </div>
        </div>

        {/* Trend Insights summary boxes section */}
        <div id="trend-statistics-insight" className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-gray-100 text-center select-none bg-[#fdfefd] p-2 rounded-xl">
          <div className="flex flex-col items-center border-r border-gray-100">
            <span className="text-[9px] text-gray-400 font-medium">期以内均值</span>
            <span className="text-xs font-extrabold text-gray-700 mt-0.5">
              {avgVal} <span className="text-[9px] text-gray-400 font-normal">{unit}</span>
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-100">
            <span className="text-[9px] text-gray-400 font-medium">脉冲式波动差</span>
            <span className="text-xs font-extrabold text-gray-700 mt-0.5">
              ±{valRange} <span className="text-[9px] text-gray-400 font-normal">{unit}</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-400 font-medium">日照动态平稳度</span>
            <span className={`text-[9.5px] font-extrabold leading-tight self-center mt-0.5 px-2 py-0.2 rounded-md ${stability.color}`}>
              {stability.text}
            </span>
          </div>
        </div>

        {/* Alert/Assurance bar at the bottom */}
        <div className="flex items-center gap-1.5 bg-[#ecfdf5] border border-[#d1fae5] py-2 px-3 rounded-xl text-[10px] text-emerald-800 leading-normal">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          系统秒级多维比对安全线：若出现异动脉冲，急救报警系统将自动触发护理台蜂鸣。
        </div>
      </div>
    );
  };

  return (
    <div id="home-view-container" className="flex flex-col gap-3.5 pb-20">
      {/* Dropdown toggle for current elder subject */}
      <div id="elder-selector-block" className="bg-white rounded-xl py-2.5 px-4 flex justify-between items-center shadow-xs border border-[#ebf1ee] relative">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-500">当前查看对象</span>
          <span className="text-sm font-semibold text-gray-800">{selectedElder.name}</span>
        </div>
        
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1 text-xs text-[#059669] font-medium py-1 px-2.5 rounded-lg active:bg-gray-50 transition-colors"
        >
          切换对象
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setDropdownOpen(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-12 right-4 bg-white border border-gray-100 shadow-xl rounded-xl p-1 w-36 z-50 overflow-hidden"
              >
                {elders.map((elder) => (
                  <button
                    key={elder.id}
                    onClick={() => {
                      onSelectElder(elder);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      selectedElder.id === elder.id ? 'bg-[#ecfdf5] text-emerald-800 font-semibold' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {elder.name}
                    {selectedElder.id === elder.id && (
                      <span className="w-1.5 h-1.5 bg-[#059669] rounded-full inline-block" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Elder profile card */}
      <div id="elder-profile-card" className="bg-white rounded-2xl p-4 shadow-sm border border-[#ecf3f0] relative">
        <div className="flex gap-3.5 items-center">
          <div className="relative">
            <img 
              src={selectedElder.avatar} 
              alt={selectedElder.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/10 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              在册
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-base font-bold text-gray-800">{selectedElder.name}</h3>
              <span className="bg-[#ecfdf5] text-[#059669] text-[9px] font-medium px-1.5 py-0.5 rounded-sm">
                {selectedElder.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">
              社区住址：<span className="text-gray-700 font-medium">{selectedElder.room.replace('房间号：', '')}</span>
            </p>
            <p className="text-xs text-gray-500">
              建档日期：<span className="text-gray-700 font-medium">{selectedElder.checkInDate}</span>
            </p>
          </div>

          <button 
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap bg-emerald-50 py-1.5 px-2.5 rounded-lg active:bg-emerald-100 transition-colors shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            查看档案 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric metrics cards upgraded with micro sparklines */}
      <div id="metrics-grid" className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            本日多维体征监控
          </h4>
          <span className="text-[10px] text-gray-400 font-medium">数据时间：{dataTimeStr} (每隔10分自动校准)</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: 心率 */}
          <div 
            onClick={() => setActiveMetricKey('heartRate')}
            className={`cursor-pointer bg-white rounded-2xl p-3 border transition-all relative flex flex-col justify-between ${
              activeMetricKey === 'heartRate' ? 'border-[#34d399] shadow-md ring-2 ring-emerald-500/5' : 'border-[#ecf3f0] hover:border-gray-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">心率</span>
                <div className={`p-1.5 rounded-full ${
                  selectedElder.metrics.heartRate.status === 'normal' ? 'bg-[#ecfdf5] text-emerald-600' : 'bg-orange-50 text-orange-500'
                }`}>
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-1 min-h-[32px]">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-gray-800">
                    {selectedElder.metrics.heartRate.current}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">次/分</span>
                </div>
                {renderSparkline('heartRate', selectedElder.metrics.heartRate.status === 'normal' ? '#10b981' : '#f97316')}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedElder.metrics.heartRate.status === 'normal' ? 'bg-[#ecfdf5] text-emerald-700' : 'bg-orange-100 text-orange-800'
              }`}>
                {selectedElder.metrics.heartRate.statusText}
              </span>
              <span className="text-[8.5px] text-gray-400 scale-95 origin-right">{selectedElder.metrics.heartRate.rangeText}</span>
            </div>
          </div>

          {/* Card 2: 血氧饱和度 */}
          <div 
            onClick={() => setActiveMetricKey('oxygen')}
            className={`cursor-pointer bg-white rounded-2xl p-3 border transition-all relative flex flex-col justify-between ${
              activeMetricKey === 'oxygen' ? 'border-[#34d399] shadow-md ring-2 ring-emerald-500/5' : 'border-[#ecf3f0] hover:border-gray-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">血氧饱和度</span>
                <div className={`p-1.5 rounded-full ${
                  selectedElder.metrics.oxygen.status === 'normal' ? 'bg-[#f0f9ff] text-sky-600' : 'bg-rose-50 text-rose-500'
                }`}>
                  <Droplets className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-1 min-h-[32px]">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-gray-800">
                    {selectedElder.metrics.oxygen.current}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">%</span>
                </div>
                {renderSparkline('oxygen', selectedElder.metrics.oxygen.status === 'normal' ? '#0284c7' : '#f43f5e')}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedElder.metrics.oxygen.status === 'normal' 
                  ? 'bg-[#ecfdf5] text-[#059669]' 
                  : selectedElder.metrics.oxygen.status === 'warning'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-rose-50 text-rose-700'
              }`}>
                {selectedElder.metrics.oxygen.statusText}
              </span>
              <span className="text-[8.5px] text-gray-400 scale-95 origin-right">{selectedElder.metrics.oxygen.rangeText}</span>
            </div>
          </div>

          {/* Card 3: 体温 */}
          <div 
            onClick={() => setActiveMetricKey('temp')}
            className={`cursor-pointer bg-white rounded-2xl p-3 border transition-all relative flex flex-col justify-between ${
              activeMetricKey === 'temp' ? 'border-[#34d399] shadow-md ring-2 ring-emerald-500/5' : 'border-[#ecf3f0] hover:border-gray-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">体温</span>
                <div className={`p-1.5 rounded-full ${
                  selectedElder.metrics.temp.status === 'normal' ? 'bg-[#fef3c7] text-[#ea580c]' : 'bg-orange-50 text-orange-500'
                }`}>
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-1 min-h-[32px]">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-gray-800">
                    {selectedElder.metrics.temp.current}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">°C</span>
                </div>
                {renderSparkline('temp', selectedElder.metrics.temp.status === 'normal' ? '#ea580c' : '#f97316')}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedElder.metrics.temp.status === 'normal' ? 'bg-[#ecfdf5] text-emerald-700' : 'bg-orange-100 text-orange-800'
              }`}>
                {selectedElder.metrics.temp.statusText}
              </span>
              <span className="text-[8.5px] text-gray-400 scale-95 origin-right">{selectedElder.metrics.temp.rangeText}</span>
            </div>
          </div>

          {/* Card 4: 步数 */}
          <div 
            onClick={() => setActiveMetricKey('steps')}
            className={`cursor-pointer bg-white rounded-2xl p-3 border transition-all relative flex flex-col justify-between ${
              activeMetricKey === 'steps' ? 'border-[#34d399] shadow-md ring-2 ring-emerald-500/5' : 'border-[#ecf3f0] hover:border-gray-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">步数</span>
                <div className="p-1.5 rounded-full bg-[#eceefc] text-indigo-600">
                  <Footprints className="w-3.5 h-3.5" />
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-1 min-h-[32px]">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black font-mono tracking-tight text-gray-800">
                    {selectedElder.metrics.steps.current}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">步</span>
                </div>
                {renderSparkline('steps', '#4f46e5')}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedElder.metrics.steps.current >= 5000 ? 'bg-[#ecfdf5] text-emerald-700' : 'bg-[#eceefc] text-indigo-700'
              }`}>
                {selectedElder.metrics.steps.current >= 5000 ? '已达标' : '正常'}
              </span>
              <span className="text-[8.5px] text-gray-400 scale-95 origin-right">{selectedElder.metrics.steps.rangeText}</span>
            </div>
          </div>
        </div>
      </div>


      {/* AI Interpretation Box with robot and gradient background */}
      <div id="ai-health-box" className="bg-gradient-to-br from-orange-50/70 to-amber-50/70 border border-orange-100/50 rounded-2xl p-4 shadow-xs relative overflow-hidden">
        {/* Soft decorative background pulse */}
        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-orange-300/10 animate-pulse-slow" />

        <div className="relative z-10">
          {/* Top row: gauge + title + button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {(() => {
                const details = getHealthScoreDetails(selectedElder);
                const radius = 22;
                const strokeWidth = 5;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (details.score / 100) * circumference;
                return (
                  <div className="shrink-0">
                    {/* Visual Gauge Radial */}
                    <div className="relative w-12 h-12 bg-white/50 rounded-full p-0.5 shadow-2xs">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="22"
                          cy="22"
                          r={radius}
                          fill="none"
                          stroke="rgba(217, 119, 6, 0.08)"
                          strokeWidth={strokeWidth}
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r={radius}
                          fill="none"
                          stroke={details.strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-[12px] font-black font-mono leading-none tracking-tight ${details.score >= 90 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {details.score}
                        </span>
                        <span className="text-[6px] text-amber-900/60 font-bold">安全盾</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[13px] font-bold text-amber-900 whitespace-nowrap">AI健康解读 · 实时盾分</h4>
                  {(() => {
                    const details = getHealthScoreDetails(selectedElder);
                    return (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                        details.score >= 90 ? 'bg-emerald-100/90 text-emerald-800' : 'bg-rose-100/90 text-rose-800'
                      }`}>
                        {details.status}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-white text-[8px] font-semibold px-2 py-0.5 rounded-full">
                    今日分析
                  </span>
                  <div className="flex items-center gap-0.5 text-[8.5px] font-extrabold text-[#78350f]">
                    <span>🤖</span>
                    <span>AI医护连结</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleAiInterpret}
              disabled={isAiLoading}
              className="text-[10px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-200/50 hover:bg-amber-200 active:scale-95 px-2.5 py-1.5 rounded-lg transition-transform shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
              深度分析
            </button>
          </div>

          {/* AI analysis text */}
          <div className="text-xs text-gray-700 leading-[1.9] min-h-[36px]">
            {isAiLoading ? (
              <div className="flex flex-col gap-1 py-1">
                <span className="font-semibold text-orange-850 animate-pulse">
                  {loadingPhrases[loadingPhraseIndex]}
                </span>
                <div className="w-full h-1 bg-amber-200/40 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full animate-infinite" style={{
                    width: '45%',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }} />
                </div>
              </div>
            ) : (
              <p className="font-medium">{aiAnalysis}</p>
            )}
          </div>

          <p className="text-[9px] text-[#9a8677] mt-2.5 border-t border-amber-300/20 pt-2 font-light">
            *AI分析仅供参考，不作为正式临床诊断，如有不适请及时联系护理人员或医生。
          </p>
        </div>
      </div>



      {/* Embedded Chart Area */}
      {renderInteractiveChart()}

      {/* Profiles detailed drawers / modal */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
              onClick={() => setProfileOpen(false)}
            />
            {/* Slide-up detailed profile card panel */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl shadow-xl z-50 overflow-hidden border-t border-gray-100"
            >
              {/* Header handle */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3" />
              
              <div className="px-5 pb-8 pt-2">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3.5 items-center">
                    <img 
                      src={selectedElder.avatar} 
                      alt="" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{selectedElder.name} 档案</h4>
                      <p className="text-xs text-gray-400">签约编号: QA2023061208</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    已签约守护
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">服务等级</p>
                      <p className="text-xs font-semibold text-gray-600">社区金牌特护长者</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">居家住址</p>
                      <p className="text-xs font-semibold text-gray-600">{selectedElder.room.replace('房间号：', '')}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">专属网格员</p>
                      <p className="text-xs font-semibold text-gray-600">刘美芳 (网格片区)</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">主护家庭医生</p>
                      <p className="text-xs font-semibold text-gray-600">钟伟民 副主任</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">医疗基础背景及特别关注</h5>
                  <div className="space-y-2">
                    <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                      <p className="text-xs font-semibold text-orange-900 mb-1">主控疾病：2型糖尿病 / I期高血压</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        长者需要每日早餐前半小时口服二甲双胍。日常血压需维持在140/90以下，清晨心率波幅较大。日常喜温和偏软食物。
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                      <p className="text-xs font-semibold text-emerald-900 mb-1">看护安排</p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        目前已签约“全天候云守护盾”服务。包含手环智能手表体征秒极联动、SOS一件触发拨打护理台、夜间雷达呼吸监测、家属随时微信提醒。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigateToServices();
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors text-center"
                  >
                    去预约专属医生/护理
                  </button>
                  <button 
                    onClick={() => setProfileOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 px-4 rounded-xl transition-colors text-center"
                  >
                    关闭返回
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
