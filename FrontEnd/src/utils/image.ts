import React from 'react';

// SVG dự phòng thiết kế theo chủ đề công nghệ / gaming GearTech
export const FALLBACK_PRODUCT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff4655" />
      <stop offset="100%" stop-color="#ff6b78" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" />
  <circle cx="200" cy="200" r="140" fill="none" stroke="#27272a" stroke-width="2" stroke-dasharray="6 6" />
  <polygon points="200,110 270,160 270,240 200,290 130,240 130,160" fill="none" stroke="url(#neon)" stroke-width="3" />
  <path d="M130 160 L200 200 L270 160" stroke="#ff4655" stroke-width="2" fill="none" />
  <path d="M200 200 L200 290" stroke="#ff4655" stroke-width="2" fill="none" />
  <text x="200" y="325" fill="#a1a1aa" font-family="monospace, sans-serif" font-size="12" font-weight="900" letter-spacing="3" text-anchor="middle">GEARTECH // NO_IMAGE</text>
  <text x="200" y="345" fill="#71717a" font-family="sans-serif" font-size="10" font-weight="600" text-anchor="middle">THIẾT BỊ CÔNG NGHỆ</text>
</svg>
`)}`;

export const getBackendBaseUrl = (): string => {
  const envApi = import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const currentHost = window.location.hostname
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      const protocol = window.location.protocol || 'http:'
      return `${protocol}//${currentHost}:5000`
    }
  }
  if (envApi) {
    return envApi.replace(/\/api\/?$/, '')
  }
  return 'http://localhost:5000'
}

export const resolveImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  const base = getBackendBaseUrl()

  // 1. Relative upload path: /uploads/... or uploads/...
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return `${base}${clean}`
  }

  // 2. Full URL containing /uploads/ with localhost or 127.0.0.1
  if (trimmed.includes('/uploads/')) {
    try {
      const parsed = new URL(trimmed)
      if (typeof window !== 'undefined' && window.location?.hostname) {
        const currentHost = window.location.hostname
        if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.hostname = currentHost
            parsed.protocol = window.location.protocol || 'http:'
          }
        }
      }
      return parsed.toString()
    } catch {
      const uploadIdx = trimmed.indexOf('/uploads/')
      return `${base}${trimmed.substring(uploadIdx)}`
    }
  }

  return trimmed
}

export const isImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/') || trimmed.startsWith('/images/')) return true;
  if (trimmed.startsWith('data:image/')) return true;
  if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(trimmed)) return true;
  return false;
};

export const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_PRODUCT_IMAGE) {
    target.src = FALLBACK_PRODUCT_IMAGE;
  }
};

