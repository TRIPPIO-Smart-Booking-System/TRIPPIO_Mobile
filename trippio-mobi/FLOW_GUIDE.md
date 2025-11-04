# Trippio Mobile - Flow Guide

## 🎨 Design System
- **Primary Color**: #2563EB (Blue 600)
- **Background**: White (#FFFFFF)
- **Theme**: Clean white & blue design

## 📋 Complete Flow: Booking → Basket → Order → Payment

### Flow Overview
```
1. User selects item (Hotel/Show/Transport)
   ↓
2. Create Booking (Room/Show/Transport)
   ↓
3. Add Booking to Basket (productId = bookingId)
   ↓
4. Create Order from Basket
   ↓
5. Payment via PayOS
```

### Detailed Steps

#### 1. Hotel/Room Booking Flow
**Screen**: `HotelDetailScreen`
- User selects room
- Opens modal to enter:
  - Check-in date
  - Check-out date
  - Guest count
- **API Call**: `POST /api/Booking/room`
  ```json
  {
    "userId": "uuid",
    "roomId": "uuid",
    "checkInDate": "2024-01-01T14:00:00Z",
    "checkOutDate": "2024-01-02T11:00:00Z",
    "guestCount": 2
  }
  ```
- **Add to Basket**: `POST /api/Basket/{userId}/items`
  ```json
  {
    "productId": "bookingId", // Use bookingId as productId
    "quantity": 1,
    "attributes": {
      "type": "Room",
      "roomType": "...",
      "checkInDate": "...",
      "checkOutDate": "...",
      "guestCount": 2
    }
  }
  ```

#### 2. Show Booking Flow
**Screen**: `ShowDetailScreen`
- User clicks "Đặt vé ngay"
- Opens modal to enter:
  - Seat number
  - Seat class
  - Show date
- **API Call**: `POST /api/Booking/show`
  ```json
  {
    "userId": "uuid",
    "showId": "uuid",
    "seatNumber": "A12",
    "showDate": "2024-01-01T19:00:00Z",
    "seatClass": "VIP"
  }
  ```
- **Add to Basket**: Similar to Room flow

#### 3. Transport Booking Flow
**Screen**: `TransportDetailScreen`
- User selects a trip from available trips
- Opens modal to enter:
  - Seat number
  - Seat class
- **API Call**: `POST /api/Booking/transport`
  ```json
  {
    "userId": "uuid",
    "tripId": "uuid",
    "seatNumber": "12A",
    "seatClass": "Economy"
  }
  ```
- **Add to Basket**: Similar to Room flow

#### 4. Basket Management
**Screen**: `BasketScreen`
- **Get Basket**: `GET /api/Basket/{userId}`
- **Remove Item**: `DELETE /api/Basket/{userId}/items/{productId}`
- **Checkout**: `POST /api/Order/from-basket/{userId}`
  - Automatically creates Order from all items in basket
  - Returns Order object with orderItems

#### 5. Payment Flow
**Screen**: `PaymentScreen`
- **Update Status**: 
  - Update all bookings to "Confirmed": `PUT /api/Booking/{id}/status?status=Confirmed`
  - Update order to "Confirmed": `PUT /api/Order/{id}/status?status=Confirmed`
- **Create PayOS Payment**: `POST /api/payment/realmoney`
  ```json
  {
    "orderCode": 123456, // Last 6 digits of order.id
    "amount": 2000000, // Integer (VND)
    "description": "Payment for order 123",
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "buyerPhone": "+84901234567",
    "userId": "uuid"
  }
  ```
- **Response**: Returns `checkoutUrl` from PayOS
- **Open Payment**: Opens PayOS URL in browser

## 🔄 API Endpoints Summary

### Booking
- `POST /api/Booking/room` - Create room booking
- `POST /api/Booking/show` - Create show booking
- `POST /api/Booking/transport` - Create transport booking
- `GET /api/Booking/user/{userId}` - Get user bookings
- `PUT /api/Booking/{id}/status?status={status}` - Update booking status

### Basket
- `GET /api/Basket/{userId}` - Get basket
- `POST /api/Basket/{userId}/items` - Add item (productId = bookingId)
- `PUT /api/Basket/{userId}/items/quantity` - Update quantity
- `DELETE /api/Basket/{userId}/items/{productId}` - Remove item
- `DELETE /api/Basket/{userId}` - Clear basket

### Order
- `POST /api/Order/from-basket/{userId}` - Create order from basket (RECOMMENDED)
- `POST /api/Order` - Create order manually
- `GET /api/Order/user/{userId}` - Get user orders
- `GET /api/Order/{id}` - Get order by ID
- `PUT /api/Order/{id}/status?status={status}` - Update order status

### Payment
- `POST /api/payment/realmoney` - Create PayOS payment
- `GET /api/payment/realmoney/{orderCode}` - Get payment info
- `GET /api/payment/user/{userId}` - Get user payments

## 📝 Important Notes

1. **productId in Basket = bookingId**: When adding to basket, use the bookingId returned from booking creation as the productId.

2. **Order Creation**: Use `/api/Order/from-basket/{userId}` for simplicity - it automatically creates order from all basket items.

3. **Payment Amount**: PayOS requires amount as integer (VND), minimum 2000 VND.

4. **Order Code**: Use last 6 digits of order.id for PayOS orderCode (max 6 digits).

5. **Status Updates**: Update booking and order status to "Confirmed" before creating payment.

## 🎯 User Journey

1. **Browse** → HotelsScreen / ShowScreen / TransportScreen
2. **Select** → HotelDetailScreen / ShowDetailScreen / TransportDetailScreen
3. **Book** → Create booking → Add to basket
4. **Review** → BasketScreen (view all items)
5. **Checkout** → Create Order from basket
6. **Pay** → PaymentScreen → PayOS payment
7. **Confirm** → OrdersScreen (view order status)

## ✅ Completed Features

- ✅ Color scheme: White & Blue (#2563EB)
- ✅ Booking API: Room, Show, Transport
- ✅ Basket API: Add, Remove, Get, Clear
- ✅ Order API: From basket
- ✅ Payment API: PayOS integration
- ✅ All screens updated with new flow
- ✅ All styles updated with new theme

