import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Package, 
  FolderPlus, 
  PencilSimple, 
  Trash, 
  Eye, 
  EyeSlash, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  WarningCircle, 
  CheckCircle, 
  X,
  Images,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  UploadSimple
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { categoryService, type CategoryItem } from '../../../../services/categoryService'
import { brandService, type BrandItem } from '../../../../services/brandService'
import { productService, type ProductItem } from '../../../../services/productService'
import { productImageService, type ProductImageItem } from '../../../../services/productImageService'
import { SafeProductImage, isImageUrl } from '../../../../components/common/ProductImage'

interface ShopProductsTabProps {
  token: string | null;
  allProducts: any[];
  onRefresh: () => void;
  initialStatus?: string;
}

export default function ShopProductsTab({ token, allProducts, onRefresh, initialStatus }: ShopProductsTabProps) {
  // New Product Form State
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 1500000,
    oldPrice: 1800000,
    discount: '16%',
    category: 'laptops',
    categoryName: 'LAPTOP & MACBOOK',
    brand: 'asus',
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
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [brands, setBrands] = useState<BrandItem[]>([])

  // Filter & Search State for Shop Products
  const [productSearch, setProductSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || 'all')

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    oldPrice: 0,
    stock: 0,
    category: '',
    categoryName: '',
    brand: '',
    status: 'active' as 'active' | 'hidden' | 'out_of_stock' | 'inactive',
    imageEmoji: '📦'
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Images Management Modal State (Section 3.6: product_images)
  const [imagesModalProduct, setImagesModalProduct] = useState<any | null>(null)
  const [isImagesModalOpen, setIsImagesModalOpen] = useState<boolean>(false)
  const [productImagesList, setProductImagesList] = useState<ProductImageItem[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [imageActionLoading, setImageActionLoading] = useState(false)
  const [imagesModalError, setImagesModalError] = useState<string | null>(null)
  const [imagesModalSuccess, setImagesModalSuccess] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageIsPrimary, setNewImageIsPrimary] = useState(false)
  const modalFileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenImagesModal = async (product: any) => {
    setImagesModalProduct(product)
    setIsImagesModalOpen(true)
    setImagesModalError(null)
    setImagesModalSuccess(null)
    setNewImageUrl('')
    setNewImageIsPrimary(false)
    setLoadingImages(true)
    try {
      const pId = product._id || product.id
      const data = await productImageService.getProductImages(String(pId))
      setProductImagesList(data.images || [])
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || 'Không thể tải danh sách hình ảnh sản phẩm.')
    } finally {
      setLoadingImages(false)
    }
  }

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!imagesModalProduct) return
    const pId = imagesModalProduct._id || imagesModalProduct.id
    setImageActionLoading(true)
    setImagesModalError(null)
    try {
      await productImageService.updateProductImage(String(pId), imageId, { isPrimary: true })
      setImagesModalSuccess('Đã cập nhật ảnh đại diện chính của sản phẩm!')
      const data = await productImageService.getProductImages(String(pId))
      setProductImagesList(data.images || [])
      onRefresh()
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || 'Lỗi khi cập nhật ảnh đại diện.')
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    if (!imagesModalProduct) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= productImagesList.length) return

    const newList = [...productImagesList]
    const [movedItem] = newList.splice(index, 1)
    newList.splice(targetIndex, 0, movedItem)

    const orders = newList.map((item, idx) => ({
      imageId: item._id,
      sortOrder: idx
    }))

    setProductImagesList(newList)
    setImageActionLoading(true)
    try {
      const pId = imagesModalProduct._id || imagesModalProduct.id
      await productImageService.reorderProductImages(String(pId), orders)
      setImagesModalSuccess('Đã lưu thứ tự hiển thị ảnh mới!')
      onRefresh()
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || 'Lỗi khi sắp xếp thứ tự ảnh.')
      const pId = imagesModalProduct._id || imagesModalProduct.id
      const data = await productImageService.getProductImages(String(pId))
      setProductImagesList(data.images || [])
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!imagesModalProduct) return
    const pId = imagesModalProduct._id || imagesModalProduct.id
    setImageActionLoading(true)
    setImagesModalError(null)
    try {
      await productImageService.deleteProductImage(String(pId), imageId)
      setImagesModalSuccess('Đã xóa ảnh khỏi sản phẩm thành công!')
      const data = await productImageService.getProductImages(String(pId))
      setProductImagesList(data.images || [])
      onRefresh()
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || 'Lỗi khi xóa ảnh.')
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleAddImageUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagesModalProduct || !newImageUrl.trim()) return
    const pId = imagesModalProduct._id || imagesModalProduct.id
    setImageActionLoading(true)
    setImagesModalError(null)
    try {
      await productImageService.addProductImage(String(pId), {
        imageUrl: newImageUrl.trim(),
        isPrimary: newImageIsPrimary
      })
      setImagesModalSuccess('Đã thêm ảnh mới thành công!')
      setNewImageUrl('')
      setNewImageIsPrimary(false)
      const data = await productImageService.getProductImages(String(pId))
      setProductImagesList(data.images || [])
      onRefresh()
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || 'Lỗi khi thêm ảnh.')
    } finally {
      setImageActionLoading(false)
    }
  }

  const handleUploadModalFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !imagesModalProduct) return
    setImageActionLoading(true)
    setImagesModalError(null)
    try {
      const urls = await productImageService.uploadImages(files)
      if (urls.length > 0) {
        const pId = imagesModalProduct._id || imagesModalProduct.id
        await productImageService.addProductImage(String(pId), {
          images: urls.map((u, i) => ({
            imageUrl: u,
            isPrimary: newImageIsPrimary && i === 0,
            sortOrder: productImagesList.length + i
          }))
        })
        setImagesModalSuccess(`Đã tải lên và thêm thành công ${urls.length} ảnh!`)
        const data = await productImageService.getProductImages(String(pId))
        setProductImagesList(data.images || [])
        onRefresh()
      }
    } catch (err: any) {
      setImagesModalError(err.response?.data?.error || err.message || 'Lỗi khi tải ảnh lên server.')
    } finally {
      setImageActionLoading(false)
    }
  }

  useEffect(() => {
    categoryService.getCategories()
      .then(cats => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats)
          if (!productForm.category) {
            setProductForm(prev => ({
              ...prev,
              category: cats[0].slug,
              categoryName: cats[0].name
            }))
          }
        }
      })
      .catch(err => console.error('Lỗi nạp danh mục cho shop:', err))

    brandService.getBrands()
      .then(bList => {
        if (Array.isArray(bList) && bList.length > 0) {
          setBrands(bList)
          if (!productForm.brand) {
            setProductForm(prev => ({ ...prev, brand: bList[0].slug }))
          }
        }
      })
      .catch(err => console.error('Lỗi nạp thương hiệu cho shop:', err))
  }, [])

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
      if (data.urls.length > 0 && !isImageUrl(productForm.imageEmoji)) {
        setProductForm(prev => ({ ...prev, imageEmoji: data.urls[0] }))
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải ảnh lên')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setGalleryUrls(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Handle Create Product
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

    const selectedCat = categories.find(c => c.slug === productForm.category)
    const mappedCategoryName = selectedCat ? selectedCat.name : productForm.categoryName

    const payload = {
      title: productForm.title,
      description: productForm.description,
      price: Number(productForm.price),
      oldPrice: Number(productForm.oldPrice),
      discount: productForm.discount,
      category: productForm.category,
      categoryName: mappedCategoryName,
      brand: productForm.brand,
      imageEmoji: productForm.imageEmoji,
      gallery: galleryUrls.length > 0 ? galleryUrls : [productForm.imageEmoji],
      stock: Number(productForm.stock),
      specs
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
        category: categories.length > 0 ? categories[0].slug : 'laptops',
        categoryName: categories.length > 0 ? categories[0].name : 'LAPTOP & MACBOOK',
        brand: brands.length > 0 ? brands[0].slug : 'asus',
        imageEmoji: '📦',
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

  // Open Edit Modal
  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p)
    setEditForm({
      title: p.title || p.name || '',
      description: p.description || '',
      price: p.price || 0,
      oldPrice: p.oldPrice || 0,
      stock: p.stock ?? 10,
      category: p.category || 'accessories',
      categoryName: p.categoryName || '',
      brand: p.brand || 'asus',
      status: p.status || 'active',
      imageEmoji: p.imageEmoji || '📦'
    })
    setEditError(null)
    setIsEditModalOpen(true)
  }

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setEditError(null)
    setEditSubmitting(true)

    try {
      const pId = editingProduct._id || editingProduct.id
      if (!pId) return
      const selectedCat = categories.find(c => c.slug === editForm.category)
      const mappedCategoryName = selectedCat ? selectedCat.name : editForm.categoryName

      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price),
        oldPrice: editForm.oldPrice ? Number(editForm.oldPrice) : undefined,
        stock: Number(editForm.stock),
        category: editForm.category,
        categoryName: mappedCategoryName,
        brand: editForm.brand,
        status: editForm.status
      }

      await productService.updateProduct(String(pId), payload)
      setSuccess(`Cập nhật sản phẩm "${editForm.title}" thành công!`)
      setIsEditModalOpen(false)
      onRefresh()
    } catch (err: any) {
      console.error('Lỗi cập nhật sản phẩm:', err)
      setEditError(err.response?.data?.error || err.message || 'Không thể cập nhật sản phẩm.')
    } finally {
      setEditSubmitting(false)
    }
  }

  // Quick Toggle Status
  const handleToggleStatus = async (p: any) => {
    const pId = p._id || p.id
    if (!pId) return
    const idStr = String(pId)

    const nextStatus = p.status === 'active' ? 'hidden' : 'active'
    try {
      setActionLoadingId(idStr)
      await productService.updateProductStatus(idStr, nextStatus)
      setSuccess(`Đã chuyển trạng thái sản phẩm "${p.title}" sang ${nextStatus === 'active' ? 'Đang mở bán' : 'Đang ẩn'}.`)
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể cập nhật trạng thái sản phẩm.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Open Delete Prompt
  const handlePromptDelete = (p: any) => {
    setDeletingProduct(p)
    setIsDeleteModalOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return
    const pId = deletingProduct._id || deletingProduct.id
    if (!pId) return
    const idStr = String(pId)
    try {
      setActionLoadingId(idStr)
      const res = await productService.deleteProduct(idStr)
      setSuccess(res.message || `Đã xóa sản phẩm "${deletingProduct.title}" thành công!`)
      setIsDeleteModalOpen(false)
      setDeletingProduct(null)
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể xóa sản phẩm.')
      setIsDeleteModalOpen(false)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered Products for Shop List
  const countActive = allProducts.filter(p => (p.status || 'active') === 'active').length
  const countHidden = allProducts.filter(p => p.status === 'hidden').length
  const countOutOfStock = allProducts.filter(p => p.status === 'out_of_stock').length
  const countInactive = allProducts.filter(p => p.status === 'inactive').length

  const filteredProducts = allProducts.filter(p => {
    const matchSearch = !productSearch.trim() || 
      (p.title && p.title.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    const matchStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter
    return matchSearch && matchStatus
  })

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
          ĐĂNG BÁN & QUẢN LÝ THIẾT BỊ GIAN HÀNG // PRODUCTS MANAGER
        </h3>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
          Chủ shop quản lý danh sách sản phẩm, kiểm soát tồn kho, cập nhật giá và chuyển đổi trạng thái bán.
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WarningCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-sm text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form to Post Product */}
      <form onSubmit={handleCreateProduct} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <FolderPlus size={14} /> // KHAI BÁO THIẾT BỊ ĐĂNG BÁN MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">TÊN THIẾT BỊ / SẢN PHẨM *</span>
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
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">DANH MỤC *</span>
            <select
              required
              value={productForm.category}
              onChange={(e) => {
                const selected = categories.find(c => c.slug === e.target.value)
                setProductForm({ 
                  ...productForm, 
                  category: e.target.value,
                  categoryName: selected ? selected.name : e.target.value
                })
              }}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              {categories.length > 0 ? (
                categories.map(c => (
                  <option key={c._id || c.slug} value={c.slug}>
                    {c.icon ? `${c.icon} ` : ''}{c.name.toUpperCase()}
                  </option>
                ))
              ) : (
                <option value="laptops">LAPTOP & MACBOOK</option>
              )}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">THƯƠNG HIỆU *</span>
            <select
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              {brands.map(b => (
                <option key={b._id || b.slug} value={b.slug}>
                  {b.logo ? `${b.logo} ` : ''}{b.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIÁ BÁN (VND) *</span>
            <input
              type="number"
              required
              min="0"
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
              min="0"
              value={productForm.oldPrice}
              onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
              placeholder="3990000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">SỐ LƯỢNG KHO (TỒN KHO) *</span>
            <input
              type="number"
              required
              min="0"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
              placeholder="50"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">MÃ EMOJI DỰ PHÒNG</span>
            <input
              type="text"
              value={productForm.imageEmoji}
              onChange={(e) => setProductForm({ ...productForm, imageEmoji: e.target.value })}
              placeholder="🖱️"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-4">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">MÔ TẢ CHI TIẾT SẢN PHẨM *</span>
            <textarea
              required
              rows={2}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Mô tả công năng, ngoại hình và điểm vượt trội..."
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>

          {/* Upload ảnh */}
          <div className="md:col-span-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm p-4 text-center space-y-3">
            <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 block uppercase">// TẢI ẢNH THẬT SẢN PHẨM (TỐI ĐA 6 ẢNH)</span>
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
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-sm cursor-pointer disabled:opacity-50"
            >
              {uploadingImages ? 'Đang tải ảnh...' : 'Chọn ảnh từ thiết bị'}
            </button>
            {galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 border rounded-sm overflow-hidden group">
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-black text-[8px] px-1 rounded-sm font-black tracking-widest">MAIN</span>}
                  </div>
                ))}
              </div>
            )}
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

      {/* DANH SÁCH THIẾT BỊ GIAN HÀNG */}
      <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Package size={16} className="text-[#ff4655]" />
            // THIẾT BỊ ĐÃ ĐĂNG BÁN ({filteredProducts.length}/{allProducts.length})
          </h4>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Tìm tên thiết bị, SKU..."
                className="pl-8 pr-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white w-48 focus:outline-none focus:border-[#ff4655]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
            >
              <option value="all">Tất cả ({allProducts.length})</option>
              <option value="active">Đang mở bán ({countActive})</option>
              <option value="hidden">Đang ẩn ({countHidden})</option>
              <option value="out_of_stock">Hết hàng ({countOutOfStock})</option>
              <option value="inactive">Dừng KD ({countInactive})</option>
            </select>
            <button
              onClick={() => onRefresh()}
              title="Tải lại danh sách"
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655] cursor-pointer"
            >
              <ArrowsClockwise size={14} />
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({allProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Đang mở bán ({countActive})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'hidden'
                ? 'bg-amber-500 text-black shadow-sm'
                : countHidden > 0
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/40 hover:bg-amber-500/25 font-black'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-amber-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Đang ẩn ({countHidden})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'out_of_stock'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Hết hàng ({countOutOfStock})
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded text-zinc-500 text-xs">
              {statusFilter === 'hidden'
                ? 'Gian hàng hiện không có sản phẩm nào đang ở trạng thái ẩn.'
                : 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc.'}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const pId = p._id || p.id
              const pStatus = p.status || 'active'

              return (
                <div key={pId} className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-lg flex flex-col justify-between gap-3 relative shadow-sm hover:border-[#ff4655]/40 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-center text-3xl select-none overflow-hidden shrink-0">
                      <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                          {p.categoryName || p.category}
                        </span>
                        {p.brand && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase">
                            {p.brand}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          pStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : pStatus === 'hidden'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : pStatus === 'out_of_stock'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {pStatus === 'active' ? '● Mở bán' : pStatus === 'hidden' ? '○ Đang ẩn' : pStatus === 'out_of_stock' ? '✕ Hết hàng' : 'Ngừng KD'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase truncate pt-1" title={p.title || p.name}>
                        {p.title || p.name}
                      </h4>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                        {p.oldPrice && <span className="text-[10px] text-zinc-400 line-through">{formatPrice(p.oldPrice)}</span>}
                      </div>

                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                        Kho: <strong className="text-zinc-900 dark:text-white">{p.stock}</strong> cái | SKU: {p.sku || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex-wrap">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={actionLoadingId === pId}
                      title={pStatus === 'active' ? 'Ẩn sản phẩm khỏi sàn khách hàng' : 'Mở bán lại sản phẩm cho khách hàng'}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                        pStatus === 'active'
                          ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                          : 'border-emerald-500 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 shadow-sm'
                      }`}
                    >
                      {pStatus === 'active' ? <EyeSlash size={13} /> : <Eye size={13} weight="bold" />}
                      {pStatus === 'active' ? 'Ẩn' : 'Mở bán lại'}
                    </button>

                    <button
                      onClick={() => handleOpenImagesModal(p)}
                      title="Quản lý thư viện hình ảnh sản phẩm (Section 3.6: product_images)"
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-purple-500/20 text-purple-500 hover:bg-purple-500/10"
                    >
                      <Images size={12} /> Ảnh ({p.gallery?.length || (p.imageEmoji ? 1 : 0)})
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(p)}
                      title="Chỉnh sửa sản phẩm"
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-blue-500/20 text-blue-500 hover:bg-blue-500/10"
                    >
                      <PencilSimple size={12} /> Sửa
                    </button>

                    <button
                      onClick={() => handlePromptDelete(p)}
                      disabled={actionLoadingId === pId}
                      title="Xóa sản phẩm"
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-red-500/20 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash size={12} /> Xóa
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* MODAL: CHỈNH SỬA SẢN PHẨM (Yêu cầu 3.5: Chủ shop sửa sản phẩm thuộc shop mình) */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <PencilSimple size={18} className="text-[#ff4655]" />
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    CHỈNH SỬA THÔNG TIN SẢN PHẨM
                  </h4>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-xs font-bold">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Giá bán (VND) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.price}
                      onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Giá cũ (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.oldPrice}
                      onChange={e => setEditForm(prev => ({ ...prev, oldPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Số lượng kho (Tồn kho) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.stock}
                      onChange={e => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Trạng thái bán</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white"
                    >
                      <option value="active">Đang mở bán (active)</option>
                      <option value="hidden">Đang ẩn (hidden)</option>
                      <option value="out_of_stock">Hết hàng (out_of_stock)</option>
                      <option value="inactive">Ngừng kinh doanh (inactive)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Danh mục</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white"
                    >
                      {categories.map(c => (
                        <option key={c._id || c.slug} value={c.slug}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Thương hiệu</label>
                    <select
                      value={editForm.brand}
                      onChange={e => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white"
                    >
                      {brands.map(b => (
                        <option key={b._id || b.slug} value={b.slug}>
                          {b.logo} {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Mô tả sản phẩm</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded font-bold uppercase text-xs text-zinc-400 hover:text-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-4 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded font-bold uppercase text-xs flex items-center gap-1.5"
                  >
                    {editSubmitting && <ArrowsClockwise size={14} className="animate-spin" />}
                    Lưu cập nhật
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: XÁC NHẬN XÓA SẢN PHẨM */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                  <WarningCircle size={24} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                    Xác nhận xóa thiết bị
                  </h4>
                  <p className="text-[10px] text-zinc-400">Kiểm tra lịch sử đơn hàng để bảo vệ toàn vẹn dữ liệu</p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct.title}"</strong> không?
                <br /><br />
                <span className="text-[11px] text-zinc-500 italic">
                  * Lưu ý: Nếu sản phẩm đã từng phát sinh đơn hàng trong quá khứ, hệ thống sẽ tự động chuyển sang trạng thái <strong>"Ngừng kinh doanh" (inactive)</strong> để đảm bảo khách hàng và shop vẫn tra cứu được lịch sử đơn hàng cũ.
                </span>
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded font-bold uppercase text-xs text-zinc-400 hover:text-white"
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoadingId === (deletingProduct._id || deletingProduct.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-xs flex items-center gap-1.5"
                >
                  {actionLoadingId === (deletingProduct._id || deletingProduct.id) && (
                    <ArrowsClockwise size={14} className="animate-spin" />
                  )}
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: QUẢN LÝ HÌNH ẢNH SẢN PHẨM (Section 3.6 - product_images) */}
      <AnimatePresence>
        {isImagesModalOpen && imagesModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#ff4655]/10 rounded-lg border border-[#ff4655]/20 text-[#ff4655]">
                    <Images size={20} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                      QUẢN LÝ THƯ VIỆN HÌNH ẢNH // PRODUCT_IMAGES
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium truncate max-w-md">
                      Thiết bị: <strong className="text-zinc-800 dark:text-zinc-200">{imagesModalProduct.title}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImagesModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Alert Feedback */}
              {imagesModalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-500 flex items-center gap-2">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  <span>{imagesModalError}</span>
                </div>
              )}
              {imagesModalSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-500 flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="shrink-0" />
                  <span>{imagesModalSuccess}</span>
                </div>
              )}

              {/* Thêm ảnh mới (Upload hoặc Dán URL) */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-850 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">// THÊM ẢNH MỚI CHO THIẾT BỊ</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newImageIsPrimary}
                      onChange={e => setNewImageIsPrimary(e.target.checked)}
                      className="rounded border-zinc-700 text-[#ff4655] focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                      <Star size={12} weight="fill" /> Đặt làm ảnh chính ngay
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Upload File Input */}
                  <div className="sm:col-span-5">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleUploadModalFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      disabled={imageActionLoading}
                      className="w-full h-10 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff4655] rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
                    >
                      <UploadSimple size={16} className="text-[#ff4655]" />
                      <span>Tải ảnh từ máy tính</span>
                    </button>
                  </div>

                  {/* URL Input Form */}
                  <form onSubmit={handleAddImageUrl} className="sm:col-span-7 flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://...)"
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                    <button
                      type="submit"
                      disabled={imageActionLoading || !newImageUrl.trim()}
                      className="px-3.5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Plus size={14} weight="bold" /> Thêm
                    </button>
                  </form>
                </div>
              </div>

              {/* Danh sách ảnh hiện có (Sắp xếp, Đặt ảnh chính, Xóa) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    // DANH SÁCH HÌNH ẢNH ({productImagesList.length}) - SẮP XẾP & CHỌN ẢNH ĐẠI DIỆN
                  </h5>
                  {imageActionLoading && (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                      <ArrowsClockwise size={12} className="animate-spin" /> Đang cập nhật...
                    </span>
                  )}
                </div>

                {loadingImages ? (
                  <div className="py-12 text-center text-xs text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
                    <ArrowsClockwise size={20} className="animate-spin text-[#ff4655]" />
                    <span>Đang nạp thư viện ảnh của thiết bị...</span>
                  </div>
                ) : productImagesList.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 text-xs space-y-2">
                    <Images size={28} className="mx-auto text-zinc-600 opacity-60" />
                    <p>Sản phẩm này chưa có hình ảnh nào trong thư viện.</p>
                    <p className="text-[11px] text-zinc-600">Hãy chọn tải ảnh lên từ máy tính hoặc dán URL ở khung phía trên.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productImagesList.map((img, index) => {
                      const isFirst = index === 0
                      const isLast = index === productImagesList.length - 1

                      return (
                        <div
                          key={img._id || index}
                          className={`p-3 rounded-xl border relative flex gap-3 transition-all ${
                            img.isPrimary
                              ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                              : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {/* Image Box with SafeProductImage Fallback */}
                          <div className="w-20 h-20 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 relative">
                            <SafeProductImage
                              src={img.imageUrl}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                <Star size={10} weight="fill" /> CHÍNH
                              </span>
                            )}
                          </div>

                          {/* Info & Action Controls */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-zinc-400">
                                  Thứ tự #{img.sortOrder !== undefined ? img.sortOrder : index}
                                </span>
                                {img.isPrimary ? (
                                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                                    ★ Ảnh đại diện
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(img._id)}
                                    disabled={imageActionLoading}
                                    className="text-[9px] font-bold text-zinc-400 hover:text-amber-500 underline"
                                  >
                                    Đặt làm ảnh chính
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate font-mono" title={img.imageUrl}>
                                {img.imageUrl}
                              </p>
                            </div>

                            {/* Buttons bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-850 mt-1">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'up')}
                                  disabled={isFirst || imageActionLoading}
                                  title="Đưa lên trước"
                                  className="p-1 border border-zinc-200 dark:border-zinc-800 rounded hover:border-[#ff4655] hover:text-[#ff4655] text-zinc-400 disabled:opacity-20"
                                >
                                  <ArrowUp size={12} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(index, 'down')}
                                  disabled={isLast || imageActionLoading}
                                  title="Đưa xuống sau"
                                  className="p-1 border border-zinc-200 dark:border-zinc-800 rounded hover:border-[#ff4655] hover:text-[#ff4655] text-zinc-400 disabled:opacity-20"
                                >
                                  <ArrowDown size={12} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img._id)}
                                disabled={imageActionLoading}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <Trash size={12} /> Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-3 border-t border-zinc-150 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsImagesModalOpen(false)}
                  className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
