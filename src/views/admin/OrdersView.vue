<template>
  <div class="orders-view">
    <div class="orders-header">
      <h1>Order Management</h1>
      <div class="orders-stats">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p>{{ orders.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Orders</h3>
          <p>{{ orders.filter(o => o.orderStatus === 'PENDING').length }}</p>
        </div>
        <div class="stat-card">
          <h3>Completed Orders</h3>
          <p>{{ orders.filter(o => o.orderStatus === 'COMPLETED').length }}</p>
        </div>
        <div class="stat-card">
          <h3>Cash on Delivery</h3>
          <p>{{ orders.filter(o => o.payment?.paymentMethod === 'CASH_ON_DELIVERY').length }}</p>
        </div>
        <div class="stat-card">
          <h3>Store Collection</h3>
          <p>{{ orders.filter(o => o.delivery?.deliveryMethod === 'COLLECTION').length }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Revenue</h3>
          <p>{{ formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)) }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h3>Error Loading Orders</h3>
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="btn-retry">Try Again</button>
    </div>

    <!-- Orders Table -->
    <div v-else-if="orders.length > 0" class="orders-table-container">
      <div class="table-controls">
        <input
          v-model="searchTerm"
          placeholder="Search orders..."
          class="search-input"
        />
        <select v-model="statusFilter" class="status-filter">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select v-model="paymentFilter" class="payment-filter">
          <option value="">All Payment Methods</option>
          <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
          <option value="CASH_ON_COLLECTION">Cash on Collection</option>
        </select>
        <select v-model="deliveryFilter" class="delivery-filter">
          <option value="">All Delivery Methods</option>
          <option value="DELIVERY">Home Delivery</option>
          <option value="COLLECTION">Store Collection</option>
        </select>
      </div>

      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Delivery</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderId" class="order-row">
            <td class="order-id">#{{ order.orderId }}</td>
            <td class="customer-info">
              <div>{{ order.user?.name }} {{ order.user?.surname }}</div>
              <small>{{ order.user?.email }}</small>
            </td>
            <td class="order-date">{{ formatDate(order.orderDate) }}</td>
            <td class="order-status">
              <select
                v-model="order.orderStatus"
                @change="updateOrderStatus(order.orderId, order.orderStatus)"
                class="status-select"
                :class="'status-' + (order.orderStatus || 'unknown').toLowerCase()"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </td>
            <td class="payment-info">
              <div class="payment-method">
                {{ formatPaymentMethod(order.payment?.paymentMethod) }}
              </div>
              <select
                v-if="order.payment"
                v-model="order.payment.paymentStatus"
                @change="updatePaymentStatus(order.orderId, order.payment.paymentStatus)"
                class="status-select payment-status-select"
                :class="'status-' + (order.payment?.paymentStatus || 'unknown').toLowerCase()"
              >
                <option value="PENDING">Payment Pending</option>
                <option value="CONFIRMED">Payment Confirmed</option>
                <option value="COMPLETED">Payment Completed</option>
                <option value="FAILED">Payment Failed</option>
                <option value="CANCELLED">Payment Cancelled</option>
              </select>
              <small v-else class="no-payment">No payment info</small>
            </td>
            <td class="delivery-info">
              <div class="delivery-method">
                {{ formatDeliveryMethod(order.delivery?.deliveryMethod) }}
              </div>
              <select
                v-if="order.delivery"
                v-model="order.delivery.deliveryStatus"
                @change="updateDeliveryStatus(order.orderId, order.delivery.deliveryStatus)"
                class="status-select delivery-status-select"
                :class="'status-' + (order.delivery?.deliveryStatus || 'unknown').toLowerCase()"
              >
                <option value="PENDING">Pending Collection/Delivery</option>
                <option value="CONFIRMED">Confirmed for Collection/Delivery</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="READY_FOR_COLLECTION">Ready for Collection</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COLLECTED">Collected</option>
                <option value="FAILED_DELIVERY">Failed Delivery Attempt</option>
                <option value="RETURNED">Returned to Store</option>
              </select>
              <small v-else class="no-delivery">No delivery info</small>
            </td>
            <td class="order-items">{{ getItemCount(order) }} items</td>
            <td class="order-total">{{ formatCurrency(order.totalAmount) }}</td>
            <td class="order-actions">
              <button @click="viewOrderDetails(order)" class="btn-view">View</button>
              <button @click="generatePDF(order)" class="btn-pdf">PDF</button>
              <button @click="deleteOrder(order.orderId)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <h3>No Orders Found</h3>
      <p>There are no orders in the system yet.</p>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order Details - #{{ selectedOrder.orderId }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <div class="info-section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> {{ selectedOrder.user?.name }} {{ selectedOrder.user?.surname }}</p>
              <p><strong>Email:</strong> {{ selectedOrder.user?.email }}</p>
              <p><strong>Phone:</strong> {{ selectedOrder.user?.phoneNumber || 'Not provided' }}</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> #{{ selectedOrder.orderId }}</p>
              <p><strong>Date:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
              <p><strong>Status:</strong> {{ formatStatus(selectedOrder.orderStatus) }}</p>
              <p><strong>Total Amount:</strong> {{ formatCurrency(selectedOrder.totalAmount) }}</p>
            </div>
            <div class="info-section">
              <h3>Payment Information</h3>
              <p><strong>Method:</strong> {{ formatPaymentMethod(selectedOrder.payment?.paymentMethod) }}</p>
              <p><strong>Status:</strong>
                <span :class="'badge status-' + (selectedOrder.payment?.paymentStatus || 'unknown')">
                  {{ formatPaymentStatus(selectedOrder.payment?.paymentStatus) }}
                </span>
              </p>
              <p v-if="selectedOrder.payment?.paymentDate">
                <strong>Payment Date:</strong> {{ formatDate(selectedOrder.payment.paymentDate) }}
              </p>
              <p v-if="selectedOrder.payment?.amount">
                <strong>Payment Amount:</strong> {{ formatCurrency(selectedOrder.payment.amount) }}
              </p>
            </div>
            <div class="info-section">
              <h3>Delivery Information</h3>
              <p><strong>Method:</strong> {{ formatDeliveryMethod(selectedOrder.delivery?.deliveryMethod) }}</p>
              <p><strong>Status:</strong>
                <span :class="'badge status-' + (selectedOrder.delivery?.deliveryStatus || 'unknown')">
                  {{ formatDeliveryStatus(selectedOrder.delivery?.deliveryStatus) }}
                </span>
              </p>
              <div v-if="selectedOrder.delivery?.deliveryMethod === 'DELIVERY' && selectedOrder.delivery?.address">
                <p><strong>Delivery Address:</strong></p>
                <div class="address-details">
                  {{ selectedOrder.delivery.address.street }}<br>
                  {{ selectedOrder.delivery.address.city }}, {{ selectedOrder.delivery.address.province }}<br>
                  {{ selectedOrder.delivery.address.postalCode }}, {{ selectedOrder.delivery.address.country }}
                </div>
              </div>
              <p v-if="selectedOrder.delivery?.estimatedDate">
                <strong>Estimated Date:</strong> {{ formatDate(selectedOrder.delivery.estimatedDate) }}
              </p>
              <p v-if="selectedOrder.delivery?.actualDate">
                <strong>Delivery Date:</strong> {{ formatDate(selectedOrder.delivery.actualDate) }}
              </p>
              <p v-if="selectedOrder.delivery?.trackingNumber">
                <strong>Tracking Number:</strong> {{ selectedOrder.delivery.trackingNumber }}
              </p>
            </div>
          </div>
          <div class="order-items-section">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.orderItems" :key="item.orderItemId">
                  <td>{{ item.product?.productName || 'Unknown Product' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>R{{ (item.price || 0).toFixed(2) }}</td>
                  <td>R{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import jsPDF from 'jspdf'
import emailService from '@/services/emailService'
import {
  formatOrderStatus,
  formatPaymentStatus,
  formatDeliveryStatus
} from '@/utils/statusUtils'

// Reactive data
const orders = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const statusFilter = ref('')
const paymentFilter = ref('')
const deliveryFilter = ref('')
const selectedOrder = ref(null)

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderId.toString().includes(term) ||
      (order.user?.name || '').toLowerCase().includes(term) ||
      (order.user?.surname || '').toLowerCase().includes(term) ||
      (order.user?.email || '').toLowerCase().includes(term)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.orderStatus === statusFilter.value)
  }

  // Filter by payment method
  if (paymentFilter.value) {
    filtered = filtered.filter(order => order.payment?.paymentMethod === paymentFilter.value)
  }

  // Filter by delivery method
  if (deliveryFilter.value) {
    filtered = filtered.filter(order => order.delivery?.deliveryMethod === deliveryFilter.value)
  }

  return filtered
})

// Methods
const fetchOrders = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('Fetching all orders for admin...')
    const response = await api.getAllOrdersForAdmin()

    // Handle different response structures
    let ordersData = response
    if (response && typeof response === 'object') {
      // If response is wrapped in an object, try common property names
      ordersData = response.data || response.orders || response.content || response
    }

    // Ensure we have an array
    orders.value = Array.isArray(ordersData) ? ordersData : []

    console.log('Orders fetched successfully:', orders.value.length, 'orders')
    console.log('Orders data:', orders.value)
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = err.response?.data?.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    console.log(`Updating order ${orderId} status to ${newStatus}`)
    await api.updateOrderStatus(orderId, newStatus)
    console.log('Order status updated successfully')
    // No need to refetch - the status is already updated in the UI
  } catch (err) {
    console.error('Error updating order status:', err)
    // Revert the status change in the UI
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      // This will trigger a re-render and revert the select
      await fetchOrders()
    }
    alert('Failed to update order status')
  }
}

