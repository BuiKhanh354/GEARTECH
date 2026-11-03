import React from 'react'
import { Truck, Check, Clock, Sparkle } from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'

export interface ShippingMethodItem {
  id: string
  name: string
  estimate: string
  price: number
  icon: any
  badge: string
  badgeColor: string
}

export const defaultShippingMethods: ShippingMethodItem[] = [
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN Express)',
    estimate: 'Dự kiến 2 - 4 ngày · Đối tác chính thức',
    price: 30000,
    icon: Truck,
    badge: 'GHN Express',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
  },
  {
    id: 'fast',
    name: 'Giao hàng hỏa tốc 24H',
    estimate: 'Nhận trong 24h - 48h liên tỉnh',
    price: 65000,
    icon: Clock,
    badge: 'Hỏa tốc',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
  },
  {
    id: 'express',
    name: 'GEARTECH SuperShip (Nội thành)',
    estimate: 'Giao siêu tốc 2 giờ',
    price: 120000,
    icon: Sparkle,
    badge: 'VIP 2H',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
  }
]

export interface CheckoutShippingMethodsProps {
  shippingMethod: string
  methods?: ShippingMethodItem[]
  onSelect: (id: string) => void
}

export const CheckoutShippingMethods: React.FC<CheckoutShippingMethodsProps> = ({
  shippingMethod,
  methods = defaultShippingMethods,
  onSelect
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
          <Truck size={22} weight="fill" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            2. Đơn vị vận chuyển
          </h2>
          <p className="text-xs text-zinc-400">Chọn gói giao hàng thích hợp với nhu cầu của bạn</p>
        </div>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = shippingMethod === method.id
          const Icon = method.icon
          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#ff4655] bg-[#ff4655]/5 dark:bg-[#ff4655]/10 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-[#ff4655] bg-[#ff4655]' : 'border-zinc-400 dark:border-zinc-600'
                  }`}
                >
                  {isSelected && <Check size={12} weight="bold" className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{method.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${method.badgeColor || 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                      {method.badge}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Icon size={14} />
                    {method.estimate}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {formatPrice(method.price)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

