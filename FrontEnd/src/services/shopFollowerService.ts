import apiClient from '../api/client'

export const shopFollowerService = {
  // Lấy danh sách shop mà user đang theo dõi
  getMyFollowedShops: async () => {
    const res = await apiClient.get('/shop-followers/my-followed')
    return res.data
  },

  // Kiểm tra trạng thái đã follow shop chưa và đếm số lượng
  checkFollowStatus: async (shopId: string) => {
    const res = await apiClient.get(`/shop-followers/check/${shopId}`)
    return res.data
  },

  // Theo dõi shop
  followShop: async (shopId: string) => {
    const res = await apiClient.post(`/shop-followers/${shopId}`)
    return res.data
  },

  // Bỏ theo dõi shop
  unfollowShop: async (shopId: string) => {
    const res = await apiClient.delete(`/shop-followers/${shopId}`)
    return res.data
  }
}
