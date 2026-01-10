# E-commerce Storefront

A modern, full-stack e-commerce platform built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

### Frontend
- 🛍️ **Modern UI**: Built with React, TypeScript, and shadcn/ui components
- 🛒 **Shopping Cart**: Session-based cart management with localStorage
- 🔍 **Product Search**: Advanced filtering and search capabilities
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⭐ **Product Reviews**: User reviews and ratings system
- 🎨 **Dark/Light Mode**: Theme switching support

### Backend
- 🔐 **Authentication**: Passport.js with local strategy and session management
- 📊 **Database**: PostgreSQL with Drizzle ORM
- 🛡️ **Security**: Rate limiting, validation, and security headers
- 📦 **REST API**: Comprehensive API for all e-commerce operations
- 👑 **Admin Dashboard**: Admin routes for managing products, orders, and users
- 🔄 **Session Management**: Secure session handling with express-session

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for state management
- Wouter for routing
- shadcn/ui component library
- Tailwind CSS for styling

### Backend
- Express.js with TypeScript
- PostgreSQL database
- Drizzle ORM for database operations
- Passport.js for authentication
- Zod for validation
- Express Rate Limit for security

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (optional for development)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd Ecom-Storefront
npm install
\`\`\`

### 2. Environment Setup

Copy the environment template:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:

\`\`\`env
# Database (optional for development - uses in-memory storage by default)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Session & Auth
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Environment
NODE_ENV="development"
PORT=5000
\`\`\`

### 3. Database Setup (Optional)

If using PostgreSQL:

\`\`\`bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

\`\`\`
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and contexts
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication configuration
│   ├── storage.ts        # Data storage layer
│   ├── middleware.ts     # Express middleware
│   └── config.ts         # Environment configuration
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── package.json
\`\`\`

## 🔧 API Endpoints

### Public APIs
- \`GET /api/categories\` - Get all categories
- \`GET /api/products\` - Get products with filtering
- \`GET /api/products/:id\` - Get single product
- \`GET /api/reviews/:productId\` - Get product reviews

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
- \`GET /api/auth/me\` - Get current user

### Cart Management
- \`GET /api/cart\` - Get cart items
- \`POST /api/cart\` - Add item to cart
- \`PATCH /api/cart/:productId\` - Update cart item quantity
- \`DELETE /api/cart/:productId\` - Remove item from cart

### Orders
- \`GET /api/orders\` - Get user orders
- \`POST /api/orders\` - Create new order
- \`GET /api/orders/:id\` - Get specific order

### Admin APIs (Protected)
- \`GET /api/admin/stats\` - Dashboard statistics
- \`GET /api/admin/products\` - Manage products
- \`GET /api/admin/orders\` - Manage orders
- \`GET /api/admin/users\` - Manage users

## 🔐 Authentication

The application uses Passport.js with local strategy:

1. **Registration**: Users register with username, email, and password
2. **Login**: Session-based authentication with secure cookies
3. **Authorization**: Role-based access control (customer/admin)

## 🗄️ Database Schema

### Core Tables
- \`users\` - User accounts and authentication
- \`categories\` - Product categories
- \`products\` - Product catalog
- \`reviews\` - Product reviews and ratings
- \`cart_items\` - Shopping cart items
- \`orders\` - Customer orders
- \`order_items\` - Order line items

## 🔧 Development Scripts

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate migrations
npm run db:push         # Push schema to database
npm run db:seed         # Seed sample data

# Code Quality
npm run check           # TypeScript type checking
\`\`\`

## 🚀 Deployment

### Environment Variables for Production

\`\`\`env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
SESSION_SECRET="your-secure-session-secret"
PORT=5000
\`\`\`

### Build and Deploy

\`\`\`bash
npm run build
npm start
\`\`\`

## 🔒 Security Features

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Zod schema validation for all inputs
- **Authentication**: Secure session management
- **Security Headers**: CSRF, XSS, and other security protections
- **Password Hashing**: bcrypt for secure password storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Need Help?

- Check the [Issues](link-to-issues) page for common problems
- Review the API documentation above
- Ensure all environment variables are properly set
- Check that PostgreSQL is running (if using database mode)

---

Built with ❤️ using modern web technologies