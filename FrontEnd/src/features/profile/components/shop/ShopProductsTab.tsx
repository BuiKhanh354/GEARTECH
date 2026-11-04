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
  Plus,
  Cpu
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { categoryService, type CategoryItem } from '../../../../services/categoryService'
import { brandService, type BrandItem } from '../../../../services/brandService'
import { productService, type ProductItem } from '../../../../services/productService'
import { productImageService, type ProductImageItem } from '../../../../services/productImageService'
import { SafeProductImage } from '../../../../components/common/ProductImage'
import { isImageUrl } from '../../../../utils/image'
import ProductImagesManagerModal from './ProductImagesManagerModal'

export interface SpecRow {
  name: string
  value: string
  placeholder?: string
}

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
    price: '' as number | string,
    hasPromotion: false,
    oldPrice: '' as number | string,
    discount: '',
    category: 'laptops',
    categoryName: 'LAPTOP & MACBOOK',
    brand: 'asus',
    imageEmoji: '💻',
    stock: 20 as number | string,
    isFeatured: false
  })
  
  const [specsList, setSpecsList] = useState<SpecRow[]>([])
  const [loadingSpecsTemplate, setLoadingSpecsTemplate] = useState<boolean>(false)
  const [editSpecsList, setEditSpecsList] = useState<SpecRow[]>([])
  const [loadingEditSpecsTemplate, setLoadingEditSpecsTemplate] = useState<boolean>(false)

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
    price: 0 as number | string,
    hasPromotion: false,
    oldPrice: '' as number | string,
    discount: '',
    stock: 0,
    category: '',
    categoryName: '',
    brand: '',
    status: 'active' as 'active' | 'hidden' | 'out_of_stock' | 'inactive',
    imageEmoji: '📦',
    isFeatured: false
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

  // Load category specs template helper
  const loadCategorySpecs = async (catSlugOrId: string, isForEdit = false) => {
    if (!catSlugOrId) return
    if (isForEdit) setLoadingEditSpecsTemplate(true)
    else setLoadingSpecsTemplate(true)

    try {
      const template = await productService.getCategorySpecifications(catSlugOrId)
      if (template && template.attributes && template.attributes.length > 0) {
        const rows: SpecRow[] = template.attributes.map(attr => ({
          name: attr.name,
          value: '',
          placeholder: attr.placeholder || `Nhập ${attr.name}...`
        }))
        if (isForEdit) {
          setEditSpecsList(rows)
        } else {
          setSpecsList(rows)
        }
      } else {
        const defaultRows: SpecRow[] = [
          { name: 'Thương hiệu / Xuất xứ', value: '', placeholder: 'VD: Chính hãng' },
          { name: 'Bảo hành', value: '', placeholder: 'VD: 12 tháng' },
          { name: 'Tính năng nổi bật', value: '', placeholder: 'VD: Chống nước, RGB...' }
        ]
        if (isForEdit) setEditSpecsList(defaultRows)
        else setSpecsList(defaultRows)
      }
    } catch (err) {
      console.warn('Lỗi nạp template thông số kỹ thuật:', err)
      const fallbackRows: SpecRow[] = [
        { name: 'Bảo hành', value: '', placeholder: 'VD: 12 tháng' },
        { name: 'Tính năng', value: '', placeholder: '' }
      ]
      if (isForEdit) setEditSpecsList(fallbackRows)
      else setSpecsList(fallbackRows)
    } finally {
      if (isForEdit) setLoadingEditSpecsTemplate(false)
      else setLoadingSpecsTemplate(false)
    }
  }

  // Spec row change handlers for Create Product
  const handleAddSpecRow = () => {
    setSpecsList(prev => [...prev, { name: '', value: '', placeholder: 'Giá trị thông số...' }])
  }

  const handleRemoveSpecRow = (index: number) => {
    setSpecsList(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSpecChange = (index: number, field: 'name' | 'value', val: string) => {
    setSpecsList(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: val }
      return updated
    })
  }

  // Spec row change handlers for Edit Product Modal
  const handleAddEditSpecRow = () => {
    setEditSpecsList(prev => [...prev, { name: '', value: '', placeholder: 'Giá trị thông số...' }])
  }

  const handleRemoveEditSpecRow = (index: number) => {
    setEditSpecsList(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleEditSpecChange = (index: number, field: 'name' | 'value', val: string) => {
    setEditSpecsList(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: val }
      return updated
    })
  }

  useEffect(() => {
    categoryService.getCategories()
      .then(cats => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats)
          const targetSlug = productForm.category || cats[0].slug
          if (!productForm.category) {
            setProductForm(prev => ({
              ...prev,
              category: cats[0].slug,
              categoryName: cats[0].name
            }))
          }
          // Tự động nạp danh sách thuộc tính kỹ thuật mẫu cho danh mục khởi tạo
          loadCategorySpecs(targetSlug, false)
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

    const numPrice = Number(productForm.price)
    if (isNaN(numPrice) || numPrice < 0 || productForm.price === '') {
      setError('Vui lòng nhập giá bán sản phẩm hợp lệ.')
      setSubmitting(false)
      return
    }

    let finalOldPrice: number | undefined = undefined
    let finalDiscount: string | undefined = undefined

    if (productForm.hasPromotion) {
      const numOldPrice = Number(productForm.oldPrice)
      if (isNaN(numOldPrice) || numOldPrice <= numPrice || productForm.oldPrice === '') {
        setError('Khi áp dụng khuyến mãi, giá gốc niêm yết phải lớn hơn giá bán khuyến mãi.')
        setSubmitting(false)
        return
      }
      finalOldPrice = numOldPrice
      finalDiscount = `${Math.round((1 - numPrice / numOldPrice) * 100)}%`
    }

    const validSpecs = specsList.filter(s => s.name.trim() && s.value.trim())
    const specsMap: Record<string, string> = {}
    const specificationsArray: { name: string; value: string }[] = []
    validSpecs.forEach(s => {
      const k = s.name.trim()
      const v = s.value.trim()
      specsMap[k] = v
      specificationsArray.push({ name: k, value: v })
    })

    const selectedCat = categories.find(c => c.slug === productForm.category)
    const mappedCategoryName = selectedCat ? selectedCat.name : productForm.categoryName

    const payload = {
      title: productForm.title,
      description: productForm.description,
      price: numPrice,
      oldPrice: finalOldPrice,
      discount: finalDiscount,
      category: productForm.category,
      categoryName: mappedCategoryName,
      brand: productForm.brand,
      imageEmoji: productForm.imageEmoji,
      gallery: galleryUrls.length > 0 ? galleryUrls : [productForm.imageEmoji],
      stock: Number(productForm.stock),
      isFeatured: Boolean(productForm.isFeatured),
      specs: specsMap,
      specifications: specificationsArray
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
      
      const defaultCategory = categories.length > 0 ? categories[0].slug : 'laptops'
      setProductForm({
        title: '',
        description: '',
        price: '',
        hasPromotion: false,
        oldPrice: '',
        discount: '',
        category: defaultCategory,
        categoryName: categories.length > 0 ? categories[0].name : 'LAPTOP & MACBOOK',
        brand: brands.length > 0 ? brands[0].slug : 'asus',
        imageEmoji: '📦',
        stock: 20,
        isFeatured: false
      })
      setGalleryUrls([])
      loadCategorySpecs(defaultCategory, false)

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
    const hasPromo = Boolean(p.oldPrice && p.oldPrice > p.price)
    setEditForm({
      title: p.title || p.name || '',
      description: p.description || '',
      price: p.price ?? 0,
      hasPromotion: hasPromo,
      oldPrice: hasPromo ? (p.oldPrice ?? '') : '',
      discount: hasPromo ? (p.discount || '') : '',
      stock: p.stock ?? 10,
      category: p.category || 'accessories',
      categoryName: p.categoryName || '',
      brand: p.brand || 'asus',
      status: p.status || 'active',
      imageEmoji: p.imageEmoji || '📦',
      isFeatured: Boolean(p.isFeatured)
    })

    // Nạp thông số kỹ thuật hiện có của sản phẩm
    let initialSpecs: SpecRow[] = []
    if (p.specifications && Array.isArray(p.specifications) && p.specifications.length > 0) {
      initialSpecs = p.specifications
        .filter((s: any) => s && s.name && s.value)
        .map((s: any) => ({
          name: String(s.name),
          value: String(s.value),
          placeholder: ''
        }))
    } else if (p.specs) {
      const obj = p.specs instanceof Map ? Object.fromEntries(p.specs) : p.specs
      if (typeof obj === 'object') {
        initialSpecs = Object.entries(obj)
          .filter(([k, v]) => k && v)
          .map(([k, v]) => ({
            name: String(k),
            value: String(v),
            placeholder: ''
          }))
      }
    }

    if (initialSpecs.length > 0) {
      setEditSpecsList(initialSpecs)
    } else {
      // Nếu sản phẩm cũ chưa có specs thì nạp theo template danh mục
      loadCategorySpecs(p.category || 'laptops', true)
    }

    setEditError(null)
    setIsEditModalOpen(true)
  }

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setEditError(null)
    setEditSubmitting(true)

    const numPrice = Number(editForm.price)
    if (isNaN(numPrice) || numPrice < 0) {
      setEditError('Giá bán sản phẩm không hợp lệ.')
      setEditSubmitting(false)
      return
    }

    let finalOldPrice: number | null = null
    let finalDiscount: string | null = null

    if (editForm.hasPromotion) {
      const numOldPrice = Number(editForm.oldPrice)
      if (isNaN(numOldPrice) || numOldPrice <= numPrice || editForm.oldPrice === '') {
        setEditError('Khi áp dụng khuyến mãi, giá gốc niêm yết phải lớn hơn giá bán khuyến mãi.')
        setEditSubmitting(false)
        return
      }
      finalOldPrice = numOldPrice
      finalDiscount = `${Math.round((1 - numPrice / numOldPrice) * 100)}%`
    }

    try {
      const pId = editingProduct._id || editingProduct.id
      if (!pId) return
      const selectedCat = categories.find(c => c.slug === editForm.category)
      const mappedCategoryName = selectedCat ? selectedCat.name : editForm.categoryName

      const validSpecs = editSpecsList.filter(s => s.name.trim() && s.value.trim())
      const specsMap: Record<string, string> = {}
      const specificationsArray: { name: string; value: string }[] = []
      validSpecs.forEach(s => {
        const k = s.name.trim()
        const v = s.value.trim()
        specsMap[k] = v
        specificationsArray.push({ name: k, value: v })
      })

      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: numPrice,
        oldPrice: finalOldPrice,
        discount: finalDiscount,
        stock: Number(editForm.stock),
        category: editForm.category,
        categoryName: mappedCategoryName,
        brand: editForm.brand,
        status: editForm.status,
        isFeatured: Boolean(editForm.isFeatured),
        specs: specsMap,
        specifications: specificationsArray
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

  // Bật/tắt ghim sản phẩm nổi bật của shop
  const handleToggleFeatured = async (p: any) => {
    const pId = p._id || p.id
    if (!pId) return
    const idStr = String(pId)
    const nextFeatured = !p.isFeatured
    try {
      setActionLoadingId(idStr)
      await productService.updateProduct(idStr, { isFeatured: nextFeatured })
      setSuccess(`Đã ${nextFeatured ? 'ghim' : 'bỏ ghim'} sản phẩm "${p.title}" vào mục Nổi bật của gian hàng!`)
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể cập nhật trạng thái nổi bật.')
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
                const selectedSlug = e.target.value
                const selected = categories.find(c => c.slug === selectedSlug)
                setProductForm({ 
                  ...productForm, 
                  category: selectedSlug,
                  categoryName: selected ? selected.name : selectedSlug
                })
                loadCategorySpecs(selectedSlug, false)
              }}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
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
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">
              {productForm.hasPromotion ? 'GIÁ KHUYẾN MÃI (VND) *' : 'GIÁ BÁN (VND) *'}
            </span>
            <input
              type="number"
              required
              min="0"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder="Ví dụ: 2500000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            {productForm.hasPromotion ? (
              <>
                <div className="flex items-center justify-between absolute left-3 right-3 top-1.5 text-[7px] font-mono tracking-wider">
                  <span className="text-zinc-455 dark:text-zinc-655">GIÁ GỐC NIÊM YẾT (VND) *</span>
                  <button 
                    type="button" 
                    onClick={() => setProductForm({ ...productForm, hasPromotion: false, oldPrice: '', discount: '' })}
                    className="text-red-500 hover:underline uppercase text-[8px] font-bold"
                  >
                    Tắt KM
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  required={productForm.hasPromotion}
                  value={productForm.oldPrice}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value)
                    const pNum = Number(productForm.price)
                    let disc = ''
                    if (typeof val === 'number' && val > pNum && pNum > 0) {
                      disc = `${Math.round((1 - pNum / val) * 100)}%`
                    }
                    setProductForm({ ...productForm, oldPrice: val, discount: disc })
                  }}
                  placeholder="Ví dụ: 3000000"
                  className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-amber-300 dark:border-amber-700/60 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer h-full px-3 py-2.5 rounded-sm border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff4655]/60 bg-white dark:bg-zinc-955 transition-colors">
                <input
                  type="checkbox"
                  checked={productForm.hasPromotion}
                  onChange={(e) => setProductForm({ ...productForm, hasPromotion: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ff4655] accent-[#ff4655] cursor-pointer"
                />
                <div className="leading-tight">
                  <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">
                    + Thêm giá khuyến mãi
                  </span>
                  <span className="text-[8px] text-zinc-400 font-mono block">
                    (Không bắt buộc)
                  </span>
                </div>
              </label>
            )}
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

          {productForm.hasPromotion && Number(productForm.oldPrice) > Number(productForm.price) && Number(productForm.price) > 0 && (
            <div className="md:col-span-4 px-3 py-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                🔥 Khuyến mãi: Giảm {Math.round((1 - Number(productForm.price) / Number(productForm.oldPrice)) * 100)}%
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Tiết kiệm cho khách: {(Number(productForm.oldPrice) - Number(productForm.price)).toLocaleString()} đ
              </span>
            </div>
          )}
          {productForm.hasPromotion && productForm.oldPrice !== '' && Number(productForm.oldPrice) <= Number(productForm.price) && (
            <div className="md:col-span-4 px-3 py-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
              <WarningCircle size={14} />
              <span>Giá gốc niêm yết phải lớn hơn giá bán khuyến mãi ({formatPrice(Number(productForm.price))})</span>
            </div>
          )}
          <div className="md:col-span-4">
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
              <input
                type="checkbox"
                checked={productForm.isFeatured}
                onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Star size={14} weight="fill" /> Đặt làm Sản phẩm Nổi bật (Featured)
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Tích chọn để sản phẩm được ưu tiên đưa vào mục "Sản phẩm nổi bật" ở đầu trang gian hàng của Shop.
                </span>
              </div>
            </label>
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

          {/* THÔNG SỐ KỸ THUẬT (SPECIFICATIONS) */}
          <div className="md:col-span-4 border border-zinc-200 dark:border-zinc-800 rounded-sm p-4 bg-white/60 dark:bg-zinc-950/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-200 dark:border-zinc-850">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-[#ff4655]" weight="bold" />
                  <span className="text-[11px] font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    THÔNG SỐ KỸ THUẬT SẢN PHẨM
                  </span>
                  <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
                    {specsList.length} thông số
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Đặc tả cấu hình phần cứng hoặc thông số kỹ thuật chi tiết giúp khách hàng dễ dàng tìm kiếm và đối chiếu.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadCategorySpecs(productForm.category, false)}
                  disabled={loadingSpecsTemplate}
                  className="px-2.5 py-1.5 text-[9px] font-mono border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 rounded text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Tự động nạp mẫu thông số chuẩn theo danh mục đang chọn"
                >
                  <ArrowsClockwise size={13} className={loadingSpecsTemplate ? 'animate-spin text-[#ff4655]' : ''} />
                  {loadingSpecsTemplate ? 'Đang nạp mẫu...' : 'Tải lại mẫu danh mục'}
                </button>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="px-2.5 py-1.5 text-[9px] font-bold bg-[#ff4655]/10 hover:bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} weight="bold" />
                  + Thêm thông số
                </button>
              </div>
            </div>

            {specsList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 text-xs">
                <p className="font-medium">Chưa có thông số kỹ thuật nào.</p>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="mt-2 text-[#ff4655] hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus size={12} weight="bold" /> Bấm vào đây để thêm thông số đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {specsList.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                  >
                    <div className="w-1/3 min-w-[105px]">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                        placeholder="Tên thông số (CPU, RAM...)"
                        className="w-full text-xs font-bold px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder={spec.placeholder || 'Giá trị thông số...'}
                        className="w-full text-xs px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Xóa thông số này"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 uppercase flex items-center gap-0.5">
                            <Star size={10} weight="fill" /> Nổi bật
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
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="text-[10px] text-zinc-400 line-through">{formatPrice(p.oldPrice)}</span>
                        )}
                        {p.discount && p.oldPrice && p.oldPrice > p.price && (
                          <span className="text-[9px] bg-red-100 text-[#ff4655] dark:bg-red-950/40 px-1 py-0.5 rounded font-black font-mono">
                            {p.discount}
                          </span>
                        )}
                      </div>

                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                        Kho: <strong className="text-zinc-900 dark:text-white">{p.stock}</strong> cái | SKU: {p.sku || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex-wrap">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      disabled={actionLoadingId === pId}
                      title={p.isFeatured ? 'Bỏ ghim khỏi mục Nổi bật' : 'Ghim sản phẩm vào mục Nổi bật trên trang gian hàng'}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                        p.isFeatured
                          ? 'border-amber-500/40 bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 shadow-sm'
                          : 'border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30'
                      }`}
                    >
                      <Star size={13} weight={p.isFeatured ? 'fill' : 'regular'} />
                      {p.isFeatured ? 'Nổi bật' : 'Ghim'}
                    </button>

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
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-zinc-500">
                      {editForm.hasPromotion ? 'Giá khuyến mãi (VND) *' : 'Giá bán (VND) *'}
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      <input
                        type="checkbox"
                        checked={editForm.hasPromotion}
                        onChange={e => {
                          const checked = e.target.checked
                          setEditForm(prev => ({
                            ...prev,
                            hasPromotion: checked,
                            oldPrice: checked ? prev.oldPrice : '',
                            discount: checked ? prev.discount : ''
                          }))
                        }}
                        className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                      <span>Áp dụng khuyến mãi</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editForm.price}
                        onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white"
                        placeholder="Giá bán"
                      />
                    </div>
                    <div>
                      {editForm.hasPromotion ? (
                        <input
                          type="number"
                          min="0"
                          required
                          value={editForm.oldPrice}
                          onChange={e => {
                            const val = e.target.value === '' ? '' : Number(e.target.value)
                            const pNum = Number(editForm.price)
                            let disc = ''
                            if (typeof val === 'number' && val > pNum && pNum > 0) {
                              disc = `${Math.round((1 - pNum / val) * 100)}%`
                            }
                            setEditForm(prev => ({ ...prev, oldPrice: val, discount: disc }))
                          }}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-amber-400 dark:border-amber-600 rounded font-mono text-zinc-900 dark:text-white"
                          placeholder="Giá gốc niêm yết"
                        />
                      ) : (
                        <div className="flex items-center h-full px-3 py-2 bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] text-zinc-400 italic">
                          Không có khuyến mãi
                        </div>
                      )}
                    </div>
                  </div>
                  {editForm.hasPromotion && Number(editForm.oldPrice) > Number(editForm.price) && Number(editForm.price) > 0 && (
                    <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      🔥 Giảm {Math.round((1 - Number(editForm.price) / Number(editForm.oldPrice)) * 100)}% (Tiết kiệm {(Number(editForm.oldPrice) - Number(editForm.price)).toLocaleString()} đ)
                    </p>
                  )}
                  {editForm.hasPromotion && editForm.oldPrice !== '' && Number(editForm.oldPrice) <= Number(editForm.price) && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      ⚠️ Giá gốc niêm yết phải lớn hơn giá bán khuyến mãi ({formatPrice(Number(editForm.price))})
                    </p>
                  )}
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
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={editForm.isFeatured}
                      onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Star size={13} weight="fill" /> Đặt làm Sản phẩm Nổi bật (Featured)
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        Ghim sản phẩm ưu tiên xuất hiện trong mục "Sản phẩm nổi bật" ở đầu trang gian hàng.
                      </span>
                    </div>
                  </label>
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

                {/* THÔNG SỐ KỸ THUẬT (SPECIFICATIONS) TRONG MODAL SỬA */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-sm p-3 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={14} className="text-[#ff4655]" weight="bold" />
                      <span className="text-[10px] font-mono uppercase text-zinc-800 dark:text-zinc-200 font-bold">
                        Thông số kỹ thuật ({editSpecsList.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadCategorySpecs(editForm.category, true)}
                        disabled={loadingEditSpecsTemplate}
                        className="px-2 py-1 text-[8px] font-mono border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 rounded text-zinc-600 dark:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        title="Nạp mẫu thông số chuẩn theo danh mục"
                      >
                        <ArrowsClockwise size={10} className={loadingEditSpecsTemplate ? 'animate-spin text-[#ff4655]' : ''} />
                        Nạp mẫu danh mục
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEditSpecRow}
                        className="px-2 py-1 text-[8px] font-bold bg-[#ff4655]/10 hover:bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30 rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={10} weight="bold" />
                        + Thêm thông số
                      </button>
                    </div>
                  </div>

                  {editSpecsList.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded text-zinc-500 text-xs">
                      <p className="text-[10px] italic">Chưa có thông số kỹ thuật nào.</p>
                      <button
                        type="button"
                        onClick={handleAddEditSpecRow}
                        className="mt-1.5 text-[#ff4655] hover:underline font-bold text-[10px] cursor-pointer"
                      >
                        + Bấm vào đây để thêm thông số
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {editSpecsList.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={spec.name}
                            onChange={(e) => handleEditSpecChange(idx, 'name', e.target.value)}
                            placeholder="Tên thông số"
                            className="w-1/3 text-xs font-bold px-2 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleEditSpecChange(idx, 'value', e.target.value)}
                            placeholder={spec.placeholder || 'Giá trị thông số...'}
                            className="flex-1 text-xs px-2 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditSpecRow(idx)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                            title="Xóa thông số này"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
      <ProductImagesManagerModal
        isOpen={isImagesModalOpen}
        product={imagesModalProduct}
        images={productImagesList}
        loading={loadingImages}
        busy={imageActionLoading}
        error={imagesModalError}
        success={imagesModalSuccess}
        newImageUrl={newImageUrl}
        newImageIsPrimary={newImageIsPrimary}
        fileInputRef={modalFileInputRef}
        onOpenChange={setIsImagesModalOpen}
        onNewImageUrlChange={setNewImageUrl}
        onNewImageIsPrimaryChange={setNewImageIsPrimary}
        onUploadFiles={handleUploadModalFiles}
        onAddImageUrl={handleAddImageUrl}
        onSetPrimaryImage={handleSetPrimaryImage}
        onMoveImage={handleMoveImage}
        onDeleteImage={handleDeleteImage}
      />
    </motion.div>
  )
}