const updatePaymentStatus = async (orderId, newStatus) => {
  try {
    console.log(`Updating payment status for order ${orderId} to ${newStatus}`)
    await api.updateOrderPaymentStatus(orderId, newStatus)
    console.log('Payment status updated successfully')
  } catch (err) {
    console.error('Error updating payment status:', err)
    // Revert the status change in the UI
    await fetchOrders()
    alert('Failed to update payment status: ' + (err.response?.data?.message || err.message))
  }
}

const updateDeliveryStatus = async (orderId, newStatus) => {
  try {
    console.log(`Updating delivery status for order ${orderId} to ${newStatus}`)
    await api.updateOrderDeliveryStatus(orderId, newStatus)
    console.log('Delivery status updated successfully')

    // Send email notifications for specific status changes
    const order = orders.value.find(o => o.orderId === orderId)
    if (order && order.user?.email) {
      try {
        const orderData = {
          orderId: order.orderId,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          paymentMethod: order.payment?.paymentMethod,
          deliveryMethod: order.delivery?.deliveryMethod,
          deliveryAddress: order.delivery?.address,
          orderItems: order.orderItems || [],
          customerName: order.user.name && order.user.surname
            ? `${order.user.name} ${order.user.surname}`
            : order.user.username || 'Valued Customer'
        }

        // Send appropriate email based on status
        if (newStatus === 'OUT_FOR_DELIVERY') {
          const emailResult = await emailService.sendOrderShipped(orderData, order.user.email)
          if (emailResult.success) {
            console.log('Order shipped email sent successfully')
          } else {
            console.warn('Failed to send order shipped email:', emailResult.error)
          }
        }
      } catch (emailError) {
        console.error('Error sending delivery status email:', emailError)
        // Don't fail the status update if email fails
      }
    }

  } catch (err) {
    console.error('Error updating delivery status:', err)
    // Revert the status change in the UI
    await fetchOrders()
    alert('Failed to update delivery status: ' + (err.response?.data?.message || err.message))
  }
}

