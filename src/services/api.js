

import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/tymelesstyre'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// API methods
export default {
  // ===========================
  // USER MANAGEMENT ENDPOINTS
  // ===========================

  // Register a new user
  async registerUser(userData) {
    const response = await api.post('/user/register', userData)
    return response.data
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/user/login', credentials)
    return response.data
  },

  // Get current user profile (using JWT token)
  async getCurrentUserProfile() {
    const response = await api.get('/user/profile')
    return response.data
  },

  // Get user by username
  async getUserByUsername(username) {
    const response = await api.get(`/user/readByUsername/${encodeURIComponent(username)}`)
    return response.data
  },

  // Get user by ID
  async getUserById(userId) {
    const response = await api.get(`/user/read/${userId}`)
    return response.data
  },

  // Update user profile
  async updateUser(id, userData) {
    const response = await api.put(`/user/update/${id}`, userData)
    return response.data
  },

  // Change user password
  async changePassword(id, passwordData) {
    const response = await api.put(`/user/change-password/${id}`, passwordData)
    return response.data
  },

  // Admin: Get all users
  async getAllUsers() {
    const response = await api.get('/user/getAll')
    return response.data
  },

  // Admin: Create user
  async createUser(userData) {
    const response = await api.post('/user/create', userData)
    return response.data
  },

  // Admin: Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/user/delete/${userId}`)
    return response.data
  },

  // ===========================
  // ORDER MANAGEMENT ENDPOINTS
  // ===========================

  // Create a new order
  async createOrder(orderData) {
    try {
      const response = await api.post('/api/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Failed to create order:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  },

  // Get current user's orders (customer)
  async getMyOrders() {
    try {
      console.log('API: Making request to /api/orders/my-orders')
      const response = await api.get('/api/orders/my-orders')
      console.log('API: getMyOrders response:', response)
      console.log('API: getMyOrders response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('API: getMyOrders error:', error)
      throw error
    }
  },

  // Get order by ID (with permission check)
  async getOrderById(orderId) {
    const response = await api.get(`/api/orders/${orderId}`)
    return response.data
  },

  // Update order
  async updateOrder(orderId, orderData) {
    const response = await api.put(`/api/orders/${orderId}`, orderData)
    return response.data
  },

  // Admin: Get all orders
  async getAllOrdersForAdmin() {
    try {
      console.log('API: Making request to /api/orders/all')
      const response = await api.get('/api/orders/all')
      console.log('API: getAllOrdersForAdmin response:', response)
      console.log('API: getAllOrdersForAdmin response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('API: getAllOrdersForAdmin error:', error)
      throw error
    }
  },

  // Admin: Get orders by user ID
  async getOrdersByUserId(userId) {
    const response = await api.get(`/api/orders/user/${userId}`)
    return response.data
  },

  // Admin: Get orders by status
  async getOrdersByStatus(status) {
    const response = await api.get(`/api/orders/status/${status}`)
    return response.data
  },

  // Admin: Delete order
  async deleteOrder(orderId) {
    const response = await api.delete(`/api/orders/${orderId}`)
    return response.data
  },

  // Admin: Update order status
  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/api/orders/${orderId}/status`, { status })
    return response.data
  },

  // ===========================
  // PRODUCT ENDPOINTS
  // ===========================
  async getAllProducts() {
    const response = await api.get('/api/products')
    return response.data
  },

  async createProductWithImage(formData) {
    const response = await api.post('/api/products/create-with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/api/products/${productId}`)
    return response.data
  },

  async updateProduct(productId, productData) {
    const response = await api.put(`/api/products/${productId}`, productData)
    return response.data
  },

  async getTyreById(id) {
    const response = await api.get(`/api/tyres/${id}`)
    return response.data
  },

  async createTyre(tyreData) {
    const response = await api.post('/api/tyres', tyreData)
    return response.data
  },

  async createTyresBulk(tyresData) {
    const response = await api.post('/api/tyres/bulk', tyresData)
    return response.data
  },

  // ===========================
  // REVIEW ENDPOINTS
  // ===========================

  // Create a review for a specific order-product combination
  async createReview(orderId, productId, comment, rating) {
    const response = await api.post('/api/reviews/create', {
      orderId,
      productId,
      comment,
      rating
    })
    return response.data
  },

  // Check if user can review a product (general check)
  async canReviewProduct(productId) {
    const response = await api.get(`/api/reviews/can-review/${productId}`)
    return response.data
  },

  // Check if user can review specific order-product combination
  async canReviewOrderProduct(orderId, productId) {
    const response = await api.get(`/api/reviews/can-review-order/${orderId}/product/${productId}`)
    return response.data
  },

  // Get all delivered orders that can be reviewed
  async getReviewableOrders() {
    const response = await api.get('/api/reviews/reviewable-orders')
    return response.data
  },

  // Get products that can be reviewed for a specific order
  async getReviewableProductsForOrder(orderId) {
    const response = await api.get(`/api/reviews/reviewable-products/order/${orderId}`)
    return response.data
  },

  // Get user's own reviews
  async getMyReviews() {
    const response = await api.get('/api/reviews/my-reviews')
    return response.data
  },

  // Get all reviews for a product (public)
  async getProductReviews(productId) {
    const response = await api.get(`/api/reviews/product/${productId}`)
    return response.data
  },

  // Get average rating for a product
  async getAverageRating(productId) {
    const response = await api.get(`/api/reviews/product/${productId}/average-rating`)
    return response.data
  },

  // ===========================
  // ADDRESS MANAGEMENT ENDPOINTS
  // ===========================

  // Get user addresses
  async getUserAddresses(userId) {
    const response = await api.get(`/api/addresses/user/${userId}`)
    return response.data
  },

  // Get addresses by type
  async getUserAddressesByType(userId, addressType) {
    const response = await api.get(`/api/addresses/user/${userId}/type/${addressType}`)
    return response.data
  },

  // Create new address
  async createAddress(addressData) {
    const response = await api.post('/api/addresses', addressData)
    return response.data
  },

  // Update address
  async updateAddress(addressId, addressData) {
    const response = await api.put(`/api/addresses/${addressId}`, addressData)
    return response.data
  },

  // Delete address
  async deleteAddress(addressId, userId) {
    const response = await api.delete(`/api/addresses/${addressId}/user/${userId}`)
    return response.data
  },

  // Check if user has addresses
  async userHasAddresses(userId) {
    const response = await api.get(`/api/addresses/user/${userId}/exists`)
    return response.data
  },

  // Get available address types
  async getAddressTypes() {
    const response = await api.get('/api/addresses/types')
    return response.data
  },

  // ===========================
  // PAYMENT SYSTEM ENDPOINTS
  // ===========================

  // Create Cash on Delivery payment
  async createCashOnDeliveryPayment(orderId, userId) {
    const response = await api.post('/api/payments/cash-on-delivery', {
      orderId,
      userId
    })
    return response.data
  },

  // Create Cash on Collection payment
  async createCashOnCollectionPayment(orderId, userId) {
    const response = await api.post('/api/payments/cash-on-collection', {
      orderId,
      userId
    })
    return response.data
  },

  // Get payment by order
  async getPaymentByOrder(orderId) {
    const response = await api.get(`/api/payments/order/${orderId}`)
    return response.data
  },

  // Get user payments
  async getUserPayments(userId) {
    const response = await api.get(`/api/payments/user/${userId}`)
    return response.data
  },

  // Update payment status (Admin)
  async updatePaymentStatus(paymentId, status) {
    const response = await api.put(`/api/payments/${paymentId}/status`, {
      status
    })
    return response.data
  },

  // Get available payment methods
  async getPaymentMethods() {
    const response = await api.get('/api/payments/methods')
    return response.data
  },

  // Get payment statuses
  async getPaymentStatuses() {
    const response = await api.get('/api/payments/statuses')
    return response.data
  },

  // ===========================
  // DELIVERY SYSTEM ENDPOINTS
  // ===========================

  // Create delivery
  async createDelivery(deliveryData) {
    const response = await api.post('/api/deliveries', deliveryData)
    return response.data
  },

  // Get delivery by order
  async getDeliveryByOrder(orderId) {
    const response = await api.get(`/api/deliveries/order/${orderId}`)
    return response.data
  },

  // Update delivery status (Admin)
  async updateDeliveryStatus(deliveryId, status) {
    const response = await api.put(`/api/deliveries/${deliveryId}/status`, {
      status
    })
    return response.data
  },

  // Update payment status by order ID (wrapper method)
  async updateOrderPaymentStatus(orderId, status) {
    try {
      // Step 1: Get payment info by order ID
      const payment = await api.get(`/api/payments/order/${orderId}`)

      // Step 2: Update payment status by payment ID
      const response = await api.put(`/api/payments/${payment.data.paymentId}/status`, {
        status
      })
      return response.data
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  },

  // Update delivery status by order ID (wrapper method)
  async updateOrderDeliveryStatus(orderId, status) {
    try {
      // Step 1: Get delivery info by order ID
      const delivery = await api.get(`/api/deliveries/order/${orderId}`)

      // Step 2: Update delivery status by delivery ID
      const response = await api.put(`/api/deliveries/${delivery.data.deliveryId}/status`, {
        status
      })
      return response.data
    } catch (error) {
      console.error('Error updating delivery status:', error)
      throw error
    }
  },

  // Get delivery information by order ID
  async getDeliveryByOrderId(orderId) {
    const response = await api.get(`/api/deliveries/order/${orderId}`)
    return response.data
  },

  // Get payment information by order ID
  async getPaymentByOrderId(orderId) {
    const response = await api.get(`/api/payments/order/${orderId}`)
    return response.data
  },

  // Update courier info (Admin)
  async updateDeliveryCourier(deliveryId, courierName) {
    const response = await api.put(`/api/deliveries/${deliveryId}/courier`, {
      courierName
    })
    return response.data
  },

  // Check if ready for collection
  async isReadyForCollection(deliveryId) {
    const response = await api.get(`/api/deliveries/${deliveryId}/ready-for-collection`)
    return response.data
  },

  // Check if delivery completed
  async isDeliveryCompleted(deliveryId) {
    const response = await api.get(`/api/deliveries/${deliveryId}/completed`)
    return response.data
  },

  // Get available delivery methods
  async getDeliveryMethods() {
    const response = await api.get('/api/deliveries/methods')
    return response.data
  },

  // Get delivery statuses
  async getDeliveryStatuses() {
    const response = await api.get('/api/deliveries/statuses')
    return response.data
  },

  // ===========================
  // ENHANCED ORDER MANAGEMENT
  // ===========================

  // Create complete order (Recommended)
  async createCompleteOrder(orderData) {
    const response = await api.post('/api/orders/complete', orderData)
    return response.data
  },

  // Get complete order details
  async getCompleteOrderDetails(orderId) {
    try {
      // Use longer timeout for order details as it may involve complex data fetching
      const response = await api.get(`/api/orders/${orderId}/complete`, {
        timeout: 30000 // 30 seconds timeout for order details
      })
      return response.data
    } catch (error) {
      // Log the actual error for debugging
      console.error('Failed to fetch order details:', {
        orderId,
        error: error.message,
        status: error.response?.status,
        timeout: error.code === 'ECONNABORTED'
      })
      throw error
    }
  },

  // Check delivery readiness
  async checkDeliveryReadiness(userId) {
    const response = await api.get(`/api/orders/user/${userId}/delivery-ready`)
    return response.data
  },

  // ===========================
  // ADMIN MANAGEMENT ENDPOINTS
  // ===========================

  // Create new admin user (requires ADMIN role)
  async createAdmin(adminData) {
    try {
      console.log('API: Creating new admin user:', adminData.username)
      const response = await api.post('/api/admin-setup/create-admin', adminData)
      console.log('API: createAdmin response:', response)
      return response.data
    } catch (error) {
      console.error('API: createAdmin error:', error)
      throw error
    }
  },

  // Fetch all admin users (requires ADMIN role)
  async fetchAdmins() {
    try {
      console.log('API: Fetching all admin users')
      const response = await api.get('/api/admin-setup/admins')
      console.log('API: fetchAdmins response:', response)
      return response.data
    } catch (error) {
      console.error('API: fetchAdmins error:', error)
      throw error
    }
  },

  // Check admin setup status (no auth required)
  async checkAdminSetupStatus() {
    try {
      console.log('API: Checking admin setup status')
      const response = await api.get('/api/admin-setup/status')
      console.log('API: checkAdminSetupStatus response:', response)
      return response.data
    } catch (error) {
      console.error('API: checkAdminSetupStatus error:', error)
      throw error
    }
  },

  // Get admin setup instructions (no auth required)
  async getAdminSetupInstructions() {
    try {
      console.log('API: Getting admin setup instructions')
      const response = await api.get('/api/admin-setup/instructions')
      console.log('API: getAdminSetupInstructions response:', response)
      return response.data
    } catch (error) {
      console.error('API: getAdminSetupInstructions error:', error)
      throw error
    }
  },
async getProduct(id) {
  const response = await api.get(`/api/products/${id}`)
  return response.data
},

  // ===========================
  // LEGACY ENDPOINTS (to be removed)
  // ===========================

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/tyres')
      return response.status === 200
    } catch {
      return false
    }
  },
}









