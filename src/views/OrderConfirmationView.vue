<template>
  <div class="order-confirmation-page">
    <div class="confirmation-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h2>Loading your order details...</h2>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <AlertCircleIcon class="error-icon" />
        <h2>Unable to load order details</h2>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button class="btn-primary" @click="loadOrderDetails">Try Again</button>
          <router-link to="/" class="btn-secondary">Go to Home</router-link>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="orderDetails" class="success-state">
        <!-- Success Header -->
        <div class="success-header">
          <div class="success-icon">
            <CheckCircleIcon class="icon" />
          </div>
          <h1>Order Confirmed!</h1>
          <p class="success-message">
            Thank you for your order. We've received your request and will process it soon.
          </p>
          <div class="order-number">
            <span class="label">Order Number:</span>
            <span class="number">#{{ orderDetails.order.orderId }}</span>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary-section">
          <h2>Order Summary</h2>

          <div class="summary-cards">
            <!-- Payment Information -->
            <div class="summary-card">
              <div class="card-header">
                <CreditCardIcon class="card-icon" />
                <h3>Payment Details</h3>
              </div>
              <div class="card-content">
                <div class="detail-row">
                  <span>Payment Method:</span>
                  <span class="value">{{ formatPaymentMethod(orderDetails.paymentMethod) }}</span>
                </div>
                <div class="detail-row">
                  <span>Status:</span>
                  <span class="status-badge" :class="getPaymentStatusClass(orderDetails.paymentStatus)">
                    {{ formatPaymentStatus(orderDetails.paymentStatus) }}
                  </span>
                </div>
                <div class="detail-row total-row">
                  <span>Total Amount:</span>
                  <span class="total-amount">R{{ orderDetails.order.totalAmount?.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="summary-card">
              <div class="card-header">
                <component :is="orderDetails.deliveryMethod === 'DELIVERY' ? TruckIcon : StoreIcon" class="card-icon" />
                <h3>{{ orderDetails.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Collection' }} Details</h3>
              </div>
              <div class="card-content">
                <div v-if="orderDetails.deliveryMethod === 'DELIVERY'" class="delivery-details">
                  <div class="detail-row">
                    <span>Method:</span>
                    <span class="value">Home Delivery</span>
                  </div>
                  <div class="detail-row">
                    <span>Status:</span>
                    <span class="status-badge" :class="getDeliveryStatusClass(orderDetails.deliveryStatus)">
                      {{ formatDeliveryStatus(orderDetails.deliveryStatus) }}
                    </span>
                  </div>
                  <div v-if="orderDetails.order.delivery?.deliveryAddress" class="delivery-address">
                    <span class="address-label">Delivery Address:</span>
                    <div class="address-details">
                      <p>{{ orderDetails.order.delivery.deliveryAddress.street }}</p>
                      <p>{{ orderDetails.order.delivery.deliveryAddress.city }}, {{ orderDetails.order.delivery.deliveryAddress.state }} {{ orderDetails.order.delivery.deliveryAddress.postalCode }}</p>
                    </div>
                  </div>
                  <div v-if="orderDetails.order.delivery?.estimatedDeliveryDate" class="detail-row">
                    <span>Estimated Delivery:</span>
                    <span class="value">{{ formatDate(orderDetails.order.delivery.estimatedDeliveryDate) }}</span>
                  </div>
                </div>

                <div v-else class="collection-details">
                  <div class="detail-row">
                    <span>Method:</span>
                    <span class="value">Store Collection</span>
                  </div>
                  <div class="detail-row">
                    <span>Status:</span>
                    <span class="status-badge" :class="getDeliveryStatusClass(orderDetails.deliveryStatus)">
                      {{ formatDeliveryStatus(orderDetails.deliveryStatus) }}
                    </span>
                  </div>
                  <div class="store-info">
                    <span class="address-label">Collection Location:</span>
                    <div class="address-details">
                      <p><strong>TymelessTyre Store</strong></p>
                      <p>123 Main Street</p>
                      <p>Cape Town, Western Cape 8001</p>
                      <p>Phone: +27 21 123 4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items-section">
          <h2>Items Ordered</h2>
          <div class="items-list">
            <div v-for="item in orderDetails.order.orderItems" :key="item.id" class="order-item">
              <div class="item-info">
                <h3 class="item-name">
                  {{ item.product?.brand }} {{ item.product?.model }}
                </h3>
                <p class="item-description">{{ item.product?.description || 'No description available' }}</p>
              </div>
              <div class="item-details">
                <div class="quantity">Qty: {{ item.quantity }}</div>
                <div class="price">R{{ item.price?.toFixed(2) }}</div>
                <div class="subtotal">R{{ (item.price * item.quantity)?.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- What's Next -->
        <div class="next-steps-section">
          <h2>What's Next?</h2>
          <div class="steps-grid">
            <div v-if="orderDetails.paymentMethod === 'CASH_ON_DELIVERY'" class="step-card">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Order Processing</h3>
                <p>We're preparing your order for delivery. You'll receive updates via email.</p>
              </div>
            </div>

            <div v-if="orderDetails.paymentMethod === 'CASH_ON_COLLECTION'" class="step-card">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Order Preparation</h3>
                <p>We're preparing your order. You'll be notified when it's ready for collection.</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>{{ orderDetails.deliveryMethod === 'DELIVERY' ? 'Delivery' : 'Collection' }}</h3>
                <p v-if="orderDetails.deliveryMethod === 'DELIVERY'">
                  Your order will be delivered to your address. Please have cash ready for payment.
                </p>
                <p v-else>
                  Visit our store during business hours to collect and pay for your order.
                </p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Enjoy Your Purchase</h3>
                <p>Once received, don't forget to leave a review to help other customers!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="confirmation-actions">
          <router-link to="/profile/orders" class="btn-primary">
            <ClipboardListIcon class="btn-icon" />
            View All Orders
          </router-link>
          <router-link to="/products" class="btn-secondary">
            <ShoppingCartIcon class="btn-icon" />
            Continue Shopping
          </router-link>
          <button class="btn-secondary" @click="printConfirmation">
            <PrinterIcon class="btn-icon" />
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  CheckCircleIcon,
  AlertCircleIcon,
  CreditCardIcon,
  TruckIcon,
  StoreIcon,
  ClipboardListIcon,
  ShoppingCartIcon,
  PrinterIcon
} from 'lucide-vue-next'
import api from '@/services/api'

const route = useRoute()

// Component state
const loading = ref(true)
const error = ref('')
const orderDetails = ref(null)

// Methods
const loadOrderDetails = async (retryCount = 0) => {
  loading.value = true
  error.value = ''

  try {
    const orderId = route.params.orderId

    if (!orderId || isNaN(parseInt(orderId))) {
      throw new Error('Invalid order ID')
    }

    const response = await api.getCompleteOrderDetails(parseInt(orderId))
    orderDetails.value = response

  } catch (err) {
    console.error('Error loading order details:', err)

    if (err.response?.status === 404) {
      error.value = 'Order not found. Please check the order number and try again.'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this order.'
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      if (retryCount < 2) {
        console.log(`Retrying order details fetch... Attempt ${retryCount + 1}`)
        loading.value = false
        // Retry after a short delay
        setTimeout(() => loadOrderDetails(retryCount + 1), 2000)
        return
      } else {
        error.value = 'The server is taking longer than expected to respond. Please refresh the page or try again later.'
      }
    } else {
      error.value = err.message || 'Failed to load order details. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const formatPaymentMethod = (method) => {
  const methodMap = {
    'CASH_ON_DELIVERY': 'Cash on Delivery',
    'CASH_ON_COLLECTION': 'Cash on Collection'
  }
  return methodMap[method] || method
}

const formatPaymentStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'CANCELLED': 'Cancelled'
  }
  return statusMap[status] || status
}

const formatDeliveryStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pending',
    'CONFIRMED': 'Confirmed',
    'IN_TRANSIT': 'In Transit',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'READY_FOR_COLLECTION': 'Ready for Collection',
    'DELIVERED': 'Delivered',
    'COLLECTED': 'Collected',
    'FAILED_DELIVERY': 'Failed Delivery',
    'RETURNED': 'Returned'
  }
  return statusMap[status] || status
}

const getPaymentStatusClass = (status) => {
  const classMap = {
    'PENDING': 'status-pending',
    'CONFIRMED': 'status-confirmed',
    'COMPLETED': 'status-completed',
    'FAILED': 'status-failed',
    'CANCELLED': 'status-cancelled'
  }
  return classMap[status] || 'status-default'
}

const getDeliveryStatusClass = (status) => {
  const classMap = {
    'PENDING': 'status-pending',
    'CONFIRMED': 'status-confirmed',
    'IN_TRANSIT': 'status-in-progress',
    'OUT_FOR_DELIVERY': 'status-in-progress',
    'READY_FOR_COLLECTION': 'status-ready',
    'DELIVERED': 'status-completed',
    'COLLECTED': 'status-completed',
    'FAILED_DELIVERY': 'status-failed',
    'RETURNED': 'status-failed'
  }
  return classMap[status] || 'status-default'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const printConfirmation = () => {
  window.print()
}

// Lifecycle
onMounted(() => {
  loadOrderDetails()
})
</script>

<style scoped>
.order-confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state h2 {
  color: #374151;
  font-size: 1.25rem;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 2rem;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-state h2 {
  color: #111827;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

/* Success State */
.success-state {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.success-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.success-icon .icon {
  width: 2rem;
  height: 2rem;
}

.success-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.success-message {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.5;
}

.order-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
}

.order-number .label {
  opacity: 0.8;
}

.order-number .number {
  font-family: 'Courier New', monospace;
  font-size: 1.125rem;
}

/* Order Summary */
.order-summary-section {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-summary-section h2 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.card-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.card-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.card-content {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row span:first-child {
  color: #6b7280;
}

.value {
  color: #111827;
  font-weight: 500;
}

.total-row {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
}

.total-amount {
  color: #059669;
  font-size: 1.125rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #dbeafe; color: #1e40af; }
.status-completed { background: #d1fae5; color: #065f46; }
.status-in-progress { background: #e0e7ff; color: #5b21b6; }
.status-ready { background: #ecfdf5; color: #047857; }
.status-failed { background: #fee2e2; color: #dc2626; }
.status-cancelled { background: #f3f4f6; color: #6b7280; }
.status-default { background: #f3f4f6; color: #374151; }

.delivery-address,
.store-info {
  margin-top: 0.75rem;
}

.address-label {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.address-details p {
  margin: 0;
  color: #111827;
  font-size: 0.875rem;
  line-height: 1.25;
}

/* Order Items */
.order-items-section {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-items-section h2 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.item-description {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
  font-size: 0.875rem;
}

.quantity {
  color: #6b7280;
}

.price {
  color: #111827;
}

.subtotal {
  color: #111827;
  font-weight: 600;
}

/* Next Steps */
.next-steps-section {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.next-steps-section h2 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.step-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.step-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Actions */
.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .order-confirmation-page {
    padding: 1rem 0.5rem;
  }

  .success-header {
    padding: 2rem 1rem;
  }

  .success-header h1 {
    font-size: 1.5rem;
  }

  .order-summary-section,
  .order-items-section,
  .next-steps-section {
    padding: 1.5rem 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    gap: 1rem;
  }

  .item-details {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .confirmation-actions {
    flex-direction: column;
    padding: 1.5rem 1rem;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }
}

/* Print Styles */
@media print {
  .order-confirmation-page {
    background: white;
    padding: 0;
  }

  .confirmation-container {
    max-width: none;
    margin: 0;
  }

  .success-state {
    box-shadow: none;
    border-radius: 0;
  }

  .success-header {
    background: #f9fafb !important;
    color: #111827 !important;
  }

  .confirmation-actions {
    display: none;
  }
}
</style>
