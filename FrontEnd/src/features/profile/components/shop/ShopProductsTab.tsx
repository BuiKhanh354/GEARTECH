import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, FolderPlus } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'

const isImageUrl = (str: string) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('data:image/')
}

interface ShopProductsTabProps {
  token: string | null;
  allProducts: any[];
  onRefresh: () => void;
}

export default function ShopProductsTab({ token, allProducts, onRefresh }: ShopProductsTabProps) {
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 1500000,
    oldPrice: 1800000,
    discount: '16%',
    category: 'laptops',
    categoryName: 'LAPTOP & MACBOOK',
    imageEmoji: '💻',
    stock: 20,
    specKey1: 'CPU', specVal1: '',
    specKey2: 'RAM', specVal2: '',
    specKey3: 'SSD', specVal3: '',
    specKey4: 'VGA', specVal4: ''
  })
  
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = 6 - galleryUrls.length
    if (remaining <= 0) {
      setError('Đã đạt giới hạn 6 ảnh. Vui lòng xoá ảnh cũ trước khi thêm mới.')
      return
    }

    setUploadingImages(true)
    setError(null)

    const formData = new FormData()
    const filesToUpload = Array.from(files).slice(0, remaining)
    filesToUpload.forEach(file => formData.append('images', file))

    try {
      const res = await fetch('http://localhost:5000/api/upload/product-images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setGalleryUrls(prev => [...prev, ...data.urls])

      if (!productForm.imageEmoji && data.urls.length > 0) {
        setProductForm(prev => ({ ...prev, imageEmoji: data.urls[0] }))
      }

      setSuccess(`Tải lên thành công ${data.urls.length} ảnh từ máy tính!`)
    } catch (err: any) {
      setError(err.message || 'Lỗi tải ảnh lên máy chủ.')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const specs: Record<string, string> = {}
    if (productForm.specKey1 && productForm.specVal1) specs[productForm.specKey1] = productForm.specVal1
    if (productForm.specKey2 && productForm.specVal2) specs[productForm.specKey2] = productForm.specVal2
    if (productForm.specKey3 && productForm.specVal3) specs[productForm.specKey3] = productForm.specVal3
    if (productForm.specKey4 && productForm.specVal4) specs[productForm.specKey4] = productForm.specVal4

    let mappedCategoryName = 'Mặt hàng công nghệ'
    if (productForm.category === 'laptops') mappedCategoryName = 'LAPTOP & MACBOOK'
    else if (productForm.category === 'desktops') mappedCategoryName = 'PC & WORKSTATION'
    else if (productForm.category === 'monitors') mappedCategoryName = 'MÀN HÌNH MÁY TÍNH'
    else if (productForm.category === 'peripherals') mappedCategoryName = 'BÀN PHÍM & CHUỘT'
    else if (productForm.category === 'audio') mappedCategoryName = 'TAI NGHE & LOA'
    else if (productForm.category === 'smart-devices') mappedCategoryName = 'THIẾT BỊ THÔNG MINH'
    else if (productForm.category === 'accessories') mappedCategoryName = 'PHỤ KIỆN CÔNG NGHỆ'
    else if (productForm.category === 'components') mappedCategoryName = 'LINH KIỆN MÁY TÍNH'

    const payload = {
      title: productForm.title,
      description: productForm.description,
      price: Number(productForm.price),
      oldPrice: Number(productForm.oldPrice),
      discount: productForm.discount,
      category: productForm.category,
      categoryName: mappedCategoryName,
      imageEmoji: productForm.imageEmoji,
      gallery: galleryUrls.length > 0 ? galleryUrls : [productForm.imageEmoji],
      stock: Number(productForm.stock),
      specs: specs
    }

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(`Sản phẩm "${data.product.title}" đã được đăng bán thành công!`)
      
      setProductForm({
        title: '',
        description: '',
        price: 1500000,
        oldPrice: 1800000,
        discount: '16%',
        category: 'laptops',
        categoryName: 'LAPTOP & MACBOOK',
        imageEmoji: '',
        stock: 20,
        specKey1: 'CPU', specVal1: '',
        specKey2: 'RAM', specVal2: '',
        specKey3: 'SSD', specVal3: '',
        specKey4: 'VGA', specVal4: ''
      })
      setGalleryUrls([])

      onRefresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      key="shop-products"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Package size={16} className="text-[#ff4655]" />
          ĐĂNG BÁN & QUẢN LÝ DANH SÁCH THIẾT BỊ CÔNG NGHỆ
        </h3>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-bold">
            ⚠️ {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-sm text-xs font-bold">
            ✅ {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form to Post Product */}
      <form onSubmit={handleCreateProduct} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <FolderPlus size={14} /> // KHAI BÁO THIẾT BỊ ĐĂNG BÁN MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">TÊN THIẾT BỊ / SẢN PHẨM</span>
            <input
              type="text"
              required
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              placeholder="Chuột Gaming Razer Viper V3 Pro"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">DANH MỤC</span>
            <select
              required
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              <option value="laptops">LAPTOP & MACBOOK</option>
              <option value="desktops">PC & WORKSTATION</option>
              <option value="monitors">MÀN HÌNH MÁY TÍNH</option>
              <option value="peripherals">BÀN PHÍM & CHUỘT</option>
              <option value="audio">TAI NGHE & LOA</option>
              <option value="smart-devices">THIẾT BỊ THÔNG MINH</option>
              <option value="accessories">PHỤ KIỆN CÔNG NGHỆ</option>
              <option value="components">LINH KIỆN MÁY TÍNH</option>
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIÁ BÁN (VND)</span>
            <input
              type="number"
              required
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
              placeholder="3500000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIÁ GỐC / CŨ (VND)</span>
            <input
              type="number"
              value={productForm.oldPrice}
              onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
              placeholder="3990000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIẢM GIÁ (VD: -12%)</span>
            <input
              type="text"
              value={productForm.discount}
              onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
              placeholder="-12%"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">EMOJI ẢNH</span>
            <input
              type="text"
              required
              value={productForm.imageEmoji}
              onChange={(e) => setProductForm({ ...productForm, imageEmoji: e.target.value })}
              placeholder="🖱️"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">SỐ LƯỢNG KHO HÀNG</span>
            <input
              type="number"
              required
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
              placeholder="20"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">MÔ TẢ CHI TIẾT SẢN PHẨM</span>
            <textarea
              required
              rows={4}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Mô tả công nghệ, thiết kế, vật liệu..."
              className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] resize-y"
            ></textarea>
          </div>

          <div className="md:col-span-3 border-t border-zinc-200 dark:border-zinc-850 pt-4 space-y-3">
            <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 block uppercase">// ẢNH THỰC TẾ (TỐI ĐA 6 ẢNH)</span>
            <div className="flex gap-2 mb-2 items-center">
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages || galleryUrls.length >= 6}
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-sm transition-all disabled:opacity-50"
              >
                {uploadingImages ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
              </button>
            </div>
            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-6 gap-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-850 group">
                    <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-sm-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-black text-[8px] px-1 rounded-sm font-black tracking-widest">MAIN</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DYNAMIC SPECS CONFIGURATION FIELDS */}
          <div className="md:col-span-3 border-t border-zinc-200 dark:border-zinc-850 pt-4 space-y-3">
            <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 block uppercase">// KHAI BÁO THÔNG SỐ KỸ THUẬT (SPECS)</span>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <input type="text" value={productForm.specKey1} onChange={(e) => setProductForm({...productForm, specKey1: e.target.value})} className="w-full text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-950 p-2 rounded-sm focus:outline-none" />
                <input type="text" value={productForm.specVal1} onChange={(e) => setProductForm({...productForm, specVal1: e.target.value})} placeholder="Focus Pro 35K" className="w-full text-[10px] bg-white dark:bg-zinc-950 p-2 border dark:border-zinc-850 rounded-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <input type="text" value={productForm.specKey2} onChange={(e) => setProductForm({...productForm, specKey2: e.target.value})} className="w-full text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-950 p-2 rounded-sm focus:outline-none" />
                <input type="text" value={productForm.specVal2} onChange={(e) => setProductForm({...productForm, specVal2: e.target.value})} placeholder="54g siêu nhẹ" className="w-full text-[10px] bg-white dark:bg-zinc-950 p-2 border dark:border-zinc-850 rounded-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <input type="text" value={productForm.specKey3} onChange={(e) => setProductForm({...productForm, specKey3: e.target.value})} className="w-full text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-950 p-2 rounded-sm focus:outline-none" />
                <input type="text" value={productForm.specVal3} onChange={(e) => setProductForm({...productForm, specVal3: e.target.value})} placeholder="95 giờ liên tục" className="w-full text-[10px] bg-white dark:bg-zinc-955 p-2 border dark:border-zinc-850 rounded-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <input type="text" value={productForm.specKey4} onChange={(e) => setProductForm({...productForm, specKey4: e.target.value})} className="w-full text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-950 p-2 rounded-sm focus:outline-none" />
                <input type="text" value={productForm.specVal4} onChange={(e) => setProductForm({...productForm, specVal4: e.target.value})} placeholder="Razer Optical Gen-3" className="w-full text-[10px] bg-white dark:bg-zinc-955 p-2 border dark:border-zinc-850 rounded-sm focus:outline-none" />
              </div>
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] cursor-pointer"
        >
          {submitting ? 'ĐANG ĐĂNG BÁN...' : 'XÁC NHẬN ĐĂNG BÁN SẢN PHẨM'}
        </button>
      </form>

      {/* Display list of products registered by this shop */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">
          // THIẾT BỊ ĐÃ ĐĂNG BÁN ({allProducts.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allProducts.map((p) => (
            <div key={p._id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-sm flex gap-3 relative">
              <div className="w-12 h-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm flex items-center justify-center text-3xl select-none overflow-hidden shrink-0">
                {isImageUrl(p.imageEmoji) ? (
                  <img src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  p.imageEmoji
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 tracking-wider uppercase">
                  {p.categoryName}
                </span>
                <h4 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate pt-1">{p.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                  {p.oldPrice && <span className="text-[9px] text-zinc-400 line-through">{formatPrice(p.oldPrice)}</span>}
                </div>
                <p className="text-[8px] text-zinc-400 dark:text-zinc-600">Số lượng kho: <span className="font-bold text-zinc-900 dark:text-white">{p.stock}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
