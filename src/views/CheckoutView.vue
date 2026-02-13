<template>
  <div class="checkout-page">
    <div class="checkout-header">
      <h1>Checkout</h1>
      <div class="checkout-steps">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-title">Payment Method</span>
        </div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <span class="step-number">2</span>
          <span class="step-title">Delivery Options</span>
        </div>
        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <span class="step-number">3</span>
          <span class="step-title">Review & Confirm</span>
        </div>
      </div>
    </div>

    <div class="checkout-grid">
      <div class="checkout-form">
        <!-- Step 1: Payment Method Selection -->
        <div v-if="currentStep === 1" class="checkout-step">
          <div class="step-header">
            <h2>Choose Payment Method</h2>
            <p class="step-description">Select how you'd like to pay for your order</p>
          </div>

          <div class="payment-methods">
            <label
              v-for="method in availablePaymentMethods"
              :key="method.value"
              class="payment-option"
              :class="{ 'selected': selectedPaymentMethod === method.value }"
            >
              <input
                type="radio"
                :value="method.value"
                v-model="selectedPaymentMethod"
                @change="onPaymentMethodChange"
              />
              <div class="payment-content">
                <div class="payment-header">
                  <component :is="method.icon" class="payment-icon" />
                  <strong class="payment-title">{{ method.label }}</strong>
                </div>
                <p class="payment-description">{{ method.description }}</p>
                <div v-if="method.features" class="payment-features">
                  <span v-for="feature in method.features" :key="feature" class="feature-badge">
                    {{ feature }}
                  </span>
                </div>
              </div>
            </label>
          </div>

          <div class="step-actions">
            <button
              type="button"
              class="btn-primary btn-next"
              :disabled="!selectedPaymentMethod"
              @click="nextStep"
            >
              Continue to Delivery Options
              <ChevronRightIcon class="btn-icon" />
            </button>
          </div>
        </div>

        <!-- Step 2: Delivery Options -->
        <div v-if="currentStep === 2" class="checkout-step">
          <div class="step-header">
            <h2>{{ deliveryMethod === 'DELIVERY' ? 'Delivery Address' : 'Collection Information' }}</h2>
            <p class="step-description">
              {{ deliveryMethod === 'DELIVERY'
                ? 'Choose where to deliver your order'
                : 'Review collection details' }}
            </p>
          </div>

          <!-- Delivery Address Selection -->
          <div v-if="deliveryMethod === 'DELIVERY'" class="delivery-section">
            <AddressManager
              :user-id="userId"
              :selected-address-id="selectedAddressId"
              radio-group-name="checkout-address"
              @address-selected="onAddressSelected"
              @addresses-loaded="onAddressesLoaded"
            />
          </div>

          <!-- Collection Information -->
          <div v-else-if="deliveryMethod === 'COLLECTION'" class="collection-section">
            <div class="collection-info-card">
              <div class="store-info">
                <MapPinIcon class="store-icon" />
                <div class="store-details">
                  <h3>TymelessTyre Store</h3>
                  <p class="store-address">123 Main Street<br>Cape Town, Western Cape 8001</p>
                  <p class="store-phone">Phone: +27 21 123 4567</p>
                </div>
              </div>

              <div class="store-hours">
                <ClockIcon class="hours-icon" />
                <div class="hours-details">
                  <h4>Store Hours</h4>
                  <div class="hours-list">
                    <div class="hours-row">
                      <span>Monday - Friday:</span>
                      <span>8:00 AM - 5:00 PM</span>
                    </div>
                    <div class="hours-row">
                      <span>Saturday:</span>
                      <span>8:00 AM - 1:00 PM</span>
                    </div>
                    <div class="hours-row">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="collection-notes">
                <InfoIcon class="notes-icon" />
                <div class="notes-content">
                  <h4>Collection Information</h4>
                  <ul>
                    <li>We'll notify you when your order is ready for collection</li>
                    <li>Please bring a valid ID for collection</li>
                    <li>Orders are held for 7 days after ready notification</li>
                    <li>Payment is due upon collection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button
              type="button"
              class="btn-secondary btn-back"
              @click="previousStep"
            >
              <ChevronLeftIcon class="btn-icon" />
              Back to Payment
            </button>
            <button
              type="button"
              class="btn-primary btn-next"
              :disabled="deliveryMethod === 'DELIVERY' && !selectedAddressId"
              @click="nextStep"
            >
              Review Order
              <ChevronRightIcon class="btn-icon" />
            </button>
          </div>
        </div>

        <!-- Step 3: Review & Confirm -->
        <div v-if="currentStep === 3" class="checkout-step">
          <div class="step-header">
            <h2>Review Your Order</h2>
            <p class="step-description">Please confirm all details before placing your order</p>
          </div>

          <!-- Order Review -->
          <div class="order-review">
            <!-- Payment Summary -->
            <div class="review-section">
              <h3>Payment Method</h3>
              <div class="review-item">
                <component :is="selectedPaymentMethodInfo?.icon" class="review-icon" />
                <div class="review-content">
                  <strong>{{ selectedPaymentMethodInfo?.label }}</strong>
                  <p>{{ selectedPaymentMethodInfo?.description }}</p>
                </div>
                <button class="btn-change" @click="currentStep = 1">Change</button>
              </div>
            </div>

            <!-- Delivery Summary -->
            <div class="review-section">
              <h3>{{ deliveryMethod === 'DELIVERY' ? 'Delivery Address' : 'Collection Details' }}</h3>
              <div class="review-item">
                <component :is="deliveryMethod === 'DELIVERY' ? MapPinIcon : StoreIcon" class="review-icon" />
                <div class="review-content">
                  <div v-if="deliveryMethod === 'DELIVERY' && selectedAddress">
                    <strong>{{ selectedAddress.addressType }} Address</strong>
                    <p>{{ selectedAddress.street }}</p>
                    <p>{{ selectedAddress.city }}, {{ selectedAddress.state }} {{ selectedAddress.postalCode }}</p>
                  </div>
                  <div v-else-if="deliveryMethod === 'COLLECTION'">
                    <strong>Store Collection</strong>
                    <p>TymelessTyre Store, 123 Main Street, Cape Town</p>
                    <p>You'll be notified when ready for collection</p>
                  </div>
                </div>
                <button class="btn-change" @click="currentStep = 2">Change</button>
              </div>
            </div>
          </div>

          <div v-if="orderError" class="order-error">
            <AlertCircleIcon class="error-icon" />
            <div class="error-content">
              <strong>Order Error</strong>
              <p>{{ orderError }}</p>
            </div>
          </div>

          <div class="step-actions">
            <button
              type="button"
              class="btn-secondary btn-back"
              @click="previousStep"
              :disabled="processing"
            >
              <ChevronLeftIcon class="btn-icon" />
              Back to Delivery
            </button>
            <button
              type="button"
              class="btn-primary btn-submit"
              :disabled="processing || !canPlaceOrder"
              @click="handleSubmit"
            >
              <div v-if="processing" class="loading-spinner"></div>
              {{ processing ? 'Placing Order...' : `Place Order (R${cartTotal})` }}
            </button>
          </div>
        </div>
      </div>

      <div class="order-summary">
        <div class="summary-header">
          <h2>Order Summary</h2>
          <span class="item-count">{{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'items' }}</span>
        </div>

        <!-- Cart Items -->
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-info">
              <h4 class="item-name">{{ item.brand }} {{ item.model }}</h4>
              <p class="item-description">{{ item.description || 'No description' }}</p>
              <div class="item-meta">
                <span class="item-price">R{{ (item.price || 0).toFixed(2) }}</span>
                <span class="item-quantity">Qty: {{ item.quantity }}</span>
              </div>
            </div>
            <div class="item-total">
              R{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Summary Totals -->
        <div class="summary-totals">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>R{{ cartSubtotal || '0.00' }}</span>
          </div>
          <div class="summary-line delivery-info">
            <span>Delivery:</span>
            <span>{{ deliveryMethod === 'DELIVERY' ? 'Calculated at delivery' : 'Collection - Free' }}</span>
          </div>
          <div class="summary-total">
            <span>Total:</span>
            <span>R{{ cartTotal || '0.00' }}</span>
          </div>
        </div>

        <!-- Checkout Progress -->
        <div v-if="currentStep < 3" class="checkout-progress">
          <div class="progress-info">
            <p class="progress-text">Complete your order in {{ 3 - currentStep }} more {{ 3 - currentStep === 1 ? 'step' : 'steps' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import Auth from '@/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  MapPinIcon,
  ClockIcon,
  InfoIcon,
  AlertCircleIcon,
  CreditCardIcon,
  HandCoinsIcon,
  StoreIcon
} from 'lucide-vue-next'
import AddressManager from '@/components/AddressManager.vue'
import api from '@/services/api'
import emailService from '@/services/emailService'

const cartStore = useCartStore()
const router = useRouter()

// Reactive cart data
const { cartItems, cartTotal, cartSubtotal } = storeToRefs(cartStore)

// User data
const userId = ref(null)
const userAddresses = ref([])

// Checkout state
const currentStep = ref(1)
const selectedPaymentMethod = ref('')
const selectedAddressId = ref(null)
const processing = ref(false)
const orderError = ref('')

// Available payment methods
const availablePaymentMethods = ref([
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Cash on Delivery',
    description: 'Pay with cash when your order is delivered to your address',
    icon: HandCoinsIcon,
    features: ['Secure', 'No upfront payment', 'Available for delivery']
  },
  {
    value: 'CASH_ON_COLLECTION',
    label: 'Cash on Collection',
    description: 'Pay with cash when you collect your order from our store',
    icon: CreditCardIcon,
    features: ['Secure', 'No upfront payment', 'Collect from store']
  }
])

// Computed properties
const deliveryMethod = computed(() => {
  return selectedPaymentMethod.value === 'CASH_ON_COLLECTION' ? 'COLLECTION' : 'DELIVERY'
})

const selectedPaymentMethodInfo = computed(() => {
  return availablePaymentMethods.value.find(method => method.value === selectedPaymentMethod.value)
})

const selectedAddress = computed(() => {
  return userAddresses.value.find(addr => addr.addressId === selectedAddressId.value)
})

const canPlaceOrder = computed(() => {
  const hasPaymentMethod = Boolean(selectedPaymentMethod.value)
  const hasValidDelivery = deliveryMethod.value === 'COLLECTION' ||
                           (deliveryMethod.value === 'DELIVERY' && selectedAddressId.value)
  const hasItems = cartItems.value.length > 0

  return hasPaymentMethod && hasValidDelivery && hasItems && !processing.value
})

// Methods
const getUserId = () => {
  const storedUserId = localStorage.getItem('userId')
  if (storedUserId && !isNaN(parseInt(storedUserId))) {
    return parseInt(storedUserId)
  }
  return null
}

const checkAuthentication = () => {
  if (!Auth.isAuthenticated()) {
    orderError.value = 'Please login to continue with checkout'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    return false
  }

  const id = getUserId()
  if (!id) {
    orderError.value = 'User session expired. Please login again.'
    setTimeout(() => {
      Auth.logout()
      router.push('/login')
    }, 2000)
    return false
  }

  // Set userId for order creation
  userId.value = id
  return true
}

const onPaymentMethodChange = () => {
  // Reset address selection when payment method changes
  selectedAddressId.value = null
}

const onAddressSelected = (addressId) => {
  selectedAddressId.value = addressId
}

const onAddressesLoaded = (addresses) => {
  userAddresses.value = addresses
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  if (!canPlaceOrder.value) {
    return
  }

  if (!checkAuthentication()) {
    return
  }

  if (cartItems.value.length === 0) {
    orderError.value = 'Your cart is empty'
    return
  }

  processing.value = true
  orderError.value = ''

  console.log('🚀 Placing order with new complete order system...')

  try {
    // Ensure cart totals are calculated
    cartStore.calculateTotal()

    // Calculate totals manually to ensure accuracy
    const subtotal = cartItems.value.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity) || 0
      return sum + (price * quantity)
    }, 0)

    const finalTotal = subtotal

    // Validate order items according to backend requirements
    const validOrderItems = cartItems.value.filter(item => {
      const hasValidId = item.id !== null && item.id !== undefined && !isNaN(parseInt(item.id))
      const hasValidPrice = !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0
      const hasValidQuantity = !isNaN(parseInt(item.quantity)) && parseInt(item.quantity) > 0
      return hasValidId && hasValidPrice && hasValidQuantity
    }).map(item => ({
      productId: parseInt(item.id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }))

    if (validOrderItems.length === 0) {
      orderError.value = 'No valid items in cart. Please refresh and try again.'
      processing.value = false
      return
    }

    // Build complete order payload for new API
    const completeOrderData = {
      order: {
        userId: userId.value,
        status: "PENDING",
        totalPrice: finalTotal,
        orderItems: validOrderItems
      },
      paymentMethod: selectedPaymentMethod.value,
      deliveryMethod: deliveryMethod.value,
      // Only include addressId if delivery method is DELIVERY
      ...(deliveryMethod.value === 'DELIVERY' && selectedAddressId.value && {
        addressId: selectedAddressId.value
      })
    }

    console.log('Sending complete order data:', JSON.stringify(completeOrderData, null, 2))
    console.log('Auth token present:', !!localStorage.getItem('authToken'))
    console.log('User ID:', userId.value)

    // Send order to backend using new complete order API
    const response = await api.createCompleteOrder(completeOrderData)
    console.log('Complete order created successfully:', response)

    // Send order confirmation email
    try {
      const orderData = {
        orderId: response.orderId,
        orderDate: new Date().toISOString(),
        totalAmount: finalTotal,
        paymentMethod: selectedPaymentMethod.value,
        deliveryMethod: deliveryMethod.value,
        deliveryAddress: selectedAddressId.value ? userAddresses.value.find(addr => addr.id === selectedAddressId.value) : null,
        orderItems: validOrderItems.map(item => {
          const cartItem = cartItems.value.find(ci => ci.id === item.productId)
          return {
            product: { productName: cartItem ? `${cartItem.brand} ${cartItem.model}` : 'Unknown Product' },
            quantity: item.quantity,
            price: item.price
          }
        }),
        customerName: Auth.getUserName() || 'Valued Customer'
      }

      const userEmail = Auth.getUserEmail()
      if (userEmail) {
        console.log('Sending order confirmation email to:', userEmail)
        const emailResult = await emailService.sendOrderConfirmation(orderData, userEmail)

        if (emailResult.success) {
          console.log('Order confirmation email sent successfully')
        } else {
          console.warn('Failed to send order confirmation email:', emailResult.error)
          // Don't fail the order if email fails
        }
      } else {
        console.warn('No user email found, skipping order confirmation email')
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    // Clear cart after successful order
    cartStore.clearCart()

    // Redirect to order confirmation with order ID
    const orderId = response.orderId
    router.push(`/order-confirmation/${orderId}`)

  } catch (error) {
    console.error('Complete order error:', error)

    // Enhanced error handling for new API
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data

      console.error('Server error response:', errorData)

      if (status === 400) {
        const errorText = typeof errorData === 'string' ? errorData : (errorData.error || errorData.message || 'Validation failed')

        if (errorText.includes('Address is required for delivery method')) {
          orderError.value = 'Please select a delivery address for delivery orders.'
        } else if (errorText.includes('Insufficient stock') || errorText.includes('stock')) {
          orderError.value = `Stock Error: ${errorText}\n\nSome items in your cart may no longer be available. Please review your cart and try again.`
        } else if (errorText.includes('Product with ID') && errorText.includes('not found')) {
          orderError.value = 'Some products in your cart are no longer available. Please refresh your cart and try again.'
        } else if (errorText.includes('User not found')) {
          orderError.value = 'User session expired. Please login again.'
          setTimeout(() => {
            Auth.logout()
            router.push('/login')
          }, 2000)
        } else {
          orderError.value = `Order validation failed: ${errorText}`
        }
      } else if (status === 401) {
        orderError.value = 'Session expired. Please login again.'
        setTimeout(() => {
          Auth.logout()
          router.push('/login')
        }, 2000)
      } else if (status === 404) {
        orderError.value = 'Selected address not found. Please choose a different address.'
      } else if (status === 500) {
        orderError.value = 'Server error. Please try again later.'
      } else {
        orderError.value = `Failed to place order (${status}). Please try again.`
      }
    } else if (error.request) {
      orderError.value = 'Network error. Please check your connection and try again.'
    } else {
      orderError.value = error.message || 'Failed to place order. Please try again.'
    }
  } finally {
    processing.value = false
  }
}

