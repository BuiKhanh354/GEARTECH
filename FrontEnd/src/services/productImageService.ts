import apiClient from '../api/client';

export interface ProductImageItem {
  _id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImagesResponse {
  productId: string;
  total: number;
  images: ProductImageItem[];
}

export const productImageService = {
  // 1. Lấy toàn bộ ảnh của một sản phẩm
  async getProductImages(productId: string): Promise<ProductImagesResponse> {
    const res = await apiClient.get(`/products/${productId}/images`);
    return res.data;
  },

  // 2. Thêm 1 hoặc nhiều ảnh mới cho sản phẩm
  async addProductImage(
    productId: string, 
    data: { 
      imageUrl?: string; 
      images?: Array<string | { imageUrl: string; isPrimary?: boolean; sortOrder?: number }>; 
      isPrimary?: boolean; 
      sortOrder?: number;
    }
  ) {
    const res = await apiClient.post(`/products/${productId}/images`, data);
    return res.data;
  },

  // 3. Cập nhật thuộc tính ảnh (đặt làm ảnh chính, đổi thứ tự)
  async updateProductImage(
    productId: string, 
    imageId: string, 
    data: { 
      isPrimary?: boolean; 
      sortOrder?: number; 
      imageUrl?: string; 
    }
  ) {
    const res = await apiClient.put(`/products/${productId}/images/${imageId}`, data);
    return res.data;
  },

  // 4. Sắp xếp thứ tự nhiều ảnh
  async reorderProductImages(
    productId: string, 
    orders: Array<{ imageId: string; sortOrder: number }>
  ) {
    const res = await apiClient.put(`/products/${productId}/images/reorder`, { orders });
    return res.data;
  },

  // 5. Xóa ảnh khỏi sản phẩm
  async deleteProductImage(productId: string, imageId: string) {
    const res = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return res.data;
  },

  // 6. Upload file ảnh trực tiếp lên server
  async uploadImages(files: FileList | File[]): Promise<string[]> {
    const formData = new FormData();
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      formData.append('images', file);
    });

    const res = await apiClient.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data.urls || [];
  }
};

export default productImageService;
