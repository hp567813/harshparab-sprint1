# EstateEdge - Full-Stack Real Estate Platform

A modern, responsive real estate platform built with Node.js, Express, MySQL, and Bootstrap 5.

## Features

### 🏠 Property Management
- **Property Listings**: Browse, search, and filter properties
- **CRUD Operations**: Create, read, update, and delete properties
- **Image Support**: Property images with overlay information
- **Status Tracking**: Available, pending, and sold status management

### 👥 User Management
- **Multi-Role Authentication**: Buyers, sellers, and administrators
- **Secure Login**: JWT-based authentication with password hashing
- **Role-Based Access**: Different permissions for each user type
- **User Registration**: Easy account creation with role selection

### 📊 Admin Dashboard
- **Statistics Overview**: Total users, properties, sales, and revenue
- **Property Management**: Full CRUD operations for all properties
- **Sales Tracking**: Monitor property sales and transactions
- **Payment Management**: Track payment details and status

### 💰 Sales & Payments
- **Sales Tracking**: Record and manage property sales
- **Payment Processing**: Track payment details and methods
- **Commission Calculation**: Automatic commission tracking
- **Transaction History**: Complete payment and sales history

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Database management system
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling with custom animations
- **JavaScript** - Client-side functionality
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icons

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### 1. Clone & Install Dependencies
```bash
# Install backend dependencies
npm install
```

### 2. Database Setup
```bash
# Create database and tables
mysql -u root -p < schema.sql
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.sample .env

# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=estateedge
DB_PORT=3306
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_super_secret_session_key
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at: **http://localhost:5000**

## Default Admin Credentials

- **Email**: admin@estateedge.local
- **Password**: admin123

## Demo User Accounts

### Seller Account
- **Email**: seller1@example.com
- **Password**: password

### Buyer Account
- **Email**: buyer1@example.com
- **Password**: password

## Project Structure

```
EstateEdge/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── properties.js        # Property management routes
│   ├── sales.js             # Sales management routes
│   ├── users.js             # User management routes
│   └── payments.js          # Payment management routes
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   ├── auth.js          # Authentication utilities
│   │   └── app.js           # Main application logic
│   ├── index.html           # Home page
│   ├── login.html           # Login/Register page
│   ├── browse.html          # Property browsing page
│   └── dashboard.html       # Admin/Seller dashboard
├── server.js                # Main server file
├── schema.sql               # Database schema
├── package.json             # Dependencies and scripts
├── .env.sample              # Environment variables template
└── README.md                # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Sales
- `GET /api/sales` - Get sales (filtered by user role)
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale status
- `GET /api/sales/stats` - Get sales statistics (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/stats` - Get user statistics (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

### Payments
- `GET /api/payments` - Get all payments (admin only)
- `GET /api/payments/sale/:saleId` - Get payments for specific sale
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment status

## Features Overview

### For Buyers
- Browse and search properties
- Filter by price, location, type, and status
- Contact sellers directly
- View detailed property information

### For Sellers
- Add and manage their properties
- Update property status and details
- Track property views and inquiries
- Access sales dashboard

### For Administrators
- Full access to all properties and users
- View comprehensive statistics and analytics
- Manage sales and payment records
- User role management
- System-wide oversight

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for each user type
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Cross-origin request security

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Bootstrap 5**: Modern, responsive UI components
- **Custom Animations**: Smooth transitions and hover effects
- **Modern Aesthetics**: Clean, professional design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**EstateEdge** - Your trusted partner in real estate excellence! 🏡