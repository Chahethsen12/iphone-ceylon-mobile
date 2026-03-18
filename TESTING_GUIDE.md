# End-to-End System Testing Guide

This guide provides step-by-step instructions for testing your entire stack: the Customer Frontend, the Admin Dashboard, the Backend APIs, and the Dual-Write/Fallback database architecture (MongoDB + Firebase). 

---

## 🟢 PHASE 1: Normal Operations (MongoDB & Firebase Online)

In this phase, you will verify that data flows correctly through the system and is properly mirrored to both databases.

### 1. Admin Actions (Frontend Admin)
1. **Login:** Open your Admin Dashboard (e.g., `http://localhost:5174`) and log in using your admin credentials.
2. **Products:**
   - Go to the Products tab. 
   - Add a new product (e.g., "Test iPhone 15"). 
   - **Verification:** Look at your MongoDB cluster and your Firebase Realtime Database console. You should see "Test iPhone 15" appear in both places automatically.
3. **Coupons:**
   - Go to the Coupons tab.
   - Create a new coupon (e.g., code `SUMMER20`, 20% discount).
   - **Verification:** Verify it appears in both MongoDB and Firebase (`/coupons`).

### 2. Customer Actions (Frontend Store)
1. **Browse:** Open the Customer Store (e.g., `http://localhost:5173`). 
2. **Add to Cart:** Ensure the "Test iPhone 15" loads properly. Add it to your cart.
3. **Apply Coupon:** Enter `SUMMER20` in the checkout. Ensure the discount applies correctly.
4. **Checkout:** Complete a test order.
   - **Verification:** Check MongoDB and Firebase. The new order should exist in the `orders` collection in both databases.

### 3. Business Analytics (Admin)
1. **Dashboard:** Go back to the Admin Dashboard and open the Overview tab.
2. **Verification:** Ensure the "Total Orders" increased by 1 and the revenue charts reflect the test order amount. The charts should render correctly without any blank screen errors. 

---

## 🔴 PHASE 2: Disaster Recovery (MongoDB Offline / Firebase Fallback)

This is the most critical test. It verifies that your application survives a total, catastrophic failure of your primary MongoDB database.

### 1. Simulate the Crash
1. Open your backend code. Go to `backend/config/db.js` (or `.env` file).
2. **Break the connection constraint:** Change your MongoDB connection string to an invalid one (e.g., add `XYZ` to the password or cluster URL). 
3. Restart your backend server (`npm run dev:backend`). Your backend console will show that MongoDB failed to connect. **The system is now running purely on Firebase.**

### 2. Test Customer Resilience
1. Go to your Customer Store frontend and refresh the page.
   - **Success Check:** The products should still load perfectly (fetched from Firebase fallback).
2. Add an item to your cart and try applying the `SUMMER20` coupon.
   - **Success Check:** The coupon should validate successfully (fetched from Firebase).
3. Place a new order.
   - **Success Check:** The order must succeed. The backend detects MongoDB is down, auto-generates a fallback ID, and successfully stores the order exclusively in Firebase.

### 3. Test Admin Resilience
1. Log out of the Admin Dashboard and try logging back in.
   - **Success Check:** You should be able to log in successfully (Auth fallback works). 
2. Open the Orders and Dashboard tabs.
   - **Success Check:** You should see the backup orders. The dashboard should still display accurate revenue numbers, aggregated in real-time from the Firebase data!

*(Once you finish Phase 2, remember to restore your correct MongoDB URI and restart the server).*

---

## 🛠 PHASE 3: Direct API Testing (Using Thunder Client / Postman)

If you wish to test exactly what the frontend is sending to the backend, you can execute these API requests directly.

### 1. Test Fetching (GET)
- **Endpoint:** `GET http://localhost:5000/api/products`
- **Action:** Send the request. Look at the `Headers` tab in the response. If MongoDB was offline during this request, you will see a header `X-Fallback-Mode: true`.

### 2. Test Dual-Write Creation (POST)
- **Endpoint:** `POST http://localhost:5000/api/coupons`
- **Body (JSON):**
  ```json
  {
    "code": "API2026",
    "discountType": "fixed",
    "discountValue": 500,
    "expiryDate": "2026-12-31"
  }
  ```
- **Action:** Ensure MongoDB is online. Send the request. Check your Firebase console to ensure the new `API2026` coupon automatically mirrored over. 

### 3. Validation Testing (POST)
- **Endpoint:** `POST http://localhost:5000/api/coupons/validate`
- **Body (JSON):**
  ```json
  {
    "code": "API2026",
    "cartTotal": 5000
  }
  ```
- **Action:** This validates the coupon against a cart amount to return the calculated discount.

### How to use this guide:
Follow these phases sequentially. By the time you complete Phase 2, you will have rock-solid proof that your application achieves 100% uptime coverage across the Store, Admin panel, and Databases.
