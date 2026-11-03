import React from 'react'
import { Heart } from '@phosphor-icons/react'
import { SafeProductImage } from '../../../components/common/ProductImage'

export interface ProductGalleryViewerProps {
  title: string
  discount?: string
  productImages: string[]
  selectedImageIndex: number
  fallbackImage?: string
  isFavorite: boolean
  onSelectImage: (index: number) => void
  onToggleFavorite: () => void
}

export const ProductGalleryViewer: React.FC<ProductGalleryViewerProps> = ({
  title,
  discount,
  productImages,
  selectedImageIndex,
  fallbackImage,
  isFavorite,
  onSelectImage,
  onToggleFavorite
}) => {
  const currentImage = productImages[selectedImageIndex] || fallbackImage

  return (
    <div className="space-y-4">
      {/* Main Showcase Image */}
      <div className="relative aspect-square bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-sm dark:shadow-xl group">
        <SafeProductImage
          src={currentImage}
          alt={title}
          className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-500"
        />

        {discount && (
          <div className="absolute top-4 left-4 bg-[#ff4655] text-white font-black text-[10px] uppercase px-3 py-1 rounded shadow-md tracking-wider">
            GIẢM {discount}
          </div>
        )}

        {/* Nút Yêu thích (Heart) */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all shadow-md ${
            isFavorite
              ? 'bg-[#ff4655] border-[#ff4655] text-white'
              : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#ff4655]'
          }`}
          title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích sản phẩm'}
        >
          <Heart size={18} weight={isFavorite ? 'fill' : 'regular'} />
        </button>
      </div>

      {/* Gallery Thumbnails */}
      {productImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {productImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-zinc-900 shrink-0 p-1 transition-all ${
                selectedImageIndex === idx 
                  ? 'border-[#ff4655] shadow-md scale-105' 
                  : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
              }`}
            >
              <SafeProductImage src={img} alt="Thumbnail" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

