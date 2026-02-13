/**
 * Status Utilities for Order Management System
 *
 * This file provides comprehensive status formatting and display logic
 * for the new order status enum system following the migration guide.
 */

// Order Status Display Configuration
export const ORDER_STATUS_CONFIG = {
  'PENDING': {
    label: 'Pending Payment',
    description: 'Order created, awaiting payment',
    color: 'orange',
    bgColor: '#fff3cd',
    borderColor: '#ffc107',
    icon: '⏳',
    cssClass: 'status-pending'
  },
  'CONFIRMED': {
    label: 'Order Confirmed',
    description: 'Payment received, order confirmed',
    color: 'blue',
    bgColor: '#d1ecf1',
    borderColor: '#007bff',
    icon: '✅',
    cssClass: 'status-confirmed'
  },
  'PROCESSING': {
    label: 'Being Prepared',
    description: 'Order being prepared/packed',
    color: 'purple',
    bgColor: '#e2d9f3',
    borderColor: '#6f42c1',
    icon: '📦',
    cssClass: 'status-processing'
  },
  'SHIPPED': {
    label: 'Shipped/Ready',
    description: 'Order shipped or ready for collection',
    color: 'teal',
    bgColor: '#d1ecf1',
    borderColor: '#17a2b8',
    icon: '🚚',
    cssClass: 'status-shipped'
  },
  'COMPLETED': {
    label: 'Completed',
    description: 'Order completed (reviews enabled)',
    color: 'green',
    bgColor: '#d4edda',
    borderColor: '#28a745',
    icon: '🎉',
    cssClass: 'status-completed'
  },
  'CANCELLED': {
    label: 'Cancelled',
    description: 'Order cancelled',
    color: 'red',
    bgColor: '#f8d7da',
    borderColor: '#dc3545',
    icon: '❌',
    cssClass: 'status-cancelled'
  }
}

// Payment Status Configuration
export const PAYMENT_STATUS_CONFIG = {
  'PENDING': {
    label: 'Payment Pending',
    color: 'orange',
    bgColor: '#fff3cd',
    borderColor: '#ffc107',
    cssClass: 'status-pending'
  },
  'CONFIRMED': {
    label: 'Payment Confirmed',
    color: 'blue',
    bgColor: '#d1ecf1',
    borderColor: '#007bff',
    cssClass: 'status-confirmed'
  },
  'COMPLETED': {
    label: 'Payment Completed',
    color: 'green',
    bgColor: '#d4edda',
    borderColor: '#28a745',
    cssClass: 'status-completed'
  },
  'FAILED': {
    label: 'Payment Failed',
    color: 'red',
    bgColor: '#f8d7da',
    borderColor: '#dc3545',
    cssClass: 'status-failed'
  },
  'CANCELLED': {
    label: 'Payment Cancelled',
    color: 'red',
    bgColor: '#f8d7da',
    borderColor: '#dc3545',
    cssClass: 'status-cancelled'
  }
}

// Delivery Status Configuration
export const DELIVERY_STATUS_CONFIG = {
  'PENDING': {
    label: 'Pending Collection/Delivery',
    color: 'orange',
    bgColor: '#fff3cd',
    borderColor: '#ffc107',
    cssClass: 'status-pending'
  },
  'CONFIRMED': {
    label: 'Confirmed for Collection/Delivery',
    color: 'blue',
    bgColor: '#d1ecf1',
    borderColor: '#007bff',
    cssClass: 'status-confirmed'
  },
  'IN_TRANSIT': {
    label: 'In Transit',
    color: 'blue',
    bgColor: '#d1ecf1',
    borderColor: '#007bff',
    cssClass: 'status-in-transit'
  },
  'OUT_FOR_DELIVERY': {
    label: 'Out for Delivery',
    color: 'teal',
    bgColor: '#d1ecf1',
    borderColor: '#17a2b8',
    cssClass: 'status-out-for-delivery'
  },
  'READY_FOR_COLLECTION': {
    label: 'Ready for Collection',
    color: 'purple',
    bgColor: '#e2d9f3',
    borderColor: '#6f42c1',
    cssClass: 'status-ready-for-collection'
  },
  'DELIVERED': {
    label: 'Delivered',
    color: 'green',
    bgColor: '#d4edda',
    borderColor: '#28a745',
    cssClass: 'status-delivered'
  },
  'COLLECTED': {
    label: 'Collected',
    color: 'green',
    bgColor: '#d4edda',
    borderColor: '#28a745',
    cssClass: 'status-collected'
  },
  'FAILED_DELIVERY': {
    label: 'Failed Delivery Attempt',
    color: 'red',
    bgColor: '#f8d7da',
    borderColor: '#dc3545',
    cssClass: 'status-failed-delivery'
  },
  'RETURNED': {
    label: 'Returned to Store',
    color: 'gray',
    bgColor: '#e9ecef',
    borderColor: '#6c757d',
    cssClass: 'status-returned'
  }
}

