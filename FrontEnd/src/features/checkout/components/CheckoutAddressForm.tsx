import React from 'react'
import { motion } from 'motion/react'
import { MapPin, CaretDown } from '@phosphor-icons/react'

export interface CheckoutFormData {
  fullName: string
  phone: string
  email: string
  province: string
  district: string
  ward: string
  address: string
  note: string
  isInvoiceNeeded: boolean
  companyName: string
  taxCode: string
  companyAddress: string
}

export interface CheckoutAddressFormProps {
  formData: CheckoutFormData
  onChange: (data: CheckoutFormData) => void
}

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center font-bold">
          <MapPin size={22} weight="fill" />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            1. Thông tin giao hàng
          </h2>
          <p className="text-xs text-zinc-400">Vui lòng nhập địa chỉ nhận hàng chính xác</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Họ và tên người nhận <span className="text-[#ff4655]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => onChange({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Số điện thoại <span className="text-[#ff4655]">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="0912 345 678"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Email nhận thông báo đơn hàng
          </label>
          <input
            type="email"
            placeholder="customer@geartech.vn"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Tỉnh / Thành phố <span className="text-[#ff4655]">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.province}
              onChange={(e) => onChange({ ...formData, province: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:border-[#ff4655] transition-colors"
            >
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Bình Dương">Bình Dương</option>
              <option value="Đồng Nai">Đồng Nai</option>
            </select>
            <CaretDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Quận / Huyện <span className="text-[#ff4655]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Quận Cầu Giấy"
            value={formData.district}
            onChange={(e) => onChange({ ...formData, district: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Phường / Xã <span className="text-[#ff4655]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Phường Dịch Vọng Hậu"
            value={formData.ward}
            onChange={(e) => onChange({ ...formData, ward: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Địa chỉ chi tiết (Số nhà, đường) <span className="text-[#ff4655]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Số 123 Duy Tân, Tòa nhà FPT"
            value={formData.address}
            onChange={(e) => onChange({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Ghi chú giao hàng (Tùy chọn)
          </label>
          <textarea
            rows={2}
            placeholder="Giao giờ hành chính, gọi trước khi đến..."
            value={formData.note}
            onChange={(e) => onChange({ ...formData, note: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
          />
        </div>
      </div>

      {/* Tùy chọn Xuất hóa đơn VAT */}
      <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.isInvoiceNeeded}
            onChange={(e) => onChange({ ...formData, isInvoiceNeeded: e.target.checked })}
            className="w-4 h-4 accent-[#ff4655] rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Yêu cầu xuất hóa đơn điện tử GTGT (VAT cho doanh nghiệp)
          </span>
        </label>

        {formData.isInvoiceNeeded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Tên công ty / Doanh nghiệp <span className="text-[#ff4655]">*</span>
              </label>
              <input
                type="text"
                required={formData.isInvoiceNeeded}
                placeholder="Công ty Cổ phần Công nghệ..."
                value={formData.companyName}
                onChange={(e) => onChange({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Mã số thuế (MST) <span className="text-[#ff4655]">*</span>
              </label>
              <input
                type="text"
                required={formData.isInvoiceNeeded}
                placeholder="0101234567"
                value={formData.taxCode}
                onChange={(e) => onChange({ ...formData, taxCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Địa chỉ trụ sở công ty <span className="text-[#ff4655]">*</span>
              </label>
              <input
                type="text"
                required={formData.isInvoiceNeeded}
                placeholder="Tầng 5, Tòa nhà ABC, 123 Đường XYZ..."
                value={formData.companyAddress}
                onChange={(e) => onChange({ ...formData, companyAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

