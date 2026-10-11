import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Envelope, 
  Lock, 
  User, 
  Phone, 
  GameController, 
  ArrowRight,
  ShieldWarning,
  CheckCircle,
  GoogleLogo,
  DiscordLogo,
  AppleLogo
} from '@phosphor-icons/react'

type AuthMode = 'login' | 'register'

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')

  // Common Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Register Fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // UI Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ tài khoản và mật khẩu.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại.')
      }

      // Lưu Token JWT và thông tin User vào localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...')
      
      // Thực hiện chuyển hướng toàn trang để đồng bộ lại trạng thái của Header
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1000)

    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!name || !email || !password || !phone) {
      setErrorMsg('Vui lòng nhập đầy đủ các trường thông tin.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại.')
      }

      setSuccessMsg('Tạo tài khoản thành công! Hãy sử dụng tài khoản này để đăng nhập.')
      
      // Reset form đăng ký
      setName('')
      setPhone('')
      
      // Tự động nhảy về Tab đăng nhập sau 2.5s
      setTimeout(() => {
        handleSwitchMode('login')
      }, 2500)

    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center py-12 px-6 bg-grid-pattern transition-colors duration-200">
      
      {/* Auth Container Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="w-full max-w-md bg-white dark:bg-zinc-950/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden space-y-6"
      >
        {/* Glow Side Accent line */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>

        {/* Logo and Head */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/Trang-chu" className="group flex items-center gap-3 tracking-widest text-lg font-black uppercase mb-1">
            <span className="flex items-center justify-center w-8 h-8 rounded bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)] group-hover:scale-105 transition-all">
              <GameController size={18} weight="fill" />
            </span>
            <div className="text-left flex flex-col">
              <span className="text-xs font-black tracking-[0.25em] leading-none text-zinc-900 dark:text-white dark:text-glow">GEARTECH</span>
              <span className="text-[7px] font-bold tracking-[0.4em] text-[#ff4655] mt-0.5">VALORANT ED.</span>
            </div>
          </Link>
          <span className="text-[7px] font-mono text-zinc-400 dark:text-zinc-650 uppercase tracking-[0.3em] block">// IDENTITY_GATEWAY_V1</span>
        </div>

        {/* Dynamic Tab Switchers */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <button
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 text-center py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-800'
                : 'text-zinc-550 dark:text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 text-center py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-800'
                : 'text-zinc-550 dark:text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Alert Notifications */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
            >
              <ShieldWarning size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-start gap-2.5 text-xs font-semibold"
            >
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Forms */}
        <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
          
          <AnimatePresence mode="popLayout">
            {mode === 'register' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Full Name Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-600 tracking-wider">HỌ VÀ TÊN</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NGUYỄN VĂN A"
                    className="w-full text-xs font-semibold pl-10 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655] uppercase"
                  />
                  <User size={14} className="absolute left-3.5 bottom-3 text-zinc-400 dark:text-zinc-600" />
                </div>

                {/* Phone Number Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-600 tracking-wider">SỐ ĐIỆN THOẠI</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full text-xs font-semibold pl-10 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655]"
                  />
                  <Phone size={14} className="absolute left-3.5 bottom-3 text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-600 tracking-wider">ĐỊA CHỈ EMAIL</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full text-xs font-semibold pl-10 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655]"
            />
            <Envelope size={14} className="absolute left-3.5 bottom-3 text-zinc-400 dark:text-zinc-600" />
          </div>

          {/* Password Input */}
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-600 tracking-wider">MẬT KHẨU BẢO MẬT</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-semibold pl-10 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655]"
            />
            <Lock size={14} className="absolute left-3.5 bottom-3 text-zinc-400 dark:text-zinc-600" />
          </div>

          {/* Action Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(255, 70, 85, 0.4)' }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255, 70, 85, 0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'ĐANG XỬ LÝ...' : mode === 'login' ? 'ĐĂNG NHẬP HỆ THỐNG' : 'ĐĂNG KÝ TÀI KHOẢN'}
            {!loading && <ArrowRight size={14} weight="bold" />}
          </motion.button>
        </form>

        {/* Social Authentication Grid */}
        <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900/60 text-center">
          <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            // HOẶC KẾT NỐI LIÊN MINH
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-550 transition-colors">
              <GoogleLogo size={14} className="text-red-500" /> Google
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-550 transition-colors">
              <DiscordLogo size={14} className="text-indigo-500" /> Discord
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-550 transition-colors">
              <AppleLogo size={14} /> Apple
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

// Link dummy component inside this file for compiling cleanly or import from react-router-dom
import { Link } from 'react-router-dom'

export default LoginPage
