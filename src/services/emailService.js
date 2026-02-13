import emailjs from '@emailjs/browser'

class EmailService {
  constructor() {

    this.serviceId = 'service_vrhiix6'
    this.publicKey = 'tgFTeXRSQiEA52Sk4'

    // Template IDs for different email types
    this.templates = {
      orderConfirmation: 'template_3mz138e', // Order confirmation template
      orderShipped: 'template_japst9p'       // Order shipping template
    }

    // Initialize EmailJS
    emailjs.init(this.publicKey)
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order details
   * @param {string} customerEmail - Customer's email address
   */
  async sendOrderConfirmation(orderData, customerEmail) {
    try {
      // Try minimal parameters first to test email delivery
      const templateParams = {
        // Standard EmailJS recipient parameters
        to_name: orderData.customerName || 'Valued Customer',
        to_email: customerEmail,
        from_name: 'Tymeless Tyre',
        reply_to: 'support@tymelesstyre.com',

        // Backup recipient parameters (try different naming conventions)
        user_name: orderData.customerName || 'Valued Customer',
        user_email: customerEmail,
        email: customerEmail,
        name: orderData.customerName || 'Valued Customer',

        // Content parameters
        customer_name: orderData.customerName || 'Valued Customer',
        customer_email: customerEmail,
        order_id: orderData.orderId,
        order_date: new Date(orderData.orderDate).toLocaleDateString(),
        total_amount: `R${orderData.totalAmount.toFixed(2)}`,
        payment_method: this.formatPaymentMethod(orderData.paymentMethod),
        delivery_method: this.formatDeliveryMethod(orderData.deliveryMethod),
        delivery_address: this.formatAddress(orderData.deliveryAddress) || 'Address will be confirmed during processing',
        has_delivery_address: !!this.formatAddress(orderData.deliveryAddress),
        estimated_delivery: this.getEstimatedDelivery(orderData.deliveryMethod),
        // Flatten order items into individual variables for simple templates
        order_items_html: this.formatOrderItemsAsHtml(orderData.orderItems),
        // Also keep array format in case it works
        order_items: this.formatOrderItemsForTemplate(orderData.orderItems)
      }

      // Debug: Log the template parameters being sent
      console.log('EmailJS Template Parameters:', JSON.stringify(templateParams, null, 2))
      console.log('Service ID:', this.serviceId)
      console.log('Template ID:', this.templates.orderConfirmation)

      const response = await emailjs.send(
        this.serviceId,
        this.templates.orderConfirmation,
        templateParams
      )

      console.log('Order confirmation email sent successfully:', response)
      return { success: true, response }
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        text: error.text
      })
      return { success: false, error }
    }
  }

  /**
   * Send order shipped notification email
   * @param {Object} orderData - Order details
   * @param {string} customerEmail - Customer's email address
   * @param {string} trackingNumber - Tracking number (optional)
   */
  async sendOrderShipped(orderData, customerEmail) {
    try {
      const templateParams = {
        to_name: orderData.customerName || 'Valued Customer',
        to_email: customerEmail,
        email: customerEmail,
        order_id: orderData.orderId,
        orders: this.formatOrderItemsForShipping(orderData.orderItems),
        cost: {
          shipping: '0.00',
          tax: '0.00',
          total: orderData.totalAmount.toFixed(2)
        }
      }

      const response = await emailjs.send(
        this.serviceId,
        this.templates.orderShipped,
        templateParams
      )

      console.log('Order shipped email sent successfully:', response)
      return { success: true, response }
    } catch (error) {
      console.error('Failed to send order shipped email:', error)
      return { success: false, error }
    }
  }

  /**
   * Format payment method for display
   * @param {string} paymentMethod
   * @returns {string}
   */
  formatPaymentMethod(paymentMethod) {
    const methods = {
      'CASH_ON_DELIVERY': 'Cash on Delivery',
      'CASH_ON_COLLECTION': 'Cash on Collection',
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card'
    }
    return methods[paymentMethod] || paymentMethod
  }

  /**
   * Format delivery method for display
   * @param {string} deliveryMethod
   * @returns {string}
   */
  formatDeliveryMethod(deliveryMethod) {
    const methods = {
      'DELIVERY': 'Home Delivery',
      'COLLECTION': 'Store Collection'
    }
    return methods[deliveryMethod] || deliveryMethod
  }

  /**
   * Format address object to string
   * @param {Object} address
   * @returns {string}
   */
  formatAddress(address) {
    console.log('formatAddress called with:', address)
    console.log('Address type:', typeof address)

    if (!address) {
      console.log('No address provided, returning null for conditional template')
      return null // Return null to indicate no address
    }

    // Handle different address formats
    if (typeof address === 'string') {
      console.log('Address is string:', address)
      return address // Address is already formatted as string
    }

    console.log('Processing address object:', JSON.stringify(address, null, 2))

    // Handle address object with different possible field names
    const parts = [
      address.street || address.streetAddress || address.addressLine1,
      address.suburb || address.district,
      address.city || address.town,
      address.province || address.state,
      address.postalCode || address.zipCode || address.postCode,
      address.country
    ].filter(Boolean)

    console.log('Address parts extracted:', parts)

    return parts.length > 0 ? parts.join(', ') : null // Return null if no valid parts
  }  /**
   * Format order items for email display
   * @param {Array} orderItems
   * @returns {string}
   */
  formatOrderItems(orderItems) {
    if (!orderItems || orderItems.length === 0) return 'No items'

    return orderItems.map(item => {
      const productName = item.product?.productName || item.productName || 'Unknown Product'
      const quantity = item.quantity || 1
      const price = item.price || 0
      const total = (price * quantity).toFixed(2)

      return `• ${productName} (Qty: ${quantity}) - R${price.toFixed(2)} each = R${total}`
    }).join('\n')
  }

  /**
   * Format order items for template loop structure
   * @param {Array} orderItems
   * @returns {Array}
   */
  formatOrderItemsForTemplate(orderItems) {
    if (!orderItems || orderItems.length === 0) return []

    return orderItems.map(item => {
      const productName = item.product?.productName || item.productName || 'Unknown Product'
      const quantity = item.quantity || 1
      const price = item.price || 0

      return {
        name: productName,
        quantity: quantity,
        price: price.toFixed(2),
        image_url: item.product?.imageUrl || item.imageUrl || 'https://via.placeholder.com/64x64?text=Tyre'
      }
    })
  }

  /**
   * Format order items for shipping email template
   * @param {Array} orderItems
   * @returns {Array}
   */
  formatOrderItemsForShipping(orderItems) {
    if (!orderItems || orderItems.length === 0) return []

    return orderItems.map(item => {
      const productName = item.product?.productName || item.productName || 'Unknown Product'
      const quantity = item.quantity || 1
      const price = item.price || 0

      return {
        name: productName,
        units: quantity,
        price: price.toFixed(2),
        image_url: item.product?.imageUrl || item.imageUrl || 'https://via.placeholder.com/64x64?text=Tyre'
      }
    })
  }

  /**
   * Format order items as HTML string for simple template insertion
   * @param {Array} orderItems
   * @returns {string}
   */
  formatOrderItemsAsHtml(orderItems) {
    if (!orderItems || orderItems.length === 0) {
      return '<p>No items found</p>'
    }

    return orderItems.map(item => {
      const productName = item.product?.productName || item.productName || 'Unknown Product'
      const quantity = item.quantity || 1
      const price = item.price || 0
      const imageUrl = item.product?.imageUrl || item.imageUrl || 'https://via.placeholder.com/64x64?text=Tyre'

      return `
        <table style="width: 100%; border-collapse: collapse">
          <tr style="vertical-align: top">
            <td style="padding: 16px 8px 0 4px; display: inline-block; width: max-content">
              <img style="height: 64px" height="64px" src="${imageUrl}" alt="${productName}" />
            </td>
            <td style="padding: 16px 8px 0 8px; width: 100%">
              <div>${productName}</div>
              <div style="font-size: 14px; color: #888; padding-top: 4px">QTY: ${quantity}</div>
            </td>
            <td style="padding: 16px 4px 0 0; white-space: nowrap">
              <strong>R${price.toFixed(2)}</strong>
            </td>
          </tr>
        </table>
      `
    }).join('')
  }

  /**
   * Get estimated delivery date
   * @param {string} deliveryMethod
   * @param {boolean} isShipped - Whether the order has been shipped
   * @returns {string}
   */
  getEstimatedDelivery(deliveryMethod, isShipped = false) {
    if (deliveryMethod === 'COLLECTION') {
      return 'Available for collection within 2-3 business days'
    }

    const days = isShipped ? 2 : 5 // 2 days if shipped, 5 days from order
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + days)

    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Test email configuration with simple parameters
   * @param {string} testEmail - Email to send test to
   */
  async testEmailConfiguration(testEmail) {
    try {
      // Simple test parameters that should work with your template
      const testParams = {
        to_name: 'Test Customer',
        to_email: testEmail,
        customer_name: 'Test Customer',
        customer_email: testEmail,
        order_id: 'TEST123',
        order_date: new Date().toLocaleDateString(),
        total_amount: 'R100.00',
        payment_method: 'Cash on Delivery',
        delivery_method: 'Home Delivery',
        delivery_address: 'Test Address',
        order_items: [
          {
            name: 'Test Tyre',
            quantity: 1,
            price: '100.00',
            image_url: 'https://via.placeholder.com/64x64?text=Test'
          }
        ],
        estimated_delivery: 'Test Date'
      }

      console.log('Testing with simplified parameters:', testParams)

      const response = await emailjs.send(
        this.serviceId,
        this.templates.orderConfirmation,
        testParams
      )

      console.log('Test email sent successfully:', response)
      return { success: true, response }
    } catch (error) {
      console.error('Test email failed:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        text: error.text
      })
      return { success: false, error }
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService()
export default emailService
