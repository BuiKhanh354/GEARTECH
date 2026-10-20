import apiClient from '../api/client'

export const favoriteService = {
  // Lấy danh sách sản phẩm yêu thích của khách hàng
  getMyFavorites: async () => {
    const res = await apiClient.get('/favorites')
    return res.data
  },

  // Kiểm tra sản phẩm đã yêu thích chưa
  checkFavorite: async (productId: string) => {
    const res = await apiClient.get(`/favorites/check/${productId}`)
    return res.data
  },

  // Thêm vào danh sách yêu thích
  addFavorite: async (productId: string) => {
    const res = await apiClient.post(`/favorites/${productId}`)
    return res.data
  },

  // Bỏ yêu thích sản phẩm
  removeFavorite: async (productId: string) => {
    const res = await apiClient.delete(`/favorites/${productId}`)
    return res.data
  }
}
