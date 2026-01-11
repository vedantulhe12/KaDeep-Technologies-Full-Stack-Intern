# 🛒 E-commerce Storefront

<div align="center">

![E-commerce Storefront](https://img.shields.io/badge/E--commerce-Storefront-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

*A modern, full-stack e-commerce platform built with React, TypeScript, Express.js, and PostgreSQL*

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Feature Request](#)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📚 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [⚙️ Environment Setup](#️-environment-setup)
- [📁 Project Structure](#-project-structure)
- [🔌 API Documentation](#-api-documentation)
- [🎯 Usage](#-usage)
- [🐳 Docker Setup](#-docker-setup)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🛍️ **Customer Features**
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add, remove, and modify cart items with session persistence
- **User Authentication**: Secure registration and login system
- **Product Reviews**: Rate and review products
- **Order Management**: Place orders and track order history
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme switching for better user experience

### 👑 **Admin Features**
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts
- **Analytics Dashboard**: View sales statistics and insights
- **Category Management**: Organize products into categories

### 🔧 **Technical Features**
- **TypeScript**: Full type safety across frontend and backend
- **Real-time Updates**: Live cart updates and order status
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Security**: Rate limiting, input validation, and secure authentication
- **API Documentation**: Comprehensive REST API
- **Error Handling**: Graceful error handling and user feedback

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### **Backend**
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Relational database
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **Express Rate Limit** - Rate limiting middleware
- **Zod** - Schema validation

### **DevOps & Tools**
- **tsx** - TypeScript execution
- **Drizzle Kit** - Database migrations
- **ESBuild** - Fast bundler
- **Git** - Version control

---

## 📚 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (optional - uses in-memory storage by default)
- **Git**

### **System Requirements**
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space

---

## 🚀 Quick Start

Get your development environment running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ecom-storefront.git
cd ecom-storefront

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Start development server
npm run dev
```

🎉 **That's it!** Your e-commerce platform is now running at `http://localhost:5000`

---

## 🔧 Installation

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/ecom-storefront.git
cd ecom-storefront
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Environment Configuration**
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database (optional for development)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Session & Authentication
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Environment
NODE_ENV="development"
PORT=5000
```

### **Step 4: Database Setup** *(Optional)*
If you want to use PostgreSQL instead of in-memory storage:

```bash
# Create database
createdb ecommerce_db

# Generate and run migrations
npm run db:generate
npm run db:push

# Seed with sample data
npm run db:seed
```

### **Step 5: Start Development Server**
```bash
npm run dev
```

---

## ⚙️ Environment Setup

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | No* |
| `SESSION_SECRET` | Session encryption key | - | Yes** |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | - | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | No |
| `SMTP_HOST` | Email server host | - | No |
| `SMTP_PORT` | Email server port | `587` | No |
| `SMTP_USER` | Email username | - | No |
| `SMTP_PASS` | Email password | - | No |

*Uses in-memory storage if not provided  
**Required for production

### **Development vs Production**

**Development Mode:**
- Uses in-memory storage by default
- Hot reload enabled
- Detailed error messages
- No rate limiting

**Production Mode:**
- Requires DATABASE_URL
- Optimized builds
- Security headers enabled
- Rate limiting active

---

## 📁 Project Structure

```
ecom-storefront/
├── 📁 client/                    # Frontend React application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── 📁 ui/          # shadcn/ui components
│   │   │   ├── header.tsx      # Navigation header
│   │   │   ├── footer.tsx      # Site footer
│   │   │   └── product-card.tsx # Product display
│   │   ├── 📁 pages/           # Page components
│   │   │   ├── home.tsx        # Homepage
│   │   │   ├── products.tsx    # Product listing
│   │   │   ├── cart.tsx        # Shopping cart
│   │   │   └── checkout.tsx    # Checkout process
│   │   ├── 📁 lib/             # Utilities and contexts
│   │   │   ├── cart-context.tsx # Cart state management
│   │   │   ├── theme-provider.tsx # Theme switching
│   │   │   └── utils.ts        # Helper functions
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # App entry point
│   └── index.html              # HTML template
├── 📁 server/                   # Backend Express application
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API route handlers
│   ├── auth.ts                 # Authentication logic
│   ├── storage.ts              # Data storage layer
│   ├── database-storage.ts     # PostgreSQL implementation
│   ├── middleware.ts           # Express middleware
│   ├── config.ts               # Environment configuration
│   ├── admin-routes.ts         # Admin API endpoints
│   ├── db.ts                   # Database connection
│   └── seed.ts                 # Database seeding
├── 📁 shared/                   # Shared types and schemas
│   └── schema.ts               # Database schema & types
├── 📁 migrations/               # Database migrations
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 tailwind.config.ts       # Tailwind CSS config
├── 📄 vite.config.ts           # Vite configuration
├── 📄 drizzle.config.ts        # Database configuration
├── 📄 .env.example             # Environment template
├── 📄 .gitignore               # Git ignore rules
└── 📄 README.md                # This file
```

---

## 🔌 API Documentation

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
```

### **Product Endpoints**

#### Get All Products
```http
GET /api/products
```
**Query Parameters:**
- `category` - Filter by category
- `search` - Search in name/description
- `deals` - Show only deals (true/false)
- `featured` - Show only featured (true/false)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `minRating` - Minimum rating
- `isPrime` - Prime eligible only
- `limit` - Limit results

#### Get Single Product
```http
GET /api/products/{id}
```

### **Cart Endpoints**

#### Get Cart Items
```http
GET /api/cart?sessionId={sessionId}
```

#### Add to Cart
```http
POST /api/cart
```
**Body:**
```json
{
  "productId": "prod-123",
  "quantity": 2,
  "sessionId": "session-123"
}
```

#### Update Cart Item
```http
PATCH /api/cart/{productId}
```
**Body:**
```json
{
  "quantity": 3,
  "sessionId": "session-123"
}
```

#### Remove from Cart
```http
DELETE /api/cart/{productId}?sessionId={sessionId}
```

### **Order Endpoints**

#### Get User Orders
```http
GET /api/orders?sessionId={sessionId}
```

#### Create Order
```http
POST /api/orders
```
**Body:**
```json
{
  "sessionId": "session-123",
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "credit_card",
  "items": [...],
  "subtotal": 99.99,
  "shipping": 5.99,
  "tax": 8.50,
  "total": 114.48
}
```

### **Admin Endpoints** *(Protected)*

#### Get Dashboard Stats
```http
GET /api/admin/stats
```

#### Manage Products
```http
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

#### Manage Orders
```http
GET /api/admin/orders
PUT /api/admin/orders/{id}/status
```

---

## 🎯 Usage

### **Customer Workflow**

1. **Browse Products**: Visit the homepage to see featured products and categories
2. **Search & Filter**: Use the search bar and filters to find specific products
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Review Cart**: View cart items and adjust quantities
5. **Checkout**: Provide shipping information and complete order
6. **Track Orders**: View order history and status updates

### **Admin Workflow**

1. **Login as Admin**: Use admin credentials to access admin features
2. **Manage Products**: Add, edit, or remove products from the catalog
3. **Process Orders**: View incoming orders and update their status
4. **View Analytics**: Check sales performance and customer insights
5. **Manage Users**: Handle customer accounts and permissions

### **Example API Usage**

```javascript
// Fetch products with filters
const response = await fetch('/api/products?category=electronics&deals=true');
const products = await response.json();

// Add item to cart
const cartResponse = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'prod-123',
    quantity: 1,
    sessionId: 'user-session-id'
  })
});
```

---

## 🐳 Docker Setup

### **Development with Docker**

```bash
# Build development image
docker build -t ecom-storefront-dev .

# Run with docker-compose
docker-compose up -d
```

### **Production Deployment**

```bash
# Build production image
docker build --target production -t ecom-storefront-prod .

# Run production container
docker run -p 5000:5000 --env-file .env.production ecom-storefront-prod
```

### **docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🚀 Deployment

### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Railway Deployment**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up
```

### **Manual Server Deployment**

```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Environment Variables for Production**

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-secure-session-secret
PORT=5000
```

---

## 🧪 Testing

### **Run Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage
```

### **API Testing**

```bash
# Test API endpoints
node test-api.js

# Manual testing with curl
curl http://localhost:5000/api/products
```

### **Testing Strategy**

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

### **Development Workflow**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Style**

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **tests** for new features
- Update **documentation** as needed

### **Commit Convention**

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Your Name

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

## 🙏 Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)** - Amazing UI components
- **[Lucide](https://lucide.dev/)** - Beautiful icons
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[React](https://reactjs.org/)** - UI library
- **[Express.js](https://expressjs.com/)** - Web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

---

<div align="center">

### 🌟 **Star this repo if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/ecom-storefront?style=social)](https://github.com/yourusername/ecom-storefront/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/ecom-storefront?style=social)](https://github.com/yourusername/ecom-storefront/network)

**Made with ❤️ using modern web technologies**

</div>