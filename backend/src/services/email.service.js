const createTransporter = require('../config/email');
const config = require('../config');

/**
 * Send an email using the configured transporter.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Email failed to ${to}:`, error.message);
    // Don't throw — email failures shouldn't crash the request
  }
};

// ─── Registration Success Email ────────────────────────
const sendRegistrationEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .body { padding: 30px; }
        .body h2 { color: #333; margin-top: 0; }
        .body p { color: #666; line-height: 1.6; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SD COLLECTIONS!</h1>
          <p>Your account has been created successfully</p>
        </div>
        <div class="body">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for joining SD COLLECTIONS! We're thrilled to have you on board.</p>
          <p>You can now browse our collection, add items to your wishlist, and start shopping.</p>
          <a href="${config.clientUrl}" class="btn">Start Shopping →</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SD COLLECTIONS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to SD COLLECTIONS! 🎉',
    html,
  });
};

// ─── Order Confirmation Email ──────────────────────────
const sendOrderConfirmation = async (order, user) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .body { padding: 30px; }
        .body h2 { color: #333; margin-top: 0; }
        .body p { color: #666; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f8f9fa; padding: 12px 10px; text-align: left; font-size: 14px; color: #555; }
        .total-row { font-weight: bold; font-size: 16px; color: #333; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
        </div>
        <div class="body">
          <h2>Hi ${user.name},</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully!</p>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee;">Subtotal</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee;">Tax</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee;">Shipping</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.shippingCharge.toFixed(2)}</td>
              </tr>
              ${order.discount > 0 ? `<tr><td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee; color: #38ef7d;">Discount</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #38ef7d;">-₹${order.discount.toFixed(2)}</td></tr>` : ''}
              <tr class="total-row">
                <td colspan="2" style="padding: 12px 10px;">Total</td>
                <td style="padding: 12px 10px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Shipping Address:</strong><br/>
            ${order.shippingAddress.fullName}<br/>
            ${order.shippingAddress.addressLine1}<br/>
            ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br/>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SD COLLECTIONS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed - #${order.orderNumber} `,
    html,
  });
};

// ─── Payment Success Email ─────────────────────────────
const sendPaymentSuccess = async (order, user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .body { padding: 30px; }
        .body h2 { color: #333; margin-top: 0; }
        .body p { color: #666; line-height: 1.6; }
        .amount { font-size: 36px; font-weight: bold; color: #11998e; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="body">
          <h2>Hi ${user.name},</h2>
          <p>Your payment for order <strong>#${order.orderNumber}</strong> has been received.</p>
          <div class="amount">₹${order.totalAmount.toFixed(2)}</div>
          <p><strong>Transaction ID:</strong> ${order.razorpayPaymentId || 'N/A'}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p>Your order is being processed and you will receive shipping updates soon.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SD COLLECTIONS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Payment Received - ₹${order.totalAmount.toFixed(2)} ✅`,
    html,
  });
};

// ─── OTP Verification Email ────────────────────────────
const sendOtpEmail = async (email, otp, purpose) => {
  const purposeMap = {
    'register': { title: 'Verify Your Email', subtitle: 'Complete your SD COLLECTIONS registration', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    'login': { title: 'Login Verification', subtitle: 'Verify your identity to continue', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    'admin-login': { title: 'Admin Login Verification', subtitle: 'Secure admin access verification', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  };

  const info = purposeMap[purpose] || purposeMap['login'];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: ${info.gradient}; padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .body { padding: 30px; text-align: center; }
        .body p { color: #666; line-height: 1.6; }
        .otp-box { display: inline-block; background: #f8f9fa; border: 2px dashed #667eea; border-radius: 12px; padding: 20px 40px; margin: 25px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #333; font-family: 'Courier New', monospace; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; color: #856404; margin: 20px 0; text-align: left; font-size: 13px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #999; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${info.title}</h1>
          <p>${info.subtitle}</p>
        </div>
        <div class="body">
          <p>Use the following OTP to ${purpose === 'register' ? 'complete your registration' : 'log in to your account'}:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p style="color: #999; font-size: 14px;">This code is valid for <strong>5 minutes</strong>.</p>
          <div class="warning">
            ⚠️ Do not share this OTP with anyone. SD COLLECTIONS will never ask you for your OTP via phone or chat.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SD COLLECTIONS. All rights reserved.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${otp} is your SD COLLECTIONS verification code 🔐`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendOtpEmail,
};
