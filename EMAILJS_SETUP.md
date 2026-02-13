# EmailJS Configuration for Tymeless Tyre

This document explains how to set up EmailJS for sending order confirmation and status update emails.

## 1. EmailJS Account Setup

1. Go to https://www.emailjs.com/
2. Create a free account
3. Verify your email address

## 2. Create Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Configure with your email credentials
5. Note down the **Service ID** (e.g., `service_gmail_123`)

## 3. Create Email Templates

Create the following 2 templates in your EmailJS dashboard:

### Template 1: Order Confirmation (`template_order_confirmation`)

**Subject:** Order Confirmed - Order #{{order_id}} - Tymeless Tyre

**HTML Body:**
```html
<div
  style="
    font-family: system-ui, sans-serif, Arial;
    font-size: 14px;
    color: #333;
    padding: 14px 8px;
    background-color: #f5f5f5;
  "
>
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="border-top: 6px solid #458500; padding: 16px">
      <a
        style="text-decoration: none; outline: none; margin-right: 8px; vertical-align: middle"
        href="https://tymelesstyre.com"
        target="_blank"
      >
        <img
          style="height: 32px; vertical-align: middle"
          height="32px"
          src="cid:logo.png"
          alt="Tymeless Tyre Logo"
        />
      </a>
      <span
        style="
          font-size: 16px;
          vertical-align: middle;
          border-left: 1px solid #333;
          padding-left: 8px;
        "
      >
        <strong>Order Confirmation</strong>
      </span>
    </div>
    <div style="padding: 0 16px">
      <p>Dear {{customer_name}},</p>
      <p><strong>Thank you for your order! We have successfully received and confirmed your order.</strong></p>
      
      <div
        style="
          background-color: #f0f8f0;
          border: 1px solid #458500;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        "
      >
        <h3 style="margin: 0 0 8px 0; color: #458500;">Your Order Details</h3>
        <p style="margin: 0; font-size: 16px;"><strong>Order ID: {{order_id}}</strong></p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
          Please keep this Order ID for your records and use it for any future communication regarding this order.
        </p>
      </div>
      
      <div
        style="
          text-align: left;
          font-size: 14px;
          padding-bottom: 4px;
          border-bottom: 2px solid #333;
          margin: 24px 0 16px 0;
        "
      >
        <strong>Order Items</strong>
      </div>
      {{#order_items}}
      <table style="width: 100%; border-collapse: collapse">
        <tr style="vertical-align: top">
          <td style="padding: 16px 8px 0 4px; display: inline-block; width: max-content">
            <img style="height: 64px" height="64px" src="{{image_url}}" alt="{{name}}" />
          </td>
          <td style="padding: 16px 8px 0 8px; width: 100%">
            <div>{{name}}</div>
            <div style="font-size: 14px; color: #888; padding-top: 4px">QTY: {{quantity}}</div>
          </td>
          <td style="padding: 16px 4px 0 0; white-space: nowrap">
            <strong>R{{price}}</strong>
          </td>
        </tr>
      </table>
      {{/order_items}}
      
      <div style="padding: 24px 0">
        <div style="border-top: 2px solid #333"></div>
      </div>
      <table style="border-collapse: collapse; width: 100%; text-align: right">
        <tr>
          <td style="width: 60%"></td>
          <td>Payment Method</td>
          <td style="padding: 8px; white-space: nowrap">{{payment_method}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td>Delivery Method</td>
          <td style="padding: 8px; white-space: nowrap">{{delivery_method}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td style="border-top: 2px solid #333">
            <strong style="white-space: nowrap">Order Total</strong>
          </td>
          <td style="padding: 16px 8px; border-top: 2px solid #333; white-space: nowrap">
            <strong>{{total_amount}}</strong>
          </td>
        </tr>
      </table>
      
      {{#delivery_address}}
      <div style="padding: 16px 0">
        <strong>Delivery Address:</strong><br>
        {{delivery_address}}
      </div>
      {{/delivery_address}}
      
      <div
        style="
          background-color: #f8f9fa;
          border-left: 4px solid #458500;
          padding: 16px;
          margin: 24px 0;
        "
      >
        <h4 style="margin: 0 0 8px 0; color: #458500;">What's Next?</h4>
        <p style="margin: 0 0 8px 0;">📦 We are now preparing your order for dispatch</p>
        <p style="margin: 0 0 8px 0;">🚚 We'll send you tracking information when your order ships</p>
        <p style="margin: 0;"><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
      </div>
      
      <div style="padding: 16px 0; border-top: 1px solid #eee; margin-top: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;">
          <strong>Need help?</strong> Contact our customer service team:
        </p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          📧 support@tymelesstyre.com | 📞 +27 11 123 4567<br>
          <strong>Remember to include your Order ID: {{order_id}} in any communication</strong>
        </p>
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This email was sent to {{customer_email}}<br />
      You received this email because you placed an order with Tymeless Tyre
    </p>
  </div>
</div>
```

