<template>
  <div class="customer-orders-view">
    <div class="orders-header">
      <h1>My Orders</h1>
      <p>Track and view your order history</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h3>Error Loading Orders</h3>
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="btn-retry">Try Again</button>
    </div>

    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="orders-container">
      <div class="orders-filters">
        <select v-model="statusFilter" class="status-filter">
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="order-card"
        >
          <div class="order-header">
            <div class="order-info">
              <h3>Order #{{ order.orderId }}</h3>
              <p class="order-date">{{ formatDate(order.orderDate) }}</p>
            </div>
            <div class="order-status">
              <span :class="'status-badge status-' + getStatusCssClass(order.orderStatus)">
                {{ formatStatus(order.orderStatus) }}
              </span>
            </div>
          </div>

          <div class="order-summary">
            <div class="order-items">
              <p><strong>{{ getItemCount(order) }} items</strong></p>
              <div class="item-preview">
                <span
                  v-for="(item, index) in order.orderItems?.slice(0, 3)"
                  :key="item.id"
                >
                  {{ item.product?.productName || 'Unknown Product' }}{{ index < Math.min(2, (order.orderItems?.length || 1) - 1) ? ', ' : '' }}
                </span>
                <span v-if="(order.orderItems?.length || 0) > 3">
                  and {{ (order.orderItems?.length || 0) - 3 }} more...
                </span>
              </div>
            </div>
            <div class="order-total">
              <h4>{{ formatCurrency(order.totalAmount) }}</h4>
            </div>
          </div>

          <div class="order-actions">
            <button @click.stop="viewOrderDetails(order)" class="btn-view-details">
              View Details
            </button>
            <button @click.stop="generatePDF(order)" class="btn-download-receipt">
              Download Receipt
            </button>
            <button
              v-if="isEligibleForReview(order.orderStatus)"
              @click.stop="goToReviews()"
              class="btn-write-review"
            >
              Write Review
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No Orders Yet</h3>
      <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
      <router-link to="/products" class="btn-shop">Start Shopping</router-link>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <!-- Debug: Modal is rendering -->
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order #{{ selectedOrder?.orderId || 'Unknown' }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="order-details">
            <div class="details-section">
              <h3>Order Information</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Order Date:</span>
                  <span class="value">{{ formatDate(selectedOrder?.orderDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span :class="'status-badge status-' + getStatusCssClass(selectedOrder?.orderStatus)">
                    {{ formatStatus(selectedOrder?.orderStatus) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Total Amount:</span>
                  <span class="value total">{{ formatCurrency(selectedOrder?.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Items Ordered</h3>
              <div class="order-items-list">
                <div
                  v-for="item in selectedOrder?.orderItems || []"
                  :key="item?.id || Math.random()"
                  class="order-item"
                >
                  <div class="item-info">
                    <h4>{{ item.product?.productName || 'Unknown Product' }}</h4>
                    <p class="item-details">
                      Quantity: {{ item.quantity }} × {{ formatCurrency(item.price) }}
                    </p>

                    <!-- Product Reviews Section -->
                    <div v-if="item.product?.productId" class="product-reviews-section">
                      <div v-if="isLoadingReviews(item.product.productId)" class="reviews-loading">
                        <span class="loading-text">Loading reviews...</span>
                      </div>

                      <div v-else class="reviews-summary">
                        <div class="rating-summary">
                          <span class="stars">{{ renderStars(getProductReviewData(item.product.productId).averageRating) }}</span>
                          <span class="rating-number">{{ getProductReviewData(item.product.productId).averageRating.toFixed(1) }}</span>
                          <span class="review-count">({{ getProductReviewData(item.product.productId).reviewCount }} reviews)</span>
                        </div>

                        <!-- Recent Reviews -->
                        <div v-if="getProductReviewData(item.product.productId).reviews.length > 0" class="recent-reviews">
                          <h5>Recent Reviews:</h5>
                          <div
                            v-for="review in getProductReviewData(item.product.productId).reviews.slice(0, 2)"
                            :key="review.id"
                            class="review-item"
                          >
                            <div class="review-header">
                              <span class="reviewer-name">{{ review.reviewerName || 'Anonymous' }}</span>
                              <span class="review-rating">{{ renderStars(review.rating) }}</span>
                              <span class="review-date">{{ formatDate(review.reviewDate) }}</span>
                            </div>
                            <p class="review-comment">{{ review.comment }}</p>
                          </div>

                          <div v-if="getProductReviewData(item.product.productId).reviews.length > 2" class="more-reviews">
                            <small>+ {{ getProductReviewData(item.product.productId).reviews.length - 2 }} more reviews</small>
                          </div>
                        </div>

                        <div v-else class="no-reviews">
                          <p><em>No reviews yet for this product</em></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item-total">
                    {{ formatCurrency(item.subtotal) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="generatePDF(selectedOrder)" class="btn-download-pdf">
            Download PDF Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden Receipt Template for PDF Generation -->
    <div v-if="selectedOrder" ref="receiptTemplate" class="receipt-template">
      <div class="receipt-header">
        <h1>TYMELESS TYRE</h1>
        <h2>Order Receipt</h2>
      </div>

      <div class="receipt-info">
        <div class="receipt-section">
          <h3>Order Details</h3>
          <p><strong>Order #:</strong> {{ selectedOrder.orderId }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
          <p><strong>Status:</strong> {{ formatStatus(selectedOrder.orderStatus) }}</p>
        </div>

        <div class="receipt-section">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> {{ getCustomerName(selectedOrder) }}</p>
          <p><strong>Email:</strong> {{ selectedOrder.user?.email || 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ selectedOrder.user?.phoneNumber || 'N/A' }}</p>
        </div>
      </div>

      <div class="receipt-items">
        <h3>Order Items</h3>
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedOrder.orderItems" :key="item.id">
              <td>
                <strong>{{ item.product?.productName || 'Unknown Product' }}</strong>
                <br><small>{{ item.product?.productModel || '' }}</small>
              </td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatCurrency(item.price) }}</td>
              <td>{{ formatCurrency(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="receipt-total">
        <h3>Total Amount: {{ formatCurrency(selectedOrder.totalAmount) }}</h3>
      </div>

      <div class="receipt-footer">
        <p>Thank you for your business!</p>
        <p>Generated on {{ new Date().toLocaleDateString('en-ZA') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { isEligibleForReview, normalizeLegacyStatus } from '@/utils/statusUtils'

// Reactive data
const router = useRouter()
const orders = ref([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const selectedOrder = ref(null)
const receiptTemplate = ref(null)
const productReviews = ref(new Map()) // Map to store reviews by productId
const reviewsLoading = ref(new Set()) // Set to track which products are loading reviews

// Computed properties
const filteredOrders = computed(() => {
  if (!statusFilter.value) {
    return orders.value
  }
  return orders.value.filter(order => {
    if (!order.orderStatus) return false

    const orderStatus = order.orderStatus.toUpperCase()
    const filterValue = statusFilter.value.toUpperCase()

    // Handle legacy status mapping during transition period
    const statusMapping = {
      'DELIVERED': 'COMPLETED',
      'COMPLETED': 'COMPLETED'
    }

    const normalizedOrderStatus = statusMapping[orderStatus] || orderStatus
    const normalizedFilterValue = statusMapping[filterValue] || filterValue

    return normalizedOrderStatus === normalizedFilterValue
  })
})

// Methods
const fetchOrders = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('Fetching customer orders...')
    const response = await api.getMyOrders()

    // Handle different response structures
    let ordersData = response
    if (response && typeof response === 'object') {
      // If response is wrapped in an object, try common property names
      ordersData = response.data || response.orders || response.content || response
    }

    // Ensure we have an array
    orders.value = Array.isArray(ordersData) ? ordersData : []

    console.log('Customer orders fetched successfully:', orders.value.length, 'orders')
    console.log('Orders data:', orders.value)
  } catch (err) {
    console.error('Error fetching orders:', err)

    // Check if this is a status enum parsing error
    const errorMessage = err.response?.data?.message || err.response?.data || err.message
    if (typeof errorMessage === 'string' && errorMessage.includes('OrderStatus.delivered')) {
      error.value = 'Your orders are being updated to our new system. Please try again in a few moments, or contact support if this issue persists.'
    } else if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please log in again.'
    } else {
      error.value = errorMessage || 'Failed to load your orders'
    }
  } finally {
    loading.value = false
  }
}

const viewOrderDetails = (order) => {
  console.log('Opening order details for order:', order)
  selectedOrder.value = order
  console.log('selectedOrder set to:', selectedOrder.value)
  console.log('Modal should now be visible')
  // Load reviews for all products in this order (non-blocking)
  if (order?.orderItems) {
    loadProductReviews(order).catch(error => {
      console.error('Error loading product reviews:', error)
      // Continue showing the modal even if reviews fail to load
    })
  }
}

const closeModal = () => {
  selectedOrder.value = null
  // Clear any loaded reviews when closing modal
  productReviews.value.clear()
  reviewsLoading.value.clear()
}

const goToReviews = () => {
  router.push('/reviews')
}

// Load reviews for all products in an order
const loadProductReviews = async (order) => {
  if (!order.orderItems) return

  const uniqueProductIds = [...new Set(order.orderItems.map(item => item.product?.productId).filter(id => id))]

  for (const productId of uniqueProductIds) {
    if (!productReviews.value.has(productId)) {
      await fetchProductReviews(productId)
    }
  }
}

// Fetch reviews for a specific product
const fetchProductReviews = async (productId) => {
  if (reviewsLoading.value.has(productId)) return

  reviewsLoading.value.add(productId)

  try {
    const [reviews, averageRating] = await Promise.all([
      api.getProductReviews(productId),
      api.getAverageRating(productId)
    ])

    productReviews.value.set(productId, {
      reviews: reviews || [],
      averageRating: averageRating || 0,
      reviewCount: reviews ? reviews.length : 0
    })
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error)
    // Set empty data on error
    productReviews.value.set(productId, {
      reviews: [],
      averageRating: 0,
      reviewCount: 0
    })
  } finally {
    reviewsLoading.value.delete(productId)
  }
}

// Get reviews data for a product
const getProductReviewData = (productId) => {
  return productReviews.value.get(productId) || {
    reviews: [],
    averageRating: 0,
    reviewCount: 0
  }
}

// Check if reviews are loading for a product
const isLoadingReviews = (productId) => {
  return reviewsLoading.value.has(productId)
}

// Render star rating
const renderStars = (rating) => {
  if (!rating) return '☆☆☆☆☆'
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  let stars = '★'.repeat(fullStars)
  stars += '☆'.repeat(5 - fullStars)

  if (hasHalfStar && fullStars < 5) {
    stars = stars.substring(0, fullStars) + '⯨' + stars.substring(fullStars + 1)
  }

  return stars
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'

  // Normalize status to uppercase for consistent handling
  const normalizedStatus = status.toUpperCase()

  const statusMap = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'PROCESSING': 'Processing',
    'SHIPPED': 'Shipped',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    // Legacy status mapping during transition period
    'DELIVERED': 'Completed'
  }

  return statusMap[normalizedStatus] || status
}

const getStatusCssClass = (status) => {
  if (!status) return 'unknown'

  // Use the utility function to normalize legacy status values
  const normalizedStatus = normalizeLegacyStatus(status)

  // Map all statuses to CSS classes (lowercase for CSS)
  const cssClassMap = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'PROCESSING': 'processing',
    'SHIPPED': 'shipped',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  }

  return cssClassMap[normalizedStatus] || 'unknown'
}

const formatCurrency = (amount) => {
  if (amount == null || amount === undefined) return 'R0.00'
  return `R${parseFloat(amount).toFixed(2)}`
}

const getItemCount = (order) => {
  if (!order.orderItems) return 0
  return order.orderItems.reduce((total, item) => total + (item.quantity || 0), 0)
}

const getCustomerName = (order) => {
  if (order.user) {
    if (order.user.name && order.user.surname) {
      return `${order.user.name} ${order.user.surname}`
    }
    return order.user.username || order.user.email || 'Unknown Customer'
  }
  return 'Unknown Customer'
}

const generatePDF = async (order) => {
  // Track if order was already selected
  const wasOrderSelected = selectedOrder.value !== null && selectedOrder.value.orderId === order.orderId

  try {
    console.log('Generating PDF for order:', order.orderId)

    // Temporarily set selectedOrder to ensure template is rendered
    if (!wasOrderSelected) {
      selectedOrder.value = order
    }

    // Wait for next tick to ensure template is rendered
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))

    const element = receiptTemplate.value
    if (!element) {
      throw new Error('Receipt template not found')
    }

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const imgData = canvas.toDataURL('image/png')
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    const fileName = `receipt-order-${order.orderId}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('PDF generated successfully:', fileName)

    // Cleanup: if order wasn't originally selected, clear selection
    if (!wasOrderSelected) {
      selectedOrder.value = null
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF receipt. Please try again.')

    // Cleanup on error too
    if (!wasOrderSelected) {
      selectedOrder.value = null
    }
  }
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.customer-orders-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.orders-header {
  margin-bottom: 2rem;
  text-align: center;
}

.orders-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.orders-header p {
  color: #666;
  font-size: 1.1rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  color: #dc3545;
}

.btn-retry {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
}

.btn-retry:hover {
  background: #0056b3;
}

.orders-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.orders-filters {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.status-filter {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  min-width: 180px;
}

.orders-list {
  max-height: 600px;
  overflow-y: auto;
}

.order-card {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-card:hover {
  background: #f8f9fa;
}

.order-card:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info h3 {
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.order-date {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending { background: #fff3cd; color: #856404; }
.status-confirmed { background: #cce5ff; color: #004085; }
.status-processing { background: #d1ecf1; color: #0c5460; }
.status-shipped { background: #d1ecf1; color: #0c5460; }
.status-completed { background: #d4edda; color: #155724; }
.status-cancelled { background: #f8d7da; color: #721c24; }
.status-unknown { background: #e9ecef; color: #6c757d; }

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.order-items p {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-preview {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.order-total h4 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-view-details,
.btn-download-receipt,
.btn-write-review {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-view-details {
  background-color: #007bff;
  color: white;
}

.btn-view-details:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-download-receipt {
  background-color: #28a745;
  color: white;
}

.btn-download-receipt:hover {
  background-color: #1e7e34;
  transform: translateY(-1px);
}

.btn-write-review {
  background-color: #6f42c1;
  color: white;
}

.btn-write-review:hover {
  background-color: #5a2d91;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 1rem;
}

.btn-shop {
  display: inline-block;
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  margin-top: 1.5rem;
  transition: background-color 0.2s;
}

.btn-shop:hover {
  background: #0056b3;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #e9ecef;
}

.modal-body {
  padding: 1.5rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.details-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: #333;
}

.value.total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #007bff;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.item-details {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-left: 1rem;
  flex-shrink: 0;
}

/* Product Reviews Styles */
.product-reviews-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.reviews-loading {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.loading-text {
  color: #007bff;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stars {
  color: #ffd700;
  font-size: 1rem;
  letter-spacing: 1px;
}

.rating-number {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.review-count {
  color: #666;
  font-size: 0.85rem;
}

.recent-reviews h5 {
  margin: 0.75rem 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
}

.review-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.reviewer-name {
  font-weight: 500;
  color: #333;
  font-size: 0.85rem;
}

.review-rating {
  color: #ffd700;
  font-size: 0.8rem;
}

.review-date {
  color: #999;
  font-size: 0.75rem;
}

.review-comment {
  margin: 0;
  color: #555;
  font-size: 0.85rem;
  line-height: 1.4;
}

.more-reviews {
  text-align: center;
  margin-top: 0.5rem;
}

.more-reviews small {
  color: #666;
  font-style: italic;
}

.no-reviews {
  color: #999;
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
  padding: 0.5rem;
}

.no-reviews p {
  margin: 0;
}

@media (max-width: 768px) {
  .customer-orders-view {
    padding: 1rem;
  }

  .orders-header {
    margin-bottom: 1.5rem;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-total {
    margin-left: 0;
    align-self: flex-end;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .rating-summary {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }
}

/* Modal Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn-download-pdf {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-download-pdf:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

/* Receipt Template - Hidden but styled for PDF generation */
.receipt-template {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 800px;
  background: white;
  padding: 40px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.receipt-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 20px;
}

.receipt-header h1 {
  font-size: 28px;
  color: #007bff;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.receipt-header h2 {
  font-size: 20px;
  color: #666;
  margin: 0;
  font-weight: normal;
}

.receipt-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.receipt-section h3 {
  font-size: 16px;
  color: #007bff;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.receipt-section p {
  margin: 8px 0;
  font-size: 14px;
}

.receipt-items {
  margin-bottom: 30px;
}

.receipt-items h3 {
  font-size: 16px;
  color: #007bff;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.receipt-table th,
.receipt-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
}

.receipt-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #007bff;
}

.receipt-table td strong {
  color: #333;
}

.receipt-table td small {
  color: #666;
  font-size: 12px;
}

.receipt-total {
  text-align: right;
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.receipt-total h3 {
  font-size: 20px;
  color: #007bff;
  margin: 0;
  font-weight: bold;
}

.receipt-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
}

.receipt-footer p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
