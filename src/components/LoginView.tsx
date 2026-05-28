import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

const MOCK_USERS: Record<string, string> = {
  user1: '123456',
};

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (MOCK_USERS[username] && MOCK_USERS[username] === password) {
        onLogin(username);
      } else {
        setError('账号或密码错误');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#f0fdf8] via-white to-white relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-emerald-100/40 blur-2xl" />
      <div className="absolute bottom-[120px] left-[-40px] w-[160px] h-[160px] rounded-full bg-emerald-50/60 blur-xl" />

      {/* Logo 区域 */}
      <div className="flex-shrink-0 pt-16 pb-8 flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-5">
            <img src="/logo-qkyd-wide.png" alt="耆康云盾" className="h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">耆安云盾</h1>
          <p className="text-xs text-gray-400 mt-2 font-light">守护长者健康 · 关爱每一天</p>
        </motion.div>
      </div>

      {/* 登录表单 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-1 px-8 relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="请输入账号"
              className="w-full h-12 pl-11 pr-4 bg-gray-50/80 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50 transition-all"
            />
          </div>

          {/* 密码 */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="请输入密码"
              className="w-full h-12 pl-11 pr-11 bg-gray-50/80 border border-gray-100 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 active:text-gray-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 pl-1"
            >
              {error}
            </motion.p>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl shadow-md shadow-emerald-200/60 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                登录
              </>
            )}
          </button>
        </form>

        {/* 测试账号提示 */}
        <p className="text-center text-[11px] text-gray-300 mt-8">
          测试账号：user1 / 123456
        </p>
      </motion.div>
    </div>
  );
}
