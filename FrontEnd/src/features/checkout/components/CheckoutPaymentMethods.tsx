import React from 'react'
import { motion } from 'motion/react'
import {
  CreditCard,
  Check,
  CurrencyCircleDollar,
  Bank,
  DeviceMobile
} from '@phosphor-icons/react'

export interface PaymentMethodItem {
  id: string
  name: string
  description: string
  icon: any
  popular: boolean
}

export const defaultPaymentMethods: PaymentMethodItem[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt khi đơn hàng được giao tới nơi',
    icon: CurrencyCircleDollar,
    popular: true
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản Ngân hàng (VietQR)',
    description: 'Quét mã QR tự động xác thực giao dịch trong 30 giây',
    icon: Bank,
    popular: true
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng / Ghi nợ quốc tế',
    description: 'Hỗ trợ Visa, MasterCard, JCB, American Express',
    icon: CreditCard,
    popular: false
  },
  {
    id: 'momo',
    name: 'Ví điện tử MoMo',
    description: 'Quét mã QR thanh toán nhanh qua ứng dụng MoMo',
    icon: DeviceMobile,
    popular: false
  },
  {
    id: 'vnpay',
    name: 'Cổng thanh toán VNPAY (ATM, Visa, QR)',
    description: 'Thanh toán bảo mật qua cổng VNPAY kết nối 40+ ngân hàng Việt Nam',
    icon: CreditCard,
    popular: true
  }
]

export interface CardData {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}

export interface CheckoutPaymentMethodsProps {
  paymentMethod: string
  methods?: PaymentMethodItem[]
  cardData: CardData
  onSelectPayment: (id: string) => void
  onCardDataChange: (data: CardData) => void
}

export const CheckoutPaymentMethods: React.FC<CheckoutPaymentMethodsProps> = ({
  paymentMethod,
  methods = defaultPaymentMethods,
  cardData,
  onSelectPayment,
  onCardDataChange
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
          <CreditCard size={22} weight="fill" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            3. Hình thức thanh toán
          </h2>
          <p className="text-xs text-zinc-400">Chọn giải pháp thanh toán linh hoạt và an toàn</p>
        </div>
      </div>

      <div className="space-y-3">
        {methods.map((pm) => {
          const isSelected = paymentMethod === pm.id
          const Icon = pm.icon
          return (
            <div
              key={pm.id}
              onClick={() => onSelectPayment(pm.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#ff4655] bg-[#ff4655]/5 dark:bg-[#ff4655]/10 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#ff4655] bg-[#ff4655]' : 'border-zinc-400 dark:border-zinc-600'
                    }`}
                  >
                    {isSelected && <Check size={12} weight="bold" className="text-white" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-zinc-900 dark:text-white">{pm.name}</span>
                        {pm.popular && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Khuyên dùng
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{pm.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thẻ tín dụng input view */}
              {isSelected && pm.id === 'credit_card' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                      Số thẻ quốc tế
                    </label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardData.cardNumber}
                      onChange={(e) => onCardDataChange({ ...cardData, cardNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                      Tên in trên thẻ
                    </label>
                    <input
                      type="text"
                      placeholder="NGUYEN VAN A"
                      value={cardData.cardHolder}
                      onChange={(e) => onCardDataChange({ ...cardData, cardHolder: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                        Hạn (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardData.expiryDate}
                        onChange={(e) => onCardDataChange({ ...cardData, expiryDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={(e) => onCardDataChange({ ...cardData, cvv: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-center font-mono"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VietQR View */}
              {isSelected && pm.id === 'bank_transfer' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl"
                >
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-zinc-200 flex items-center justify-center shadow-sm">
                    <span className="text-4xl">📱</span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300 text-center sm:text-left">
                    <div className="font-bold text-zinc-900 dark:text-white">Ngân hàng TMCP Quân Đội (MB Bank)</div>
                    <div>Số tài khoản: <strong className="font-mono text-[#ff4655]">88889999GEAR</strong></div>
                    <div>Chủ tài khoản: <strong>CONG TY CO PHAN GEARTECH VIET NAM</strong></div>
                    <div className="text-[11px] text-zinc-400">Nội dung: Họ tên + SĐT đặt hàng</div>
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