// Order Progress Steps Configuration
export const ORDER_PROGRESS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', description: 'Awaiting payment' },
  { key: 'CONFIRMED', label: 'Payment Confirmed', description: 'Order confirmed' },
  { key: 'PROCESSING', label: 'Preparing', description: 'Being prepared' },
  { key: 'SHIPPED', label: 'Shipped/Ready', description: 'On the way or ready for pickup' },
  { key: 'COMPLETED', label: 'Completed', description: 'Delivered or collected' }
]

/**
 * Get order status display information
 * @param {string} status - The order status enum value
 * @returns {object} Display configuration object
 */
export function getOrderStatusDisplay(status) {
  if (!status) return { label: 'Unknown', color: 'gray', icon: '❓', cssClass: 'status-unknown' }

  // Normalize legacy status values to new enum values
  const normalizedStatus = normalizeLegacyStatus(status)

  return ORDER_STATUS_CONFIG[normalizedStatus] || {
    label: status,
    color: 'gray',
    icon: '❓',
    cssClass: 'status-unknown'
  }
}

/**
 * Get payment status display information
 * @param {string} status - The payment status enum value
 * @returns {object} Display configuration object
 */
export function getPaymentStatusDisplay(status) {
  if (!status) return { label: 'Unknown', color: 'gray', cssClass: 'status-unknown' }

  const normalizedStatus = status.toUpperCase()

  return PAYMENT_STATUS_CONFIG[normalizedStatus] || {
    label: status,
    color: 'gray',
    cssClass: 'status-unknown'
  }
}

/**
 * Get delivery status display information
 * @param {string} status - The delivery status enum value
 * @returns {object} Display configuration object
 */
export function getDeliveryStatusDisplay(status) {
  if (!status) return { label: 'Unknown', color: 'gray', cssClass: 'status-unknown' }

  const normalizedStatus = status.toUpperCase()

  return DELIVERY_STATUS_CONFIG[normalizedStatus] || {
    label: status,
    color: 'gray',
    cssClass: 'status-unknown'
  }
}

/**
 * Check if an order is eligible for reviews
 * @param {object} order - The order object
 * @returns {boolean} True if reviews can be written
 */
export function canWriteReview(order) {
  return order && order.orderStatus === 'COMPLETED'
}

/**
 * Check if payment is completed
 * @param {object} payment - The payment object
 * @returns {boolean} True if payment is completed
 */
export function isPaymentCompleted(payment) {
  return payment && payment.paymentStatus === 'COMPLETED'
}

/**
 * Check if delivery is completed
 * @param {object} delivery - The delivery object
 * @returns {boolean} True if delivery is completed
 */
export function isDeliveryCompleted(delivery) {
  return delivery && (delivery.deliveryStatus === 'DELIVERED' || delivery.deliveryStatus === 'COLLECTED')
}

/**
 * Get the current step index in the order progress
 * @param {string} status - The order status
 * @returns {number} The current step index (0-based)
 */
export function getOrderProgressIndex(status) {
  if (!status) return 0

  const normalizedStatus = status.toUpperCase()
  const index = ORDER_PROGRESS_STEPS.findIndex(step => step.key === normalizedStatus)
  return index >= 0 ? index : 0
}

