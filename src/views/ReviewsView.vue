<template>
  <div class="reviews-view">
    <div class="reviews-header">
      <h1>Leave Reviews</h1>
      <p>Share your experience with products from your delivered orders</p>
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
      <button @click="fetchReviewableOrders" class="btn-retry">Try Again</button>
    </div>

    <!-- No Orders State -->
    <div v-else-if="reviewableOrders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No Orders Available for Review</h3>
      <p>Orders must be delivered before you can leave reviews.</p>
      <router-link to="/orders" class="btn-primary">View My Orders</router-link>
    </div>

    <!-- Orders with Reviewable Products -->
    <div v-else class="orders-container">
      <div
        v-for="order in reviewableOrders"
        :key="order.orderId"
        class="order-review-card"
      >
        <div class="order-header">
          <div class="order-info">
            <h3>Order #{{ order.orderId }}</h3>
            <p class="order-date">{{ formatDate(order.orderDate) }}</p>
          </div>
          <div class="order-total">
            <span>{{ formatCurrency(order.totalAmount) }}</span>
          </div>
        </div>

        <div v-if="order.reviewableProducts && order.reviewableProducts.length > 0" class="reviewable-products">
          <h4>Products you can review from this order:</h4>
          <div
            v-for="product in order.reviewableProducts"
            :key="product.productId"
            class="product-review-card"
          >
            <div class="product-info">
              <h5>{{ product.productName }}</h5>
              <p v-if="product.productModel" class="product-model">{{ product.productModel }}</p>
              <p class="product-price">{{ formatCurrency(product.productPrice) }}</p>
            </div>

            <div class="review-form">
              <div class="rating-section">
                <label>Rating:</label>
                <div class="stars" :data-key="getReviewKey(order.orderId, product.productId)">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ active: getRating(order.orderId, product.productId) >= star }"
                    @click="setRating(order.orderId, product.productId, star)"
                  >
                    ★
                  </span>
                </div>
              </div>

              <div class="comment-section">
                <textarea
                  :value="getComment(order.orderId, product.productId)"
                  @input="setComment(order.orderId, product.productId, $event.target.value)"
                  :placeholder="`Share your experience with ${product.productName} from this order...`"
                  rows="3"
                ></textarea>
              </div>

              <button
                class="submit-review-btn"
                :disabled="isSubmitting(order.orderId, product.productId) || !canSubmitReview(order.orderId, product.productId)"
                @click="submitReview(order.orderId, product.productId)"
              >
                {{ isSubmitting(order.orderId, product.productId) ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-products">
          <p>All products from this order have been reviewed.</p>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const reviewableOrders = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const errorMessage = ref('')

// Review form data
const ratings = ref(new Map())
const comments = ref(new Map())
const submitting = ref(new Set())

// Utility functions
const getReviewKey = (orderId, productId) => `${orderId}-${productId}`

const getRating = (orderId, productId) => {
  return ratings.value.get(getReviewKey(orderId, productId)) || 0
}

const setRating = (orderId, productId, rating) => {
  const key = getReviewKey(orderId, productId)
  ratings.value.set(key, rating)
}

const getComment = (orderId, productId) => {
  return comments.value.get(getReviewKey(orderId, productId)) || ''
}

const setComment = (orderId, productId, comment) => {
  const key = getReviewKey(orderId, productId)
  comments.value.set(key, comment)
}

const isSubmitting = (orderId, productId) => {
  return submitting.value.has(getReviewKey(orderId, productId))
}

const canSubmitReview = (orderId, productId) => {
  const rating = getRating(orderId, productId)
  const comment = getComment(orderId, productId)
  return rating > 0 && comment.trim().length > 0
}

// API methods
const fetchReviewableOrders = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('Fetching reviewable orders...')
    const orders = await api.getReviewableOrders()

    // Load reviewable products for each order
    reviewableOrders.value = await Promise.all(
      orders.map(async (order) => {
        try {
          const products = await api.getReviewableProductsForOrder(order.orderId)
          return { ...order, reviewableProducts: products }
        } catch (productError) {
          console.error(`Error fetching products for order ${order.orderId}:`, productError)
          return { ...order, reviewableProducts: [] }
        }
      })
    )

    console.log('Reviewable orders loaded:', reviewableOrders.value)
  } catch (err) {
    console.error('Error fetching reviewable orders:', err)
    error.value = err.response?.data?.message || 'Failed to load orders for review'
  } finally {
    loading.value = false
  }
}

const submitReview = async (orderId, productId) => {
  const key = getReviewKey(orderId, productId)
  const rating = getRating(orderId, productId)
  const comment = getComment(orderId, productId)

  if (!rating || !comment || comment.trim() === '') {
    showError('Please provide both rating and comment')
    return
  }

  if (submitting.value.has(key)) return

  submitting.value.add(key)

  try {
    console.log('Submitting review:', { orderId, productId, rating, comment })
    await api.createReview(orderId, productId, comment, rating)

    showSuccess('Review submitted successfully!')

    // Clear form
    ratings.value.delete(key)
    comments.value.delete(key)

    // Reload orders to update reviewable products
    await fetchReviewableOrders()

  } catch (err) {
    console.error('Error submitting review:', err)
    showError(err.response?.data?.message || 'Failed to submit review. Please try again.')
  } finally {
    submitting.value.delete(key)
  }
}

// Utility methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  if (amount == null || amount === undefined) return 'R0.00'
  return `R${parseFloat(amount).toFixed(2)}`
}

const showSuccess = (message) => {
  successMessage.value = message
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  successMessage.value = ''
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Lifecycle
onMounted(() => {
  fetchReviewableOrders()
})
</script>

<style scoped>
.reviews-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.reviews-header {
  text-align: center;
  margin-bottom: 3rem;
}

.reviews-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.reviews-header p {
  color: #666;
  font-size: 1.1rem;
}

/* Loading and Error States */
.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-retry,
.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.btn-retry:hover,
.btn-primary:hover {
  background: #0056b3;
}

/* Order Cards */
.order-review-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.order-date {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.order-total {
  font-weight: bold;
  color: #2c5aa0;
  font-size: 1.2rem;
}

/* Product Review Cards */
.reviewable-products h4 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.product-review-card {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #fafafa;
}

.product-info h5 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.1rem;
}

.product-model {
  color: #666;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.product-price {
  font-weight: bold;
  color: #2c5aa0;
  margin: 0.25rem 0 1.5rem 0;
  font-size: 1rem;
}

/* Rating Stars */
.rating-section {
  margin-bottom: 1rem;
}

.rating-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 1.8rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.star:hover,
.star.active {
  color: #ffd700;
}

/* Form Elements */
.comment-section {
  margin-bottom: 1rem;
}

.comment-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.4;
}

.comment-section textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-review-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-review-btn:hover:not(:disabled) {
  background: #1e7e34;
  transform: translateY(-1px);
}

.submit-review-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Messages */
.message {
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
  font-weight: 500;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.no-products {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .reviews-view {
    padding: 1rem;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-review-card {
    padding: 1rem;
  }

  .stars {
    justify-content: center;
  }

  .star {
    font-size: 1.5rem;
  }
}
</style>
