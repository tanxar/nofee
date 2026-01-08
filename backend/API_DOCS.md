# NoFee API Documentation

Base URL: `http://localhost:3000/api`

## Orders API

### Get All Orders
```
GET /api/orders
```

Query Parameters:
- `storeId` (optional) - Filter by store
- `customerId` (optional) - Filter by customer
- `status` (optional) - Filter by status (pending, preparing, ready, completed, cancelled)

Example:
```bash
GET /api/orders?storeId=xxx&status=pending
```

### Get Order by ID
```
GET /api/orders/:id
```

### Get Orders by Status
```
GET /api/orders/status/:status
```

Query Parameters:
- `storeId` (optional)

### Get Orders by Store
```
GET /api/orders/store/:storeId
```

Query Parameters:
- `status` (optional)

### Create Order
```
POST /api/orders
```

Body:
```json
{
  "customerId": "uuid (optional)",
  "storeId": "uuid (required)",
  "paymentMethod": "card|cash|digital (optional)",
  "deliveryType": "delivery|pickup (optional)",
  "deliveryAddress": "string (optional)",
  "customerNotes": "string (optional)",
  "items": [
    {
      "productId": "uuid (optional)",
      "productName": "string (required)",
      "quantity": 2,
      "price": 12.50,
      "notes": "string (optional)"
    }
  ]
}
```

### Update Order Status
```
PATCH /api/orders/:id/status
```

Body:
```json
{
  "status": "pending|preparing|ready|completed|cancelled"
}
```

## Products API

### Get All Products
```
GET /api/products
```

Query Parameters:
- `storeId` (optional)
- `category` (optional)
- `available` (optional) - true/false
- `featured` (optional) - true/false

### Get Product by ID
```
GET /api/products/:id
```

### Get Products by Store
```
GET /api/products/store/:storeId
```

Query Parameters:
- `category` (optional)
- `available` (optional)

### Get Products by Category
```
GET /api/products/category/:category
```

Query Parameters:
- `storeId` (optional)

### Get All Categories
```
GET /api/products/categories
```

Query Parameters:
- `storeId` (optional)

### Create Product
```
POST /api/products
```

Body:
```json
{
  "storeId": "uuid (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "price": 12.50,
  "category": "string (optional)",
  "imageUrl": "string (optional)",
  "available": true,
  "featured": false,
  "preparationTime": 15,
  "stock": 50,
  "tags": ["popular", "meat"]
}
```

### Update Product
```
PATCH /api/products/:id
```

Body: (same as create, all fields optional)

### Delete Product
```
DELETE /api/products/:id
```

### Toggle Product Availability
```
PATCH /api/products/:id/toggle
```

## Stores API

### Get All Stores
```
GET /api/stores
```

Query Parameters:
- `isActive` (optional) - true/false

### Get Store by ID
```
GET /api/stores/:id
```

### Get Stores by Merchant
```
GET /api/stores/merchant/:merchantId
```

### Get Store Statistics
```
GET /api/stores/:id/stats
```

Returns:
```json
{
  "totalOrders": 100,
  "completedOrders": 85,
  "totalProducts": 25,
  "totalRevenue": 5000.50
}
```

### Create Store
```
POST /api/stores
```

Body:
```json
{
  "merchantId": "uuid (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "address": "string (optional)",
  "latitude": 37.9838,
  "longitude": 23.7275,
  "openingHours": {},
  "minOrderAmount": 10.00,
  "deliveryFee": 2.50,
  "estimatedDeliveryTime": 30,
  "acceptsCash": true,
  "acceptsCard": true,
  "acceptsDigital": true
}
```

### Update Store
```
PATCH /api/stores/:id
```

Body: (same as create, all fields optional)

## Response Format

All endpoints return JSON in this format:

### Success:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error:
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // For validation errors
}
```

## Example Usage

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store-uuid",
    "deliveryType": "delivery",
    "items": [
      {
        "productName": "Burger",
        "quantity": 2,
        "price": 12.50
      }
    ]
  }'
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing"
  }'
```

### Get Products by Store
```bash
curl http://localhost:3000/api/products/store/store-uuid
```

