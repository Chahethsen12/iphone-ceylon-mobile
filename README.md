# iPhone Ceylon Mobile Ecommerce Platform

Welcome to the **iPhone Ceylon Mobile** repository! This is a full-stack, enterprise-grade e-commerce application built for high availability and robust performance using the MERN stack alongside Firebase Realtime Database.

This project is managed using **Agile Methodologies** (Scrum/Kanban). We value iterative development, continuous integration, and frequent deployments.

## 📱 Project Description
iPhone Ceylon Mobile is a modern e-commerce platform that allows customers to browse products, apply discount coupons, and securely place orders. For store administrators, it provides a feature-rich, separate dashboard to manage inventory, track order lifecycles, and view live revenue analytics.

### Key Architectural Highlights
- **Dual-Write Databases:** All critical data (Orders, Products, Coupons) is written simultaneously to **MongoDB** (Primary) and **Firebase Realtime Database** (Mirror).
- **Disaster Recovery:** If MongoDB experiences downtime or a crash, the Node.js backend intelligently falls back to read data and process new checkout orders purely through Firebase, guaranteeing 100% uptime.
- **Micro-Frontends split:** 
  - `frontend-store/`: The public-facing customer storefront (Vite + React).
  - `frontend-admin/`: The private administration portal (Vite + React).
- **Backend API:** Managed via Node.js / Express `backend/`.

---

## 🛠 Prerequisites for Beginners
To run or contribute to this project, you need to install the following tools on your computer:
1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org).
2. **Git**: Download and install from [git-scm.com](https://git-scm.com).
3. **VS Code**: A free code editor from [code.visualstudio.com](https://code.visualstudio.com).

---

## 🚀 How to Run Locally

### 1. Database Setup
You will need your own MongoDB Atlas cluster and a Firebase project. Make sure you have your `.env` configured inside the `backend/` directory with `MONGO_URI`, `JWT_SECRET`, and your Firebase configuration keys.

### 2. Start the Backend
Open a terminal, navigate to the `backend` folder, install dependencies, and run:
```bash
cd backend
npm install
npm run dev
```
*The API will start running on `http://localhost:5000`.*

### 3. Start the Customer Storefront
Open a new terminal window, navigate to `frontend-store`, install dependencies, and start the app:
```bash
cd frontend-store
npm install
npm run dev
```
*The store will spin up typically on `http://localhost:5173`.*

### 4. Start the Admin Dashboard
Open a third terminal window, navigate to `frontend-admin`:
```bash
cd frontend-admin
npm install
npm run dev
```
*The admin portal will open on `http://localhost:5174`.*

---

## 🤝 Agile Workflow & How to Contribute

We follow an Agile development process. Contributors should follow these steps to add features or fix bugs:

1. **Check the Board:** Look at the active Jira/Trello board or GitHub Issues for the current Sprint. Claim a ticket and assign it to yourself.
2. **Branch Naming:** Create a new branch off `main` for your task. 
   - `feature/add-wishlist`
   - `bugfix/cart-crash`
3. **Draft your Code:** Write clean, modular code. Test both the normal workflow and the Firebase fallback behavior!
4. **Commit Regularly:** Write descriptive commit messages summarizing *why* a change was made.
5. **Open a Pull Request (PR):** Push your branch up and open a PR into `main`. Tag your Scrum Master or a senior engineer for review.
6. **Merge & Deploy:** Once approved, your code will be merged and incorporated into the next continuous deployment pipeline.

## 🧪 Testing the Application

We highly encourage rigorous testing, especially validating our high-availability database architecture. 
For comprehensive instructions on how to test normal operations vs disaster recovery scenarios (MongoDB Offline), please follow the steps outlined in our [TESTING_GUIDE.md](./TESTING_GUIDE.md).

---

## 🌍 Deployment
When a Sprint concludes, the project is deployed. The backend is geared to automatically deploy via **Railway** to ensure high-speed API performance, while the two React frontends are optimized for Vercel. 

For the complete, step-by-step pipeline on how absolute beginners can deploy this architecture to the public, see the official **Deployment Guide** file associated with this project.
