# API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.nofee.gr/api`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### Register
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer", // or "merchant"
  "name": "John Doe", // optional
  "phone": "+306912345678" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "name": "John Doe",
      "phone": "+306912345678"
    },
    "token": "jwt-token-here"
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "name": "John Doe",
      "phone": "+306912345678"
    },
    "token": "jwt-token-here"
  }
}
```

### Get Current User
**GET** `/api/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "name": "John Doe",
    "phone": "+306912345678",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Orders Endpoints

### Get All Orders
**GET** `/api/orders`

Get all orders with optional filters.

**Query Parameters:**
- `storeId` (optional) - Filter by store ID
- `customerId` (optional) - Filter by customer ID
- `status` (optional) - Filter by status (pending, preparing, ready, completed, cancelled)

**Example:**
```
GET /api/orders?status=pending&storeId=uuid
```

### Get Order by ID
**GET** `/api/orders/:id`

Get order details by ID.

### Create Order
**POST** `/api/orders`

Create a new order. **Requires authentication (customer role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "storeId": "uuid",
  "paymentMethod": "card", // or "cash", "digital"
  "deliveryType": "delivery", // or "pickup"
  "deliveryAddress": "123 Main St",
  "customerNotes": "Please ring the doorbell",
  "items": [
    {
      "productId": "uuid", // optional
      "productName": "Pizza Margherita",
      "quantity": 2,
      "price": 12.50,
      "notes": "Extra cheese" // optional
    }
  ]
}
```

### Update Order Status
**PATCH** `/api/orders/:id/status`

Update order status. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "preparing" // pending, preparing, ready, completed, cancelled
}
```

### Get Orders by Status
**GET** `/api/orders/status/:status`

Get orders filtered by status.

**Parameters:**
- `status` - Order status (pending, preparing, ready, completed, cancelled)

**Query Parameters:**
- `storeId` (optional) - Filter by store ID

### Get Orders by Store
**GET** `/api/orders/store/:storeId`

Get orders for a specific store.

**Query Parameters:**
- `status` (optional) - Filter by status

---

## Products Endpoints

### Get All Products
**GET** `/api/products`

Get all products with optional filters.

**Query Parameters:**
- `storeId` (optional) - Filter by store ID
- `category` (optional) - Filter by category
- `available` (optional) - Filter by availability (true/false)
- `featured` (optional) - Filter featured products (true/false)

### Get Product by ID
**GET** `/api/products/:id`

Get product details by ID.

### Get Products by Store
**GET** `/api/products/store/:storeId`

Get products for a specific store.

**Query Parameters:**
- `category` (optional) - Filter by category
- `available` (optional) - Filter by availability

### Get Products by Category
**GET** `/api/products/category/:category`

Get products by category.

**Query Parameters:**
- `storeId` (optional) - Filter by store ID

### Get All Categories
**GET** `/api/products/categories`

Get all product categories.

**Query Parameters:**
- `storeId` (optional) - Filter by store ID

### Create Product
**POST** `/api/products`

Create a new product. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "storeId": "uuid",
  "name": "Pizza Margherita",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 12.50,
  "category": "Pizza",
  "imageUrl": "https://example.com/image.jpg", // optional
  "available": true, // optional
  "featured": false, // optional
  "preparationTime": 20, // optional (minutes)
  "stock": 100, // optional
  "tags": ["vegetarian", "popular"] // optional
}
```

### Update Product
**PATCH** `/api/products/:id`

Update product. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "price": 13.50,
  "available": false
}
```

### Toggle Product Availability
**PATCH** `/api/products/:id/toggle`

Toggle product availability. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

### Delete Product
**DELETE** `/api/products/:id`

Delete product. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

---

## Stores Endpoints

### Get All Stores
**GET** `/api/stores`

Get all active stores.

**Query Parameters:**
- `isActive` (optional) - Filter by active status (true/false)

### Get Store by ID
**GET** `/api/stores/:id`

Get store details by ID.

### Get Stores by Merchant
**GET** `/api/stores/merchant/:merchantId`

Get stores for a specific merchant.

### Get Store Statistics
**GET** `/api/stores/:id/stats`

Get store statistics.

### Create Store
**POST** `/api/stores`

Create a new store. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "phone": "+306912345678",
  "email": "info@pizzapalace.gr",
  "address": "123 Main St, Athens",
  "latitude": 37.9838,
  "longitude": 23.7275,
  "openingHours": {
    "monday": { "open": "09:00", "close": "22:00" },
    "tuesday": { "open": "09:00", "close": "22:00" }
  },
  "minOrderAmount": 10.00,
  "deliveryFee": 2.50,
  "estimatedDeliveryTime": 30,
  "acceptsCash": true,
  "acceptsCard": true,
  "acceptsDigital": true
}
```

### Update Store
**PATCH** `/api/stores/:id`

Update store. **Requires authentication (merchant role).**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)

---

## Upload Endpoints

### Upload Image
**POST** `/api/upload/image`

Upload an image file. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file) - Image file (max 5MB)
- `folder` (optional) - Folder name (default: 'nofee')
- `width` (optional) - Max width in pixels
- `height` (optional) - Max height in pixels

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "nofee/products/xyz123",
    "width": 800,
    "height": 800,
    "format": "jpg",
    "size": 125000
  }
}
```

### Upload Image from URL
**POST** `/api/upload/url`

Upload an image from a URL. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "folder": "products", // optional
  "width": 800, // optional
  "height": 800 // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "nofee/products/xyz123",
    "width": 800,
    "height": 800,
    "format": "jpg",
    "size": 125000
  }
}
```

### Delete Image
**DELETE** `/api/upload/:publicId`

Delete an uploaded image. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // optional, for validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
