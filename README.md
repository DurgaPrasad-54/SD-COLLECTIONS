<div align="center">

#  SD-COLLECTIONS

**A modern, robust, and scalable Single Merchant Full Stack eCommerce Web Application built with the MERN stack.**

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-success.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
</p>

</div>

---

##  Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [High-Level System Architecture](#-high-level-system-architecture)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [API Modules](#-api-modules)
- [Screenshots](#-screenshots)
- [Application Workflow](#-application-workflow)
- [Security Implementation](#-security-implementation)
- [Performance Optimizations](#-performance-optimizations)
- [Responsive Design](#-responsive-design)
- [Deployment Guide](#-deployment-guide)
- [Future Enhancements](#-future-enhancements)
- [Contributing Guidelines](#-contributing-guidelines)
- [License](#-license)
- [Author](#-author)
- [Acknowledgements](#-acknowledgements)

---

##  Project Overview

**SD-COLLECTIONS** is a complete, end-to-end full-stack eCommerce platform designed specifically for a single merchant. It delivers a premium shopping experience with intuitive navigation, secure payment processing, and comprehensive order tracking. Under the hood, it features a powerful administrative dashboard that allows the merchant to manage inventory, process orders, and oversee customer interactions efficiently.

Built to modern industry standards, this platform leverages the robustness of the MERN stack (MongoDB, Express.js, React, Node.js) combined with modern tools like Tailwind CSS for elegant UI design, Redux Toolkit for state management, and Razorpay for seamless and secure transaction processing.

---

##  Key Features

### 🛒 Customer Features
- **Intuitive Browsing:** Advanced product filtering, sorting, and search capabilities.
- **Dynamic Shopping Cart:** Real-time cart updates and seamless checkout flow.
- **Secure Authentication:** User registration, login, and secure password recovery.
- **User Profile Management:** Order history tracking and address management.
- **Secure Payments:** Integrated Razorpay gateway for safe, fast, and reliable transactions.
- **Email Notifications:** Order confirmations and account-related alerts via Nodemailer.

###  Admin Features
- **Centralized Dashboard:** Comprehensive overview of sales, orders, and user statistics.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) operations with multiple image uploads via Cloudinary.
- **Order Management:** View, update order status, and manage shipments.
- **User Management:** Monitor registered customers and their activities.
- **Inventory Tracking:** Real-time stock alerts and management.

###  Security Features
- **JWT Authentication:** Secure user sessions and role-based access control (RBAC).
- **Password Encryption:** Robust hashing using `bcryptjs` before database storage.
- **Input Validation:** Backend validation to prevent SQL/NoSQL injection and XSS attacks.
- **CORS Protection:** Configured to accept requests only from authorized origins.

---

## 🛠 Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js (Vite) | Lightning-fast development environment and optimized builds. |
| **Styling** | Tailwind CSS | Utility-first framework for highly customizable, responsive design. |
| **State Management** | Redux Toolkit | Predictable state container for managing cart and user data. |
| **Routing** | React Router DOM | Declarative routing for seamless single-page application navigation. |
| **HTTP Client** | Axios | Promise-based HTTP client for the browser and Node.js. |
| **Backend Runtime** | Node.js | Fast and scalable JavaScript runtime built on Chrome's V8 engine. |
| **Web Framework** | Express.js | Minimalist and flexible backend web application framework. |
| **Database** | MongoDB | NoSQL database for flexible and highly scalable data storage. |
| **ODM** | Mongoose | Elegant MongoDB object modeling for Node.js. |
| **Authentication** | JWT & bcryptjs | Secure token-based authentication and password hashing. |
| **File Handling** | Multer | Middleware for handling `multipart/form-data`. |
| **Media Storage** | Cloudinary | Cloud-based image and video management service. |
| **Mailing Service** | Nodemailer | Module to send emails asynchronously from Node.js. |
| **Payment Gateway** | Razorpay | Robust payment integration for handling digital transactions. |

---

##  High-level System Architecture

The application follows a standard Client-Server architecture with a RESTful API communicating between the React frontend and the Node.js/Express backend.

```text
[ Client (React/Vite) ]  <-- JSON / HTTP (Axios) -->  [ Server (Node/Express) ]
          |                                                   |
   (Redux State)                                      (Controllers/Routes)
          |                                                   |
[ Tailwind CSS UI ]                                 [ MongoDB / Mongoose ]
                                                              |
                                                    (Third-party Services)
                                                    - Cloudinary (Images)
                                                    - Razorpay (Payments)
                                                    - Nodemailer (Emails)
```

---

##  Project Folder Structure

<details>
<summary>Click to expand folder structure</summary>

```bash
SD-COLLECTIONS/
├── frontend/                     # React Frontend Application
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Images, icons, global styles
│   │   ├── components/           # Reusable UI components (Buttons, Cards)
│   │   ├── pages/                # Application pages (Home, Shop, Admin)
│   │   ├── redux/                # Redux slices and store configuration
│   │   ├── utils/                # Helper functions and constants
│   │   ├── App.jsx               # Main application component
│   │   ├── main.jsx              # React DOM rendering entry point
│   │   └── index.css             # Tailwind CSS entry file
│   ├── .env                      # Frontend environment variables
│   ├── package.json              # Frontend dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── vite.config.js            # Vite configuration
│
└── backend/                      # Node.js/Express Backend Application
    ├── config/                   # Database and third-party integrations config
    ├── controllers/              # Route controller logic
    ├── middleware/               # Custom middlewares (Auth, Multer)
    ├── models/                   # Mongoose database schemas
    ├── routes/                   # API endpoint definitions
    ├── utils/                    # Helper utilities (Email sender, Error handlers)
    ├── .env                      # Backend environment variables
    ├── package.json              # Backend dependencies
    └── server.js                 # Express server entry point
```

</details>

---

##  Installation Guide

Follow these steps to set up the project locally.

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/SD-COLLECTIONS.git
cd SD-COLLECTIONS
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Running the Project

Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` and the backend will start on `http://localhost:5000` (or as configured in your `.env` files).

---

##  Environment Variables

Create `.env` files in both `frontend` and `backend` directories using the following examples.

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sd-collections

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Integration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Nodemailer Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🔌 API Modules

The backend architecture is modular, exposing clean RESTful APIs structured around specific resources:

- **`/api/auth`**: User registration, login, and profile management.
- **`/api/users`**: Admin operations to manage registered users.
- **`/api/products`**: CRUD operations for the product catalog.
- **`/api/orders`**: Order creation, payment verification, and order status updates.
- **`/api/payments`**: Razorpay integration for initializing and verifying transactions.
- **`/api/upload`**: Middleware endpoints to handle Cloudinary image uploads via Multer.

---

##  Application Workflow

1. **Browsing:** Visitors can browse products, filter by categories, and view detailed product pages without logging in.
2. **Authentication:** To place an order, a user must register and log in, receiving a secure JWT.
3. **Cart & Checkout:** Users add items to their cart, proceed to checkout, and enter shipping details.
4. **Payment Processing:** The user is securely redirected to the Razorpay interface to complete the transaction.
5. **Order Confirmation:** Upon successful payment, the backend verifies the transaction signature, creates the order in MongoDB, and sends a confirmation email.
6. **Fulfillment:** The admin views the new order in the dashboard, processes the shipment, and updates the status, which is reflected on the user's profile.

---

##  Security Implementation

- **Data Protection:** Passwords are never stored in plain text; they are hashed with a 10-round salt using `bcryptjs`.
- **Stateless Sessions:** JWT-based authentication eliminates the need for server-side sessions, minimizing overhead and securing API endpoints.
- **Role-Based Access:** Admin routes are strictly protected by middleware checking the user's `role` payload in the JWT.
- **Payment Security:** Razorpay transactions are verified server-side using cryptographic signatures (HMAC SHA256) to prevent tampering.
- **File Validation:** Multer middleware validates file types and sizes before uploading to Cloudinary to prevent malicious file execution.

---

## Performance Optimizations

- **Vite Bundler:** Ensures lightning-fast Hot Module Replacement (HMR) during development and highly optimized static assets for production.
- **Lazy Loading:** React components and images are lazily loaded to improve the initial Time to Interactive (TTI).
- **Image Optimization:** Cloudinary automatically compresses and delivers images in modern formats (like WebP) tailored to the user's device.
- **Database Indexing:** MongoDB collections are properly indexed on frequently queried fields to maintain fast read speeds as the database grows.
- **State Caching:** Redux Toolkit efficiently caches responses and minimizes unnecessary API calls to the backend.

---

## Responsive Design

The application is built with a mobile-first approach using **Tailwind CSS**. 
- Fluid grids and flexible layouts ensure the UI scales elegantly across desktop, tablet, and mobile devices.
- Complex components like data tables in the admin dashboard implement horizontal scrolling or card-based fallback layouts for smaller screens.
- Navigation seamlessly collapses into a mobile-friendly hamburger menu.

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Link your GitHub repository.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add all Frontend environment variables in the deployment dashboard.
4. Deploy.

### Backend Deployment (Render)
1. Connect the backend folder of the repository.
2. Set the start command to `node server.js`.
3. Add all Backend environment variables in the dashboard.
4. Deploy.

### Database Deployment
- The MongoDB instance should be hosted on **MongoDB Atlas**.
- Ensure Network Access is configured to allow IP addresses from your backend deployment server.

---

## Future Enhancements

- [ ] Implement a product rating and review system.
- [ ] Add a wishlist feature for registered users.
- [ ] Support for multiple international currencies.
- [ ] Integrate an AI-based product recommendation engine.
- [ ] Add social login capabilities (Google, GitHub, etc.).

---

## Contributing Guidelines

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

**[Durga Prasad Kopireddy]**

- LinkedIn: [www.linkedin.com/in/durga-prasad-koppireddy-778516275](www.linkedin.com/in/durga-prasad-koppireddy-778516275)
- GitHub: [@DurgaPrasad-54](https://github.com/DurgaPrasad-54)
- Email: prasad8790237@gmail.com
---

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Cloudinary](https://cloudinary.com/)

<div align="center">
  <p>Made with ❤️ and code.</p>
</div>