const deleteOrder = async (orderId) => {
  if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    return
  }

  try {
    console.log(`Deleting order ${orderId}`)
    await api.deleteOrder(orderId)
    console.log('Order deleted successfully')

    // Remove from local array
    orders.value = orders.value.filter(order => order.orderId !== orderId)
  } catch (err) {
    console.error('Error deleting order:', err)
    alert('Failed to delete order: ' + (err.response?.data?.message || 'Unknown error'))
  }
}

const viewOrderDetails = (order) => {
  selectedOrder.value = order
}

const closeModal = () => {
  selectedOrder.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

const formatCurrency = (amount) => {
  if (amount == null || amount === undefined) return 'R0.00'
  return `R${parseFloat(amount).toFixed(2)}`
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

const getItemCount = (order) => {
  if (!order.orderItems) return 0
  return order.orderItems.reduce((total, item) => total + (item.quantity || 0), 0)
}

const formatPaymentMethod = (method) => {
  if (!method) return 'Not specified'

  const methodMap = {
    'CASH_ON_DELIVERY': 'Cash on Delivery',
    'CASH_ON_COLLECTION': 'Cash on Collection',
    'CREDIT_CARD': 'Credit Card',
    'BANK_TRANSFER': 'Bank Transfer',
    'MOBILE_PAYMENT': 'Mobile Payment'
  }

  return methodMap[method] || method.replace(/_/g, ' ')
}

const formatDeliveryMethod = (method) => {
  if (!method) return 'Not specified'

  const methodMap = {
    'DELIVERY': 'Home Delivery',
    'COLLECTION': 'Store Collection',
    'PICKUP': 'Pickup',
    'COURIER': 'Courier Service'
  }

  return methodMap[method] || method.replace(/_/g, ' ')
}

const generatePDF = async (order) => {
  try {
    console.log('Generating PDF for order:', order.orderId)

    const pdf = new jsPDF('p', 'mm', 'a4')

    // Set font
    pdf.setFont('helvetica')

    // Header
    pdf.setFontSize(24)
    pdf.setTextColor(0, 123, 255) // Blue color
    pdf.text('TYMELESS TYRE', 105, 30, { align: 'center' })

    pdf.setFontSize(18)
    pdf.setTextColor(102, 102, 102) // Gray color
    pdf.text('Order Receipt', 105, 45, { align: 'center' })

    // Reset color to black
    pdf.setTextColor(0, 0, 0)

    // Order Info
    let yPos = 70
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Order Details', 20, yPos)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    yPos += 10
    pdf.text(`Order #: ${order.orderId}`, 20, yPos)
    yPos += 8
    pdf.text(`Date: ${formatDate(order.orderDate)}`, 20, yPos)
    yPos += 8
    pdf.text(`Status: ${formatOrderStatus(order.orderStatus)}`, 20, yPos)

    // Customer Info
    yPos += 20
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Customer Information', 20, yPos)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    yPos += 10
    pdf.text(`Name: ${getCustomerName(order)}`, 20, yPos)
    yPos += 8
    pdf.text(`Email: ${order.user?.email || 'N/A'}`, 20, yPos)
    yPos += 8
    pdf.text(`Phone: ${order.user?.phoneNumber || 'N/A'}`, 20, yPos)

    // Items Header
    yPos += 20
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Order Items', 20, yPos)

    // Items Table Header
    yPos += 15
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Product', 20, yPos)
    pdf.text('Qty', 120, yPos)
    pdf.text('Price', 140, yPos)
    pdf.text('Subtotal', 170, yPos)

    // Draw line under header
    yPos += 2
    pdf.line(20, yPos, 190, yPos)

    // Items
    pdf.setFont('helvetica', 'normal')
    yPos += 8

    let total = 0
    for (const item of order.orderItems || []) {
      if (yPos > 250) { // Start new page if needed
        pdf.addPage()
        yPos = 30
      }

      const productName = item.product?.productName || 'Unknown Product'
      const productModel = item.product?.productModel || ''

      // Product name (wrap if too long)
      if (productName.length > 25) {
        pdf.text(productName.substring(0, 25) + '...', 20, yPos)
      } else {
        pdf.text(productName, 20, yPos)
      }

      if (productModel) {
        yPos += 6
        pdf.setFontSize(8)
        pdf.setTextColor(102, 102, 102)
        pdf.text(productModel, 20, yPos)
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        yPos += 6
      } else {
        yPos += 8
      }

      // Quantity, Price, Subtotal
      pdf.text(String(item.quantity || 0), 120, yPos - (productModel ? 6 : 0))
      pdf.text(formatCurrency(item.price || 0), 140, yPos - (productModel ? 6 : 0))
      pdf.text(formatCurrency(item.subtotal || 0), 170, yPos - (productModel ? 6 : 0))

      total += item.subtotal || 0
      yPos += 4
    }

    // Total
    yPos += 15
    pdf.line(20, yPos, 190, yPos)
    yPos += 10
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Amount: ${formatCurrency(order.totalAmount || total)}`, 20, yPos)

    // Footer
    yPos += 30
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Thank you for your business!', 105, yPos, { align: 'center' })
    yPos += 8
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-ZA')}`, 105, yPos, { align: 'center' })

    // Save PDF
    const fileName = `receipt-order-${order.orderId}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('PDF generated successfully:', fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF receipt. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.orders-header {
  margin-bottom: 2rem;
}

.orders-header h1 {
  color: #333;
  margin-bottom: 1rem;
}

.orders-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-retry:hover {
  background: #0056b3;
}

.orders-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-controls {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input,
.status-filter,
.payment-filter,
.delivery-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.status-filter,
.payment-filter,
.delivery-filter {
  min-width: 150px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.order-row:hover {
  background: #f8f9fa;
}

.order-id {
  font-weight: 600;
  color: #007bff;
}

.customer-info div {
  font-weight: 500;
}

.customer-info small {
  color: #666;
  font-size: 0.8rem;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
}

.status-pending,
.status-PENDING { border-color: #ffc107; background: #fff3cd; }
.status-confirmed,
.status-CONFIRMED { border-color: #007bff; background: #d1ecf1; }
.status-processing,
.status-PROCESSING { border-color: #6f42c1; background: #e2d9f3; }
.status-shipped,
.status-SHIPPED { border-color: #17a2b8; background: #d1ecf1; }
.status-completed,
.status-COMPLETED { border-color: #28a745; background: #d4edda; }
.status-cancelled,
.status-CANCELLED { border-color: #dc3545; background: #f8d7da; }
.status-unknown { border-color: #6c757d; background: #e9ecef; }
.status-confirmed { border-color: #28a745; background: #d4edda; }
.status-completed { border-color: #28a745; background: #d4edda; }
.status-failed { border-color: #dc3545; background: #f8d7da; }
.status-in_transit { border-color: #007bff; background: #d1ecf1; }
.status-out_for_delivery { border-color: #17a2b8; background: #d1ecf1; }
.status-ready_for_collection { border-color: #ffc107; background: #fff3cd; }
.status-collected { border-color: #28a745; background: #d4edda; }
.status-failed_delivery { border-color: #dc3545; background: #f8d7da; }
.status-returned { border-color: #6c757d; background: #e9ecef; }

.payment-info, .delivery-info {
  min-width: 150px;
}

.payment-method, .delivery-method {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.payment-status-select, .delivery-status-select {
  width: 100%;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  margin-top: 0.25rem;
}

.no-payment, .no-delivery {
  color: #999;
  font-style: italic;
  font-size: 0.8rem;
}

.order-total {
  font-weight: 600;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-pdf, .btn-delete {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.btn-view {
  background: #007bff;
  color: white;
}

.btn-view:hover {
  background: #0056b3;
}

.btn-pdf {
  background: #28a745;
  color: white;
}

.btn-pdf:hover {
  background: #1e7e34;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
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
  border-radius: 8px;
  max-width: 800px;
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
  background: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-section p {
  margin: 0.5rem 0;
  color: #666;
}

.order-items-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.address-details {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #555;
  margin-top: 0.25rem;
}

.modal-body .order-info {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .orders-view {
    padding: 1rem;
  }

  .orders-stats {
    grid-template-columns: 1fr;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .orders-table {
    font-size: 0.8rem;
  }

  .orders-table th,
  .orders-table td {
    padding: 0.5rem;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-info {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
