import React, { useState } from 'react';
import { 
  FALLBACK_PRODUCT_IMAGE, 
  resolveImageUrl, 
  isImageUrl 
} from '../../utils/image';

export interface ProductImageProps {
  src?: string | null;
  gallery?: string[];
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: string;
}

export const SafeProductImage: React.FC<ProductImageProps> = ({
  src,
  gallery,
  alt = 'Sản phẩm công nghệ GearTech',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full flex items-center justify-center',
  fallbackIcon = '📦'
}) => {
  const [hasError, setHasError] = useState(false);

  // Chọn nguồn ảnh khả thi nhất: nếu src là URL thì ưu tiên src,
  // nếu src không phải URL (hoặc là emoji/null) mà gallery có ảnh thì lấy ảnh đầu tiên trong gallery
  let candidate = src;
  if (!isImageUrl(candidate) && gallery && Array.isArray(gallery) && gallery.length > 0) {
    const firstValid = gallery.find(g => isImageUrl(g));
    if (firstValid) {
      candidate = firstValid;
    }
  }

  if (!candidate) {
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
  if (isImageUrl(candidate)) {
    const finalUrl = resolveImageUrl(candidate);
    return (
      <div className={containerClassName}>
        <img
          src={hasError ? FALLBACK_PRODUCT_IMAGE : finalUrl}
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
        {candidate || fallbackIcon}
      </span>
    </div>
  );
};

export default SafeProductImage;
