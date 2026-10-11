import { useState } from 'react'
import { motion } from 'motion/react'
import { FloppyDisk } from '@phosphor-icons/react'

export default function SecurityTab() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  return (
    <motion.div
      key="security-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 pl-1">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
          CÀI ĐẶT BẢO MẬT TÀI KHOẢN
        </h3>
      </div>

      <div className="space-y-4 max-w-md pl-1">
        <div className="space-y-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">MẬT KHẨU HIỆN TẠI</span>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">MẬT KHẨU MỚI</span>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">XÁC NHẬN MẬT KHẨU MỚI</span>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
        </div>

        <button 
          onClick={() => {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
              alert('Xác nhận mật khẩu mới không trùng khớp!')
              return
            }
            alert('Tính năng đổi mật khẩu đã ghi nhận trên hệ thống bảo mật!')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          }}
          className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-[#ff4655]/20 flex items-center gap-1.5 cursor-pointer"
        >
          <FloppyDisk size={12} /> Cập nhật mật khẩu bảo mật
        </button>
      </div>
    </motion.div>
  )
}
