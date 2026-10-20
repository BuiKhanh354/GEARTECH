// Interface định nghĩa kiểu dữ liệu sản phẩm tương thích
export interface Product {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviewsCount: number;
  salesCount: string;
  imageEmoji: string;
  gallery: string[];
  description: string;
  shop: {
    name: string;
    logo: string;
    rating: string;
    responseRate: string;
    followers: string;
  };
}

// Toàn bộ dữ liệu sản phẩm hiện tại đã được chuyển đổi sang MongoDB và gọi qua API /api/products
export const mockProducts: Product[] = []
