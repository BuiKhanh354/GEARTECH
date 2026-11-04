import { AnimatePresence, motion } from 'motion/react'
import { Bank, X, XCircle } from '@phosphor-icons/react'
import type { WithdrawalRequestItem } from '../../../services/financeService'
import { formatPrice } from '../../../utils/format'

interface WithdrawalActionModalsProps {
  withdrawal: WithdrawalRequestItem | null
  payoutOpen: boolean
  rejectOpen: boolean
  payoutRef: string
  proofUrl: string
  rejectReason: string
  processing: boolean
  onPayoutRefChange: (value: string) => void
  onProofUrlChange: (value: string) => void
  onRejectReasonChange: (value: string) => void
  onClosePayout: () => void
  onCloseReject: () => void
  onPayout: () => void
  onReject: () => void
}

export default function WithdrawalActionModals(props: WithdrawalActionModalsProps) {
  const { withdrawal, payoutOpen, rejectOpen, payoutRef, proofUrl, rejectReason, processing, onPayoutRefChange, onProofUrlChange, onRejectReasonChange, onClosePayout, onCloseReject, onPayout, onReject } = props
  return (
    <>
      <AnimatePresence>
        {payoutOpen && withdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase text-emerald-500 flex items-center gap-2">
                  <Bank size={20} /> Xác Nhận Đã Giải Ngân Cho Shop
                </h3>
                <button onClick={onClosePayout}>
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <p className="text-xs text-zinc-400">Số tiền giải ngân:</p>
                <p className="text-xl font-black text-emerald-500 font-mono">{formatPrice(withdrawal.amount)}</p>
                <p className="text-xs text-zinc-300 font-bold uppercase mt-1">
                  Đến: {withdrawal.bankInfo?.bankName} - {withdrawal.bankInfo?.accountNumber} ({withdrawal.bankInfo?.accountHolder})
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Mã giao dịch ngân hàng / Tham chiếu chuyển khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={(e) => onPayoutRefChange(e.target.value)}
                    required
                    placeholder="VD: FT2409817293817 hoặc IBFT_19283"
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Đường dẫn biên lai chuyển khoản (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => onProofUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClosePayout}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onPayout}
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase"
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận giải ngân'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Từ Chối Yêu Cầu Rút */}
      <AnimatePresence>
        {rejectOpen && withdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase text-rose-500 flex items-center gap-2">
                  <XCircle size={20} /> Từ Chối Yêu Cầu Rút Tiền
                </h3>
                <button onClick={onCloseReject}>
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Khi từ chối, số tiền <span className="font-bold text-white">{formatPrice(withdrawal.amount)}</span> sẽ được tự động hoàn trả lại số dư khả dụng (Available Balance) của Shop.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  required
                  placeholder="VD: Thông tin số tài khoản và tên chủ tài khoản không khớp với hồ sơ đăng ký..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseReject}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={processing || !rejectReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs uppercase"
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
