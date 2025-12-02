<div align="center">

# 🍽️ MessMate

### Complete Mess Management System 

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)](https://github.com/48vineet/MessMate-MERN)

_A modern, full-stack web application for seamless mess and dining hall management_

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

> **📢 Notice:** This is an open-source project under active development. Some features are currently being upgraded and improved. We welcome contributions from the community! Feel free to report issues, suggest features, or submit pull requests.

---

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**MessMate** is a comprehensive mess management system designed for hostels, colleges, and institutional dining facilities. It streamlines the entire dining experience from meal booking to payment processing, inventory management, and analytics - all in one unified platform.

### Why MessMate?

- **🎯 User-Centric Design**: Intuitive interface for students, staff, and administrators
- **⚡ Real-Time Updates**: Live meal availability, booking status, and notifications
- **💰 Digital Payments**: Integrated wallet system with UPI, Stripe, and Razorpay support
- **📊 Smart Analytics**: Comprehensive reports and insights for better decision-making
- **🔒 Secure & Scalable**: JWT authentication, role-based access control, and cloud-ready architecture
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

---

## ✨ Features

### 👥 User Features

- **🔐 Authentication & Authorization**

  - Secure login/register with JWT tokens
  - Email verification and password reset
  - Role-based access control (Admin, Staff, Student, Guest)
  - Profile management with avatar upload

- **🍱 Meal Management**

  - Browse daily menus with detailed nutritional information
  - Book meals in advance or on-the-spot
  - QR code-based meal verification
  - Meal preferences and dietary restrictions
  - Cancel/modify bookings with refund options

- **💳 Payment System**

  - Digital wallet with auto-recharge
  - Multiple payment methods (UPI, Cards, Net Banking)
  - Payment history and transaction tracking
  - Refund management
  - Balance alerts and low-balance notifications

- **📱 Notifications**

  - Real-time push notifications
  - Email notifications for important updates
  - Menu updates and special meal alerts
  - Payment confirmations and reminders

- **📊 Personal Dashboard**
  - Booking history and statistics
  - Spending analytics with charts
  - Upcoming meal schedule
  - Wallet balance overview

### 🔧 Admin Features

- **👨‍💼 User Management**

  - Add/edit/delete users
  - Bulk user import via CSV
  - User verification and approval
  - Role assignment and permissions
  - User activity monitoring

- **🍽️ Menu Management**

  - Create daily/weekly menus
  - Set meal prices and availability
  - Upload meal images
  - Nutritional information management
  - Special diet options

- **📦 Inventory Management**

  - Track ingredients and supplies
  - Low-stock alerts
  - Purchase order management
  - Supplier management
  - Expiry date tracking

- **💰 Financial Management**

  - Revenue tracking and reports
  - Payment reconciliation
  - Expense management
  - Refund processing
  - Financial analytics

- **📈 Analytics & Reports**

  - User engagement metrics
  - Sales reports (daily, weekly, monthly)
  - Popular meal analytics
  - Revenue forecasting
  - Custom report generation
  - Export to PDF/Excel

- **⚙️ System Settings**
  - Configure meal timings
  - Set pricing rules
  - Email template customization
  - System notifications
  - Backup and maintenance

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19.1.0 with Vite
- **Routing**: React Router DOM 7.7.0
- **State Management**: Context API with useReducer
- **Styling**:
  - Tailwind CSS 4.1.11
  - Framer Motion 12.23.12 (animations)
  - Material-UI 7.3.1
- **UI Components**:
  - Headless UI 2.2.4
  - Heroicons 2.2.0
  - Lucide React 0.554.0
- **Charts**: Chart.js 4.5.0 with React ChartJS 2
- **HTTP Client**: Axios 1.10.0
- **Real-Time**: Socket.IO Client 4.8.1
- **QR Code**: QRCode 1.5.4
- **Notifications**: React Hot Toast 2.5.2

### Backend

- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB 8.16.4 (Mongoose ODM)
- **Authentication**:
  - JSON Web Tokens (jsonwebtoken 9.0.2)
  - bcryptjs 3.0.2 for password hashing
- **File Upload**: Multer 2.0.2 + Cloudinary 2.7.0
- **Real-Time**: Socket.IO 4.8.1
- **Email**: Nodemailer 7.0.5
- **Payment**: Stripe 18.3.0
- **PDF Generation**: PDFKit 0.17.1
- **Security**:
  - Helmet 8.1.0 (HTTP headers)
  - CORS 2.8.5
  - Express Rate Limit 8.0.1
  - Express Validator 7.2.1
- **Scheduling**: Node-Cron 4.2.1
- **Utilities**:
  - Moment.js 2.30.1 (date manipulation)
  - UUID 11.1.0
  - Morgan 1.10.1 (logging)

### Development Tools

- **Frontend**:
  - ESLint 9.30.1
  - Vite 7.0.4
- **Backend**:
  - Nodemon 3.1.10 (auto-restart)
  - Jest 30.0.4 (testing)
  - Supertest 7.1.3 (API testing)
  - Concurrently 9.2.0 (run multiple commands)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Pages   │  │Components│  │ Context  │  │    Hooks     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Routes  │→ │Controller│→ │  Models  │→ │   Database   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │Middleware│  │  Utils   │  │Socket.IO │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│              External Services                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │MongoDB   │  │Cloudinary│  │  Stripe  │  │   SMTP       │   │
│  │ Atlas    │  │          │  │ Razorpay │  │              │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Messmate-app/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Shared components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── payments/   # Payment-related components
│   │   │   └── ui/         # UI library components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Backend Node.js application
│   ├── config/              # Configuration files
│   │   └── db.js           # Database connection
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── menuController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── inventoryController.js
│   │   ├── analyticsController.js
│   │   ├── reportsController.js
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # JWT verification
│   │   ├── validation.js   # Input validation
│   │   ├── errorHandler.js # Error handling
│   │   └── upload.js       # File upload
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Menu.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Inventory.js
│   │   ├── Feedback.js
│   │   ├── Notification.js
│   │   └── ...
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── menu.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── emailTemplates.js
│   │   ├── qrGenerator.js
│   │   ├── socketHandler.js
│   │   └── errorhandler.js
│   ├── server.js           # Express app setup
│   ├── createAdminUser.js  # Admin seeder script
│   └── package.json
│
└── README.md               # This file
```

---

## 📥 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/48vineet/MessMate-MERN.git
cd MessMate-MERN
```

### Install Dependencies

#### Backend Setup

```bash
cd server
npm install
```

#### Frontend Setup

```bash
cd ../client
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/messmate
# OR use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/messmate

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# Email Configuration (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=MessMate <noreply@messmate.com>

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay (Alternative Payment)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api

# Socket.IO Server URL
VITE_SOCKET_URL=http://localhost:5000

# Stripe Publishable Key (for client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Razorpay Key ID
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=MessMate
VITE_APP_VERSION=1.0.0
```

### Database Seeding

Create an admin user:

```bash
cd server
node createAdminUser.js
```

Default admin credentials:

- **Email**: `admin@messmate.com`
- **Password**: `Admin@123`

⚠️ **Important**: Change these credentials after first login!

---

## 🚀 Usage

### Development Mode

#### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd client
npm run dev
```

Client will run on `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
cd client
npm run build
```

#### Start Production Server

```bash
cd server
npm start
```

The server will serve the built React app from the `client/dist` directory.

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### 🔐 Authentication

| Method | Endpoint                      | Description            | Access  |
| ------ | ----------------------------- | ---------------------- | ------- |
| POST   | `/auth/register`              | Register new user      | Public  |
| POST   | `/auth/login`                 | User login             | Public  |
| POST   | `/auth/logout`                | User logout            | Private |
| GET    | `/auth/me`                    | Get current user       | Private |
| POST   | `/auth/forgot-password`       | Request password reset | Public  |
| POST   | `/auth/reset-password/:token` | Reset password         | Public  |
| PUT    | `/auth/update-profile`        | Update user profile    | Private |
| PUT    | `/auth/change-password`       | Change password        | Private |

#### 👥 Users

| Method | Endpoint              | Description          | Access     |
| ------ | --------------------- | -------------------- | ---------- |
| GET    | `/users`              | Get all users        | Admin      |
| GET    | `/users/:id`          | Get user by ID       | Admin/Self |
| PUT    | `/users/:id`          | Update user          | Admin/Self |
| DELETE | `/users/:id`          | Delete user          | Admin      |
| POST   | `/users/bulk-import`  | Import users via CSV | Admin      |
| GET    | `/users/:id/bookings` | Get user bookings    | Admin/Self |

#### 🍽️ Menu

| Method | Endpoint            | Description                | Access |
| ------ | ------------------- | -------------------------- | ------ |
| GET    | `/menu`             | Get all menu items         | Public |
| GET    | `/menu/:id`         | Get menu item by ID        | Public |
| POST   | `/menu`             | Create menu item           | Admin  |
| PUT    | `/menu/:id`         | Update menu item           | Admin  |
| DELETE | `/menu/:id`         | Delete menu item           | Admin  |
| GET    | `/menu/daily/:date` | Get menu for specific date | Public |

#### 📅 Bookings

| Method | Endpoint                | Description           | Access  |
| ------ | ----------------------- | --------------------- | ------- |
| GET    | `/bookings`             | Get all bookings      | Admin   |
| GET    | `/bookings/my-bookings` | Get user's bookings   | Private |
| GET    | `/bookings/:id`         | Get booking by ID     | Private |
| POST   | `/bookings`             | Create booking        | Private |
| PUT    | `/bookings/:id`         | Update booking        | Private |
| DELETE | `/bookings/:id`         | Cancel booking        | Private |
| POST   | `/bookings/:id/verify`  | Verify booking via QR | Staff   |

#### 💳 Payments

| Method | Endpoint                  | Description           | Access  |
| ------ | ------------------------- | --------------------- | ------- |
| GET    | `/payments`               | Get all payments      | Admin   |
| GET    | `/payments/my-payments`   | Get user payments     | Private |
| POST   | `/payments/create-intent` | Create payment intent | Private |
| POST   | `/payments/confirm`       | Confirm payment       | Private |
| POST   | `/payments/refund`        | Request refund        | Private |
| GET    | `/payments/:id`           | Get payment details   | Private |

#### 💰 Wallet

| Method | Endpoint               | Description              | Access  |
| ------ | ---------------------- | ------------------------ | ------- |
| GET    | `/wallet`              | Get wallet balance       | Private |
| POST   | `/wallet/recharge`     | Recharge wallet          | Private |
| GET    | `/wallet/transactions` | Get wallet transactions  | Private |
| POST   | `/wallet/transfer`     | Transfer to another user | Private |

#### 📦 Inventory

| Method | Endpoint               | Description             | Access |
| ------ | ---------------------- | ----------------------- | ------ |
| GET    | `/inventory`           | Get all inventory items | Staff  |
| GET    | `/inventory/:id`       | Get inventory item      | Staff  |
| POST   | `/inventory`           | Add inventory item      | Admin  |
| PUT    | `/inventory/:id`       | Update inventory item   | Staff  |
| DELETE | `/inventory/:id`       | Delete inventory item   | Admin  |
| GET    | `/inventory/low-stock` | Get low stock items     | Staff  |

#### 📊 Analytics

| Method | Endpoint                   | Description           | Access |
| ------ | -------------------------- | --------------------- | ------ |
| GET    | `/analytics/dashboard`     | Get dashboard stats   | Admin  |
| GET    | `/analytics/revenue`       | Get revenue analytics | Admin  |
| GET    | `/analytics/users`         | Get user analytics    | Admin  |
| GET    | `/analytics/popular-meals` | Get popular meals     | Admin  |

#### 📈 Reports

| Method | Endpoint                | Description         | Access |
| ------ | ----------------------- | ------------------- | ------ |
| POST   | `/reports/generate`     | Generate report     | Admin  |
| GET    | `/reports/history`      | Get report history  | Admin  |
| GET    | `/reports/download/:id` | Download report PDF | Admin  |

#### 🔔 Notifications

| Method | Endpoint                   | Description             | Access  |
| ------ | -------------------------- | ----------------------- | ------- |
| GET    | `/notifications`           | Get user notifications  | Private |
| PUT    | `/notifications/:id/read`  | Mark as read            | Private |
| DELETE | `/notifications/:id`       | Delete notification     | Private |
| DELETE | `/notifications/clear-all` | Clear all notifications | Private |

#### 📝 Feedback

| Method | Endpoint                | Description         | Access  |
| ------ | ----------------------- | ------------------- | ------- |
| GET    | `/feedback`             | Get all feedback    | Admin   |
| POST   | `/feedback`             | Submit feedback     | Private |
| GET    | `/feedback/:id`         | Get feedback by ID  | Admin   |
| PUT    | `/feedback/:id/respond` | Respond to feedback | Admin   |

#### 📞 Contact

| Method | Endpoint               | Description         | Access |
| ------ | ---------------------- | ------------------- | ------ |
| POST   | `/contact`             | Submit contact form | Public |
| GET    | `/contact`             | Get all messages    | Admin  |
| PUT    | `/contact/:id/respond` | Respond to message  | Admin  |

---

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['admin', 'staff', 'student', 'guest'],
  phone: String,
  avatar: String (URL),
  isVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  preferences: {
    dietary: [String],
    allergies: [String],
    notifications: {
      email: Boolean,
      push: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Menu Model

```javascript
{
  name: String (required),
  description: String,
  category: Enum ['breakfast', 'lunch', 'dinner', 'snack'],
  price: Number (required),
  image: String (URL),
  isAvailable: Boolean,
  servingDate: Date,
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  },
  dietary: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model

```javascript
{
  user: ObjectId (ref: 'User'),
  menuItem: ObjectId (ref: 'Menu'),
  mealType: Enum ['breakfast', 'lunch', 'dinner'],
  bookingDate: Date,
  quantity: Number,
  totalAmount: Number,
  status: Enum ['pending', 'confirmed', 'cancelled', 'completed'],
  qrCode: String,
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model

```javascript
{
  user: ObjectId (ref: 'User'),
  booking: ObjectId (ref: 'Booking'),
  amount: Number (required),
  paymentMethod: Enum ['wallet', 'upi', 'card', 'netbanking'],
  transactionId: String,
  status: Enum ['pending', 'completed', 'failed', 'refunded'],
  paymentGateway: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet Model

```javascript
{
  user: ObjectId (ref: 'User', unique),
  balance: Number (default: 0),
  transactions: [{
    type: Enum ['credit', 'debit'],
    amount: Number,
    description: String,
    referenceId: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📸 Screenshots

### User Interface

#### 🏠 Home Page

Clean, modern landing page with hero section and key features.

#### 📱 Dashboard

Personalized dashboard showing upcoming bookings, wallet balance, and recent activity.

#### 🍱 Menu Browser

Browse daily menus with beautiful cards, filtering options, and nutritional information.

#### 💳 Payment Gateway

Secure payment interface with multiple payment options and wallet management.

#### 🔔 Notifications Center

Real-time notifications with categorization and read/unread status.

### Admin Panel

#### 📊 Analytics Dashboard

Comprehensive analytics with charts, graphs, and key performance indicators.

#### 👥 User Management

Advanced user management with search, filter, and bulk operations.

#### 🍽️ Menu Management

Create and manage menus with image upload and nutritional data.

#### 📦 Inventory Tracking

Track inventory levels, manage suppliers, and receive low-stock alerts.

#### 📈 Reports Generator

Generate detailed reports with customizable date ranges and export options.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug and steps to reproduce
2. **Suggest Features**: Share your ideas for new features or improvements
3. **Submit Pull Requests**: Fix bugs or implement new features
4. **Improve Documentation**: Help make our docs better
5. **Write Tests**: Increase test coverage

### Development Workflow

1. **Fork the repository**

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/MessMate-MERN.git
   cd MessMate-MERN
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes**

   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Commit your changes**

   ```bash
   git commit -m "Add some amazing feature"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes in detail
   - Reference any related issues
   - Wait for review and address feedback

### Code Style Guidelines

- **JavaScript**: Use ES6+ features, async/await for promises
- **React**: Functional components with hooks
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Write meaningful comments for complex logic
- **Commits**: Use clear, descriptive commit messages

### Testing

Run tests before submitting PR:

```bash
# Backend tests
cd server
npm test

# Frontend tests (if available)
cd client
npm test
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Vineet Mali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

### Developer

**Vineet Mali**

- GitHub: [@48vineet](https://github.com/48vineet)
- Email: vineetmali@example.com
- LinkedIn: [Vineet Mali](https://linkedin.com/in/vineetmali)

### Project Links

- **Repository**: [https://github.com/48vineet/MessMate-MERN](https://github.com/48vineet/MessMate-MERN)
- **Issue Tracker**: [https://github.com/48vineet/MessMate-MERN/issues](https://github.com/48vineet/MessMate-MERN/issues)
- **Discussions**: [https://github.com/48vineet/MessMate-MERN/discussions](https://github.com/48vineet/MessMate-MERN/discussions)

---

## 🙏 Acknowledgments

- **React Team** for the amazing React library
- **MongoDB** for the powerful database
- **Express.js** for the robust backend framework
- **Socket.IO** for real-time communication
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for beautiful animations
- **Stripe** for payment processing
- All open-source contributors who made this project possible

---

## 🗺️ Roadmap

### Phase 1 (Current)

- ✅ User authentication and authorization
- ✅ Meal booking system
- ✅ Payment gateway integration
- ✅ Admin panel with analytics
- ✅ Real-time notifications

### Phase 2 (Upcoming)

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced meal recommendations (AI-powered)
- [ ] Integration with campus ID cards
- [ ] Feedback and rating system enhancement

### Phase 3 (Future)

- [ ] Blockchain-based transaction logging
- [ ] IoT integration for automated attendance
- [ ] Advanced analytics with machine learning
- [ ] Multi-tenant support for multiple institutions
- [ ] Voice-based booking assistant

---

## 📊 Project Statistics

- **Total Lines of Code**: ~50,000+
- **Components**: 80+
- **API Endpoints**: 100+
- **Database Models**: 12
- **Dependencies**: 60+
- **Development Time**: 6+ months

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by Vineet Mali**

[Back to Top](#-messmate)

</div>