// Initialize on mount
const initializeCheckout = () => {
  cartStore.initializeCart()

  if (!checkAuthentication()) {
    return
  }

  // Load available payment methods if needed
  // Could be enhanced to load from API
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
})
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.checkout-header {
  text-align: center;
  margin-bottom: 2rem;
}

.checkout-header h1 {
  margin: 0 0 1.5rem 0;
  color: #111827;
  font-size: 2rem;
  font-weight: 700;
}

/* Checkout Steps */
.checkout-steps {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s ease;
}

.step.active {
  background: #dbeafe;
  color: #1e40af;
}

.step.completed {
  background: #d1fae5;
  color: #065f46;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: currentColor;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.step.active .step-number,
.step.completed .step-number {
  background: currentColor;
}

.step-title {
  font-size: 0.875rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.checkout-form {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.checkout-step {
  padding: 2rem;
}

.step-header {
  margin-bottom: 2rem;
  text-align: left;
}

.step-header h2 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.5rem;
  font-weight: 600;
}

.step-description {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.order-summary {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.payment-option:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.payment-option.selected {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.payment-option input[type="radio"] {
  margin-top: 0.25rem;
  cursor: pointer;
}

.payment-content {
  flex: 1;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.payment-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.payment-title {
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.payment-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.payment-features {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feature-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Delivery Sections */
.delivery-section {
  margin-bottom: 2rem;
}

.collection-section {
  margin-bottom: 2rem;
}

.collection-info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.store-info {
  display: flex;
  gap: 1rem;
}

.store-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.store-details h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.store-address,
.store-phone {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.store-hours {
  display: flex;
  gap: 1rem;
}

.hours-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #059669;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.hours-details h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.collection-notes {
  display: flex;
  gap: 1rem;
}

.notes-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notes-content h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.notes-content ul {
  margin: 0;
  padding-left: 1rem;
  list-style-type: disc;
}

.notes-content li {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-next,
.btn-submit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Order Review */
.order-review {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.review-section h3 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.125rem;
  font-weight: 600;
}

.review-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.review-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.review-content {
  flex: 1;
}

.review-content strong {
  display: block;
  color: #111827;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.review-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.btn-change {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-change:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

/* Error Display */
.order-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-content strong {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.error-content p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Buttons */
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Order Summary */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.summary-header h2 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.item-count {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Cart Items */
.cart-items {
  padding: 0 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
}

.item-description {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.25;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.item-price {
  color: #111827;
  font-weight: 500;
}

.item-quantity {
  color: #6b7280;
}

.item-total {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Summary Totals */
.summary-totals {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.summary-line span:first-child {
  color: #6b7280;
}

.summary-line span:last-child {
  color: #111827;
  font-weight: 500;
}

.delivery-info span:last-child {
  color: #6b7280;
  font-style: italic;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0 0 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

/* Checkout Progress */
.checkout-progress {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.progress-info {
  text-align: center;
}

.progress-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .checkout-page {
    padding: 1rem;
  }

  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-header h1 {
    font-size: 1.5rem;
  }

  .checkout-steps {
    flex-direction: column;
    gap: 0.5rem;
  }

  .step {
    justify-content: center;
  }

  .checkout-step {
    padding: 1.5rem;
  }

  .payment-option {
    padding: 1rem;
  }

  .payment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .collection-info-card {
    padding: 1rem;
  }

  .store-info,
  .store-hours,
  .collection-notes {
    flex-direction: column;
    gap: 0.75rem;
  }

  .step-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-next,
  .btn-submit,
  .btn-back {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }

  .review-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-change {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    padding: 0.75rem;
  }

  .checkout-step {
    padding: 1rem;
  }

  .cart-items {
    max-height: 200px;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .step-header {
    margin-bottom: 1rem;
  }

  .step-header h2 {
    font-size: 1.25rem;
  }
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

</style>

