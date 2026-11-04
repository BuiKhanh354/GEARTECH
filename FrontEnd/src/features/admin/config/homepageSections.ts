import { Package, SquaresFour, Images, Flame, Sparkle, Storefront, Tag } from '@phosphor-icons/react'
import type { HomepageSection, SectionConfig, SectionType } from '../../../services/homepageService'

export type HomepageCategoryOption = {
  _id: string
  name: string
  slug: string
  parent_id: string | null
  productCount?: number
}

export const SECTION_TYPE_INFO: Record<SectionType, { label: string; icon: typeof Package; color: string; desc: string }> = {
  category_products: {
    label: 'Sản phẩm theo danh mục',
    icon: Package,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    desc: 'Lấy sản phẩm thực tế theo danh mục MongoDB (PC, Laptop, Mac, Linh kiện...) có bộ lọc và sắp xếp.'
  },
  banner_slider: {
    label: 'Banner quảng bá',
    icon: Images,
    color: 'text-[#ff4655] bg-[#ff4655]/10 border-[#ff4655]/30',
    desc: 'Banner kép hoặc đơn phong cách Esports, hỗ trợ upload ảnh, nút CTA và hẹn giờ chiến dịch.'
  },
  flash_sale: {
    label: 'Giờ vàng Flash Deals',
    icon: Flame,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    desc: 'Khu vực giảm giá sốc với bộ đếm ngược thời gian thực và huy hiệu ưu đãi.'
  },
  category_grid: {
    label: 'Lưới phân khu danh mục',
    icon: SquaresFour,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    desc: '10 phân khu công nghệ chuyên sâu dưới dạng thẻ kính Glassmorphism.'
  },
  featured_products: {
    label: 'Bộ sưu tập Flagship',
    icon: Sparkle,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    desc: 'Showcase các thiết bị công nghệ hàng đầu được tuyển chọn.'
  },
  featured_shops: {
    label: 'Gian hàng đối tác',
    icon: Storefront,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
    desc: 'Gian hàng chính hãng liên minh với chứng nhận huy hiệu xanh.'
  },
  service_features: {
    label: 'Trụ cột dịch vụ & Đặc quyền',
    icon: Tag,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    desc: '3 Trụ cột dịch vụ: Trả góp 0%, Bảo hành 1 đổi 1 30 ngày, Giao hỏa tốc 2H.'
  }
}

export function createHomepageSection(
  type: SectionType,
  categories: HomepageCategoryOption[],
  order: number
): HomepageSection {
  const typeInfo = SECTION_TYPE_INFO[type]
  const newKey = `sec_${type}_${Date.now()}`

  let initialConfig: SectionConfig
  if (type === 'category_products') {
    const firstCat = categories[0]
    initialConfig = {
      categoryId: firstCat?._id || null,
      categorySlug: firstCat?.slug || '',
      categoryName: firstCat?.name || '',
      includeChildren: true,
      limit: 8,
      sortBy: 'newest',
      showOutOfStock: false,
      showViewAll: true,
      viewAllLink: firstCat ? `/ProductPage?category=${firstCat.slug}` : '/ProductPage'
    }
  } else if (type === 'banner_slider') {
    initialConfig = {
      banners: [
        {
          title: 'KHUYẾN MÃI CÔNG NGHỆ MỚI',
          badge: 'GEARTECH EXCLUSIVE',
          subtitle: 'ƯU ĐÃI ĐỘC QUYỀN',
          description: 'Khám phá ngay các dòng sản phẩm máy tính và phụ kiện công nghệ hàng đầu.',
          priceTag: 'Giá siêu tốt',
          ctaText: 'Khám phá ngay',
          link: '/ProductPage',
          imageUrl: '',
          bgGradient: 'from-zinc-950 via-zinc-900 to-black',
          status: 'active'
        }
      ]
    }
  } else if (type === 'flash_sale') {
    initialConfig = {
      tagline: 'CẬP NHẬT GIÁ SỐC MỖI 24 GIỜ',
      countdownEnd: new Date(Date.now() + 86400000).toISOString(),
      limit: 5
    }
  } else {
    initialConfig = { limit: 8 }
  }

  const newSection: HomepageSection = {
    sectionKey: newKey,
    title: typeInfo.label,
    subtitle: typeInfo.desc.slice(0, 60),
    type,
    status: 'active',
    order,
    schedule: { isScheduled: false, startDate: null, endDate: null },
    config: initialConfig
  }
  return newSection
}
