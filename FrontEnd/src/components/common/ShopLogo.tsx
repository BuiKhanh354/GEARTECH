import React, { useState } from 'react'
import { resolveImageUrl, isImageUrl } from '../../utils/image'

export interface ShopLogoProps {
  logo?: string | null
  name?: string
  className?: string
  fallbackEmoji?: string
}

/**
 * Component hiển thị Logo Shop thông minh:
 * - Nếu logo là URL ảnh (http, /uploads/...): Hiển thị thẻ <img> với URL được resolve tự động
 * - Nếu ảnh bị lỗi 404/network: Tự động fallback sang emoji đại diện (không hiển thị icon ảnh vỡ)
 * - Nếu logo là emoji (🏬, ⚡...): Hiển thị dạng chữ/icon gọn gàng trong khối
 */
export const ShopLogo: React.FC<ShopLogoProps> = ({
  logo,
  name = 'Gian hàng',
  className = 'w-10 h-10 rounded-lg text-xl',
  fallbackEmoji = '🏬'
}) => {
  const [loadError, setLoadError] = useState(false)
  const trimmed = logo?.trim() || ''

  const isImg = Boolean(!loadError && trimmed && isImageUrl(trimmed))

  if (isImg) {
    const finalSrc = resolveImageUrl(trimmed)
    return (
      <img
        src={finalSrc}
        alt={name}
        onError={() => setLoadError(true)}
        className={`${className} object-cover bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shrink-0`}
      />
    )
  }

  // Trường hợp là emoji ngắn (1-4 ký tự) hoặc ảnh bị lỗi
  const displayEmoji = (!loadError && trimmed && trimmed.length <= 4) ? trimmed : fallbackEmoji

  return (
    <span
      className={`${className} flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 select-none shrink-0 overflow-hidden font-normal`}
      title={name}
    >
      {displayEmoji}
    </span>
  )
}

export default ShopLogo
