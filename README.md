# E-commerce Storefront

A modern, full-stack e-commerce platform built with React, TypeScript, Express.js, and file-based persistent storage.

## 🚀 Features

### Frontend
- 🛍️ **Modern UI**: Built with React, TypeScript, and shadcn/ui components
- 🛒 **Shopping Cart**: Session-based cart management with localStorage
- 🔍 **Product Search**: Advanced filtering and search capabilities with multi-word support
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⭐ **Product Reviews**: Authenticated user reviews and ratings system with deletion rights
- 💖 **Wishlist**: Complete wishlist functionality with localStorage persistence
- 🎨 **Dark/Light Mode**: Theme switching support
- 🖼️ **Image Handling**: Robust image loading with fallbacks for broken images
- 🔄 **Sorting & Filtering**: Products by price, rating, category, and more
- 📦 **Secure Checkout**: Login-required checkout with autofilled user details

### Backend
- 🔐 **Authentication**: Passport.js with local strategy and session management
- 💾 **File Storage**: JSON-based persistent storage for development (no database required)
- 📊 **Database Ready**: Optional PostgreSQL support with Drizzle ORM
- 🛡️ **Security**: Rate limiting, validation, and security headers
- 📦 **REST API**: Comprehensive API for all e-commerce operations
- 👑 **Admin Dashboard**: Complete admin panel for managing products, orders, and users
- ✏️ **Product Management**: Full CRUD operations for products with image preview
- 🔄 **Session Management**: Secure session handling with express-session

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for state management
- Wouter for routing
- shadcn/ui component library
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Express.js with TypeScript
- File-based JSON storage (development)
- Optional PostgreSQL with Drizzle ORM (production)
- Passport.js for authentication
- Zod for validation
- Express Rate Limit for security
- bcrypt for password hashing

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (optional - uses file storage by default)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Ecom-Storefront
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (optional - uses file storage by default)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Session & Auth
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Environment
NODE_ENV="development"
PORT=5000

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database Setup (Optional)

**For Development**: No setup required! Uses file-based storage automatically.

**For Production with PostgreSQL**:

```bash
# Set DATABASE_URL in .env
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) (frontend) or [http://localhost:5000](http://localhost:5000) (API)

### 5. Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**User Account:**
- Username: `testuser`
- Password: `user123`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── product-card.tsx
│   │   │   ├── product-image.tsx
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── admin.tsx  # Admin dashboard
│   │   │   ├── checkout.tsx
│   │   │   ├── product-detail.tsx
│   │   │   └── ...
│   │   ├── lib/           # Utilities and contexts
│   │   │   ├── auth-context.tsx
│   │   │   ├── cart-context.tsx
│   │   │   ├── wishlist-context.tsx
│   │   │   └── ...
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication configuration
│   ├── storage.ts        # Data storage layer
│   ├── file-storage.ts   # File-based storage implementation
│   ├── middleware.ts     # Express middleware
│   ├── config.ts         # Environment configuration
│   └── swagger.ts        # API documentation
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and types
├── data/                # File-based storage (auto-created)
│   └── storage.json     # Persistent data file
└── package.json
```

## 🔧 API Endpoints

### Public APIs
- `GET /api/categories` - Get all categories
- `GET /api/products` - Get products with filtering and sorting
- `GET /api/products/:id` - Get single product
- `GET /api/reviews/:productId` - Get product reviews

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Cart Management
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Reviews
- `POST /api/reviews` - Create product review (authenticated)
- `DELETE /api/reviews/:id` - Delete own review (authenticated)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order

### Admin APIs (Admin Only)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users

## 🔐 Authentication

The application uses Passport.js with local strategy:

1. **Registration**: Users register with username, email, and password
2. **Login**: Session-based authentication with secure cookies
3. **Authorization**: Role-based access control (customer/admin)
4. **Protected Routes**: Checkout requires authentication, admin routes require admin role

## 💾 Storage System

### Development Mode (Default)
- **File Storage**: Automatic JSON file persistence in `data/storage.json`
- **No Database Required**: Zero configuration, works out of the box
- **Persistent Data**: All products, users, orders persist between restarts

### Production Mode (Optional)
- **PostgreSQL**: Set `DATABASE_URL` to use database storage
- **Drizzle ORM**: Type-safe database operations
- **Migrations**: Database schema versioning

### Data Structure
- `users` - User accounts and authentication
- `categories` - Product categories (Electronics, Fashion, etc.)
- `products` - Complete product catalog with images and details
- `reviews` - User reviews and ratings
- `cart_items` - Shopping cart items
- `orders` - Customer orders with line items

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server (frontend + backend)
npm run build           # Build for production
npm run start           # Start production server

# Database (Optional)
npm run db:generate     # Generate migrations
npm run db:push         # Push schema to database
npm run db:seed         # Seed sample data

# Code Quality
npm run check           # TypeScript type checking
```

## 🌟 Key Features Implemented

### Admin Dashboard
- ✅ Complete product management (Create, Read, Update, Delete)
- ✅ Real-time image preview for product images
- ✅ User and order management
- ✅ Dashboard statistics (users, products, orders, revenue)
- ✅ Helpful guidance for image URLs

### User Experience
- ✅ Robust image loading with fallbacks
- ✅ Secure checkout flow with login requirement
- ✅ User details autofill for logged-in users
- ✅ Advanced search with multi-word support
- ✅ Product sorting and filtering
- ✅ Wishlist functionality
- ✅ Authenticated product reviews
- ✅ Review deletion for authors

### Technical Excellence
- ✅ File-based persistent storage
- ✅ Session-based authentication
- ✅ Rate limiting and security
- ✅ Comprehensive error handling
- ✅ Type-safe API with TypeScript
- ✅ Responsive design

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"  # Optional
SESSION_SECRET="your-secure-session-secret"
PORT=5000
CORS_ORIGIN="https://yourdomain.com"
```

### Build and Deploy

```bash
npm run build
npm start
```

**Note**: The `data/` folder contains user data and should be backed up in production.

## 🔒 Security Features

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Zod schema validation for all inputs
- **Authentication**: Secure session management with httpOnly cookies
- **Authorization**: Role-based access control
- **Security Headers**: CSRF, XSS, and other security protections
- **Password Hashing**: bcrypt for secure password storage
- **Image Validation**: Safe image URL handling with fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Need Help?

- Check the [Issues](link-to-issues) page for common problems
- Review the API documentation at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- Ensure all environment variables are properly set
- For image issues, use direct image links from Unsplash, Pixabay, or Pexels
- Check that the development server is running on the correct ports

## 📸 Image Sources

For adding products, use these free image sources:
- [Unsplash](https://unsplash.com) - Right-click → "Copy image address"
- [Pixabay](https://pixabay.com) - Click image → Download → Copy direct link
- [Pexels](https://pexels.com) - Right-click → "Copy image address"

---

Built with ❤️ using modern web technologies