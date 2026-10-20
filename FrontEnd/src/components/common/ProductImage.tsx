import React, { useState } from 'react';

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

export const isImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/images/')) return true;
  if (trimmed.startsWith('data:image/')) return true;
  if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(trimmed)) return true;
  return false;
};

export const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_PRODUCT_IMAGE) {
    target.onerror = null; // Tránh loop nếu fallback cũng lỗi
    target.src = FALLBACK_PRODUCT_IMAGE;
  }
};

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: string;
}

export const SafeProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Sản phẩm công nghệ GearTech',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full flex items-center justify-center',
  fallbackIcon = '📦'
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className={containerClassName}>
        <img 
          src={FALLBACK_PRODUCT_IMAGE} 
          alt={alt} 
          className={className} 
          loading="lazy" 
        />
      </div>
    );
  }

  // Nếu là chuỗi URL hoặc base64
  if (isImageUrl(src)) {
    return (
      <div className={containerClassName}>
        <img
          src={hasError ? FALLBACK_PRODUCT_IMAGE : src}
          alt={alt}
          className={className}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Nếu là emoji hoặc ký tự đại diện (fallbackIcon)
  return (
    <div className={containerClassName}>
      <span className="select-none text-center transform hover:scale-110 transition-transform">
        {src || fallbackIcon}
      </span>
    </div>
  );
};

export default SafeProductImage;