/**
 * Format order status for display (backward compatible)
 * @param {string} status - The order status
 * @returns {string} Formatted status label
 */
export function formatOrderStatus(status) {
  return getOrderStatusDisplay(status).label
}

/**
 * Format payment status for display (backward compatible)
 * @param {string} status - The payment status
 * @returns {string} Formatted status label
 */
export function formatPaymentStatus(status) {
  return getPaymentStatusDisplay(status).label
}

/**
 * Format delivery status for display (backward compatible)
 * @param {string} status - The delivery status
 * @returns {string} Formatted status label
 */
export function formatDeliveryStatus(status) {
  return getDeliveryStatusDisplay(status).label
}

/**
 * Get CSS class for order status (backward compatible)
 * @param {string} status - The order status
 * @returns {string} CSS class name
 */
export function getOrderStatusClass(status) {
  return getOrderStatusDisplay(status).cssClass
}

/**
 * Get CSS class for payment status (backward compatible)
 * @param {string} status - The payment status
 * @returns {string} CSS class name
 */
export function getPaymentStatusClass(status) {
  return getPaymentStatusDisplay(status).cssClass
}

/**
 * Get CSS class for delivery status (backward compatible)
 * @param {string} status - The delivery status
 * @returns {string} CSS class name
 */
export function getDeliveryStatusClass(status) {
  return getDeliveryStatusDisplay(status).cssClass
}

/**
 * Legacy support - map old status values to new ones
 * @param {string} oldStatus - The old status value
 * @returns {string} New status value
 */
export function mapLegacyStatus(oldStatus) {
  const legacyMap = {
    'delivered': 'COMPLETED',
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED',
    'processing': 'PROCESSING',
    'shipped': 'SHIPPED',
    'cancelled': 'CANCELLED'
  }

  return legacyMap[oldStatus?.toLowerCase()] || oldStatus?.toUpperCase()
}

/**
 * Validate if a status value is valid for orders
 * @param {string} status - The status to validate
 * @returns {boolean} True if valid
 */
export function isValidOrderStatus(status) {
  if (!status) return false

  const normalizedStatus = status.toUpperCase()
  return Object.keys(ORDER_STATUS_CONFIG).includes(normalizedStatus)
}

/**
 * Get all valid order status values
 * @returns {Array<string>} Array of valid status values
 */
export function getValidOrderStatuses() {
  return Object.keys(ORDER_STATUS_CONFIG)
}

/**
 * Get all valid payment status values
 * @returns {Array<string>} Array of valid status values
 */
export function getValidPaymentStatuses() {
  return Object.keys(PAYMENT_STATUS_CONFIG)
}

/**
 * Get all valid delivery status values
 * @returns {Array<string>} Array of valid status values
 */
export function getValidDeliveryStatuses() {
  return Object.keys(DELIVERY_STATUS_CONFIG)
}

/**
 * Map legacy status values to new enum values during transition period
 * @param {string} status The status value to normalize
 * @returns {string} The normalized status value
 */
export function normalizeLegacyStatus(status) {
  if (!status) return status

  // Handle legacy lowercase status values
  const legacyMapping = {
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED',
    'processing': 'PROCESSING',
    'shipped': 'SHIPPED',
    'delivered': 'COMPLETED',  // Key mapping for review system
    'cancelled': 'CANCELLED'
  }

  // If it's already uppercase, return as-is
  if (status === status.toUpperCase()) {
    return status
  }

  // Map legacy lowercase values
  return legacyMapping[status.toLowerCase()] || status.toUpperCase()
}

/**
 * Check if an order with the given status is eligible for reviews
 * @param {string} orderStatus - The order status to check
 * @returns {boolean} True if the order can be reviewed
 */
export function isEligibleForReview(orderStatus) {
  if (!orderStatus) return false

  const normalizedStatus = normalizeLegacyStatus(orderStatus)

  // Both COMPLETED and legacy DELIVERED statuses are eligible for reviews
  return normalizedStatus === 'COMPLETED' || normalizedStatus === 'DELIVERED'
}