### Template 2: Order Shipped (`template_order_shipped`)

**Subject:** Your Order is Out for Delivery! - Order #{{order_id}} - Tymeless Tyre

**HTML Body:**
```html
<div
  style="
    font-family: system-ui, sans-serif, Arial;
    font-size: 14px;
    color: #333;
    padding: 14px 8px;
    background-color: #f5f5f5;
  "
>
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="border-top: 6px solid #458500; padding: 16px">
      <a
        style="text-decoration: none; outline: none; margin-right: 8px; vertical-align: middle"
        href="https://tymelesstyre.com"
        target="_blank"
      >
        <img
          style="height: 32px; vertical-align: middle"
          height="32px"
          src="cid:logo.png"
          alt="Tymeless Tyre Logo"
        />
      </a>
      <span
        style="
          font-size: 16px;
          vertical-align: middle;
          border-left: 1px solid #333;
          padding-left: 8px;
        "
      >
        <strong>Your Order is Out for Delivery!</strong>
      </span>
    </div>
    <div style="padding: 0 16px">
      <p>Great news! Your order is now out for delivery and on its way to you.</p>
      <div
        style="
          text-align: left;
          font-size: 14px;
          padding-bottom: 4px;
          border-bottom: 2px solid #333;
        "
      >
        <strong>Order # {{order_id}}</strong>
      </div>
      {{#orders}}
      <table style="width: 100%; border-collapse: collapse">
        <tr style="vertical-align: top">
          <td style="padding: 24px 8px 0 4px; display: inline-block; width: max-content">
            <img style="height: 64px" height="64px" src="{{image_url}}" alt="{{name}}" />
          </td>
          <td style="padding: 24px 8px 0 8px; width: 100%">
            <div>{{name}}</div>
            <div style="font-size: 14px; color: #888; padding-top: 4px">QTY: {{units}}</div>
          </td>
          <td style="padding: 24px 4px 0 0; white-space: nowrap">
            <strong>R{{price}}</strong>
          </td>
        </tr>
      </table>
      {{/orders}}
      <div style="padding: 24px 0">
        <div style="border-top: 2px solid #333"></div>
      </div>
      <table style="border-collapse: collapse; width: 100%; text-align: right">
        <tr>
          <td style="width: 60%"></td>
          <td>Shipping</td>
          <td style="padding: 8px; white-space: nowrap">R{{cost.shipping}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td>Taxes</td>
          <td style="padding: 8px; white-space: nowrap">R{{cost.tax}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td style="border-top: 2px solid #333">
            <strong style="white-space: nowrap">Order Total</strong>
          </td>
          <td style="padding: 16px 8px; border-top: 2px solid #333; white-space: nowrap">
            <strong>R{{cost.total}}</strong>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto">
    <p style="color: #999">
      This email was sent to {{email}}<br />
      You received this email because your order is out for delivery
    </p>
  </div>
</div>
```

## 4. Configuration

1. In your EmailJS dashboard, go to "Account" > "API Keys"
2. Copy your **Public Key**
3. Update the email service configuration in `src/services/emailService.js`:

```javascript
// Replace these with your actual EmailJS credentials
this.serviceId = 'your_service_id_here'     // e.g., 'service_gmail_123'
this.publicKey = 'your_public_key_here'     // e.g., 'user_abc123def456'

// Update template IDs to match your templates
this.templates = {
  orderConfirmation: 'template_order_confirmation',
  orderShipped: 'template_order_shipped'
}
```

## 5. Testing

1. Create a test template with a simple message
2. Use the `testEmailConfiguration()` method in the email service
3. Send a test email to verify everything works

## 6. Usage

The email service is automatically triggered:

- **Order Confirmation**: When a customer places an order (CheckoutView)
- **Order Shipped**: When admin changes delivery status to "OUT_FOR_DELIVERY"

## 7. Troubleshooting

### Common Issues:

1. **Emails not sending**: Check service ID and public key
2. **Template not found**: Verify template IDs match exactly
3. **Variables not showing**: Ensure template variables use correct syntax `{{variable_name}}`
4. **CORS errors**: Make sure you're using the browser SDK, not Node.js SDK

### Debug Steps:

1. Check browser console for errors
2. Verify EmailJS dashboard for activity logs
3. Test with a simple template first
4. Ensure email addresses are valid

## 8. Security Notes

- EmailJS public key is safe to expose in frontend code
- Never include private keys in frontend applications
- Consider rate limiting to prevent spam
- Validate email addresses before sending

## 9. Customization

You can customize:
- Email templates design and content
- Email sending triggers
- Additional template variables
- Error handling and retry logic

## 10. Monthly Limits

EmailJS free tier includes:
- 200 emails per month
- 2 email services
- EmailJS branding in emails

Consider upgrading for production use with higher volumes.