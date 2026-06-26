# SD COLLECTIONS — API Documentation

> Base URL: `http://localhost:5253/api`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Categories](#2-categories)
3. [Products](#3-products)
4. [Cart](#4-cart)
5. [Wishlist](#5-wishlist)
6. [Orders](#6-orders)
7. [Reviews](#7-reviews)
8. [Coupons](#8-coupons)
9. [Payments (Razorpay)](#9-payments-razorpay)
10. [Banners](#10-banners)
11. [Admin Dashboard](#11-admin-dashboard)

---

## Common Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response

```json
{
  "success": false,
  "status": "fail",
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

### Authentication

All protected routes require a JWT token sent via:
- **Cookie**: `token=<jwt>` (set automatically on login)
- **Header**: `Authorization: Bearer <jwt>`

---

## 1. Authentication

### POST `/auth/register`
Create a new user account.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| name | string | ✅ | Max 50 chars |
| email | string | ✅ | Valid email |
| phone | string | ❌ | 10-digit Indian number |
| password | string | ✅ | Min 6 chars, 1 uppercase, 1 lowercase, 1 number |

**Response**: `201` — User object + JWT token (also set as cookie)

---

### POST `/auth/login`
Login with email and password.

| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response**: `200` — User object + JWT token

---

### POST `/auth/logout` 🔒
Clear the auth cookie.

**Response**: `200` — Success message

---

### GET `/auth/profile` 🔒
Get current user's profile.

**Response**: `200` — User object

---

### PUT `/auth/profile` 🔒
Update profile. Supports `multipart/form-data` for image upload.

| Field | Type | Required |
|-------|------|----------|
| name | string | ❌ |
| phone | string | ❌ |
| profileImage | file | ❌ |

---

### PUT `/auth/change-password` 🔒

| Field | Type | Required |
|-------|------|----------|
| currentPassword | string | ✅ |
| newPassword | string | ✅ |

---

### POST `/auth/forgot-password`

| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |

**Response**: `200` — Sends reset email

---

### PUT `/auth/reset-password/:token`

| Field | Type | Required |
|-------|------|----------|
| password | string | ✅ |

---

### POST `/auth/addresses` 🔒
Add an address.

| Field | Type | Required |
|-------|------|----------|
| fullName | string | ✅ |
| phone | string | ✅ |
| addressLine1 | string | ✅ |
| addressLine2 | string | ❌ |
| city | string | ✅ |
| state | string | ✅ |
| pincode | string | ✅ (6 digits) |
| isDefault | boolean | ❌ |

### PUT `/auth/addresses/:addressId` 🔒
### DELETE `/auth/addresses/:addressId` 🔒

---

## 2. Categories

### GET `/categories`
Get all categories (public).

### GET `/categories/:id`
Get category by ID or slug (public).

### POST `/categories` 🔒👑
Create category (admin). Supports `multipart/form-data`.

| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| description | string | ❌ |
| image | file | ❌ |

### PUT `/categories/:id` 🔒👑
### DELETE `/categories/:id` 🔒👑
Cannot delete if products exist in the category.

---

## 3. Products

### GET `/products`
Get all products with filtering, search, sort, and pagination.

| Query Param | Example | Description |
|-------------|---------|-------------|
| keyword | `?keyword=shirt` | Text search on name |
| category | `?category=<id>` | Filter by category |
| price[gte] | `?price[gte]=500` | Min price |
| price[lte] | `?price[lte]=2000` | Max price |
| sort | `?sort=-price,createdAt` | Sort fields (- for desc) |
| fields | `?fields=name,price` | Select specific fields |
| page | `?page=2` | Page number (default: 1) |
| limit | `?limit=20` | Items per page (default: 12) |

### GET `/products/featured?limit=8`
Get featured products.

### GET `/products/category/:categoryId`
Get products by category.

### GET `/products/:id`
Get product by ID or slug.

### POST `/products` 🔒👑
Create product. Supports `multipart/form-data` with multiple images.

| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| description | string | ✅ |
| price | number | ✅ |
| discountPrice | number | ❌ |
| category | ObjectId | ✅ |
| stock | number | ✅ |
| specifications | JSON string | ❌ |
| isFeatured | boolean | ❌ |
| images | files (max 5) | ❌ |

### PUT `/products/:id` 🔒👑
### DELETE `/products/:id` 🔒👑

### POST `/products/:id/images` 🔒👑
Upload additional images to an existing product.

---

## 4. Cart

All routes require authentication 🔒

### GET `/cart`
### POST `/cart`

| Field | Type | Required |
|-------|------|----------|
| productId | ObjectId | ✅ |
| quantity | number | ❌ (default: 1) |

### PUT `/cart/:itemId`

| Field | Type | Required |
|-------|------|----------|
| quantity | number | ✅ |

### DELETE `/cart/:itemId`
Remove single item.

### DELETE `/cart`
Clear entire cart.

---

## 5. Wishlist

All routes require authentication 🔒

### GET `/wishlist`
### POST `/wishlist`

| Field | Type | Required |
|-------|------|----------|
| productId | ObjectId | ✅ |

### DELETE `/wishlist/:productId`

---

## 6. Orders

### POST `/orders` 🔒
Place a new order.

```json
{
  "items": [
    { "product": "<productId>", "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "Razorpay",
  "couponCode": "WELCOME10"
}
```

### GET `/orders/my-orders` 🔒
### GET `/orders/:id` 🔒
### PUT `/orders/:id/cancel` 🔒

### GET `/orders` 🔒👑
Admin: Get all orders. Filter by `?status=Pending&paymentStatus=Paid`.

### PUT `/orders/:id/status` 🔒👑
Admin: Update order status.

| Status Transitions |
|---|
| Pending → Confirmed, Cancelled |
| Confirmed → Packed, Cancelled |
| Packed → Shipped, Cancelled |
| Shipped → Delivered |
| Delivered → (none) |
| Cancelled → (none) |

---

## 7. Reviews

### GET `/reviews/:productId`
Get reviews for a product (public). Includes rating breakdown.

### POST `/reviews/:productId` 🔒
Add review (must have purchased & received the product).

| Field | Type | Required |
|-------|------|----------|
| rating | number | ✅ (1-5) |
| comment | string | ✅ |

### PUT `/reviews/:id` 🔒
### DELETE `/reviews/:id` 🔒

---

## 8. Coupons

### POST `/coupons/apply` 🔒
Apply a coupon to check discount.

| Field | Type | Required |
|-------|------|----------|
| code | string | ✅ |
| orderAmount | number | ✅ |

### GET `/coupons` 🔒👑
### GET `/coupons/:id` 🔒👑
### POST `/coupons` 🔒👑

| Field | Type | Required |
|-------|------|----------|
| code | string | ✅ |
| discountType | "percentage" / "fixed" | ✅ |
| discountValue | number | ✅ |
| minOrderAmount | number | ❌ |
| maxDiscountAmount | number | ❌ |
| expiryDate | ISO date | ✅ |
| usageLimit | number | ❌ |

### PUT `/coupons/:id` 🔒👑
### DELETE `/coupons/:id` 🔒👑

---

## 9. Payments (Razorpay)

All routes require authentication 🔒

### POST `/payments/create-order`

| Field | Type | Required |
|-------|------|----------|
| orderId | ObjectId | ✅ |

**Response**: Razorpay order ID, amount, currency, key ID.

### POST `/payments/verify`

| Field | Type | Required |
|-------|------|----------|
| razorpay_order_id | string | ✅ |
| razorpay_payment_id | string | ✅ |
| razorpay_signature | string | ✅ |

### GET `/payments/status/:orderId`

---

## 10. Banners

### GET `/banners`
Public: Returns active banners only.

### POST `/banners` 🔒👑
### PUT `/banners/:id` 🔒👑
### DELETE `/banners/:id` 🔒👑

---

## 11. Admin Dashboard

All routes require admin auth 🔒👑

### GET `/admin/dashboard`
Returns: totalUsers, totalOrders, totalProducts, totalRevenue, orderStatusBreakdown, recentOrders.

### GET `/admin/analytics/sales?year=2026`
Returns: monthlySales[], dailySales[] for current month.

### GET `/admin/analytics/top-products?limit=10`
Returns: top selling products by quantity.

### GET `/admin/products/low-stock?threshold=10`
Returns: products with stock ≤ threshold.

---

## Legend

| Icon | Meaning |
|------|---------|
| 🔒 | Requires authentication (JWT) |
| 👑 | Requires admin role |

---

## Seed Data Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sdclothing.com | Admin@123 |
| User | user@sdclothing.com | User@123 |

## Available Coupon Codes

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| WELCOME10 | 10% off | Max ₹200 | ₹500 |
| FLAT200 | ₹200 off | — | ₹1500 |
| SUMMER25 | 25% off | Max ₹1000 | ₹2000 |
