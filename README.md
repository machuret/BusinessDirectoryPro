# Business Directory Platform

A modern, dynamic business directory platform that connects entrepreneurs and service providers through an intelligent, user-centric web application with advanced search and discovery capabilities.

## Features

### Core Functionality
- **Business Listings**: Comprehensive directory with detailed business profiles
- **Category-based Organization**: Businesses organized by industry categories
- **Advanced Search**: Search by business name, location, or category
- **User Reviews**: Customer review and rating system
- **Responsive Design**: Mobile-friendly interface

### Business Ownership System
- **Ownership Claims**: Registered users can claim ownership of businesses
- **Admin Approval Process**: Administrators review and approve/reject ownership claims
- **Business Management**: Approved owners can edit and manage their business listings
- **User Dashboard**: Centralized dashboard for business owners

### Admin Features
- **Business Management**: Full CRUD operations for business listings
- **User Management**: Admin can manage user accounts and roles
- **CSV Import**: Bulk import business data from CSV files
- **Ownership Claim Processing**: Review and process business ownership requests
- **Site Settings**: Configure platform-wide settings

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Email/password with session management
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/business-directory.git
cd business-directory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy the example environment file and configure your local settings:
```bash
cp .env.example .env
```
Then edit `.env` with your actual database connection and session secret.

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Initial Setup

After starting the application for the first time, you'll need to:
1. Register your first admin account through the application interface
2. Configure your database connection in the `.env` file
3. Set up any additional environment variables as needed

For production deployments, ensure all sensitive credentials are properly secured and never committed to version control.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json
```

## API Routes

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Businesses
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/featured` - Get featured businesses
- `GET /api/businesses/:id` - Get business by ID
- `POST /api/businesses` - Create new business (admin)
- `PATCH /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business (admin)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug

### Reviews
- `GET /api/businesses/:id/reviews` - Get business reviews
- `POST /api/businesses/:id/reviews` - Add review

### Ownership Claims
- `POST /api/ownership-claims` - Submit ownership claim
- `GET /api/ownership-claims` - Get all claims (admin)
- `GET /api/ownership-claims/user/:userId` - Get user's claims
- `PATCH /api/ownership-claims/:id` - Process claim (admin)

### Admin
- `GET /api/admin/businesses` - Get all businesses (admin)
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/import-csv` - Import businesses from CSV

## Database Schema

### Users
- User authentication and profile information
- Role-based access control (user, admin)

### Businesses
- Complete business information including contact details
- Category associations and ratings
- Owner relationships

### Categories
- Business categorization system
- Slug-based routing

### Reviews
- User reviews and ratings for businesses
- Automatic rating calculation

### Ownership Claims
- Business ownership request system
- Admin approval workflow

## CSV Import Format

The system supports importing businesses via CSV with the following columns:
- title, description, address, city, state, country
- phone, website, email
- category, latitude, longitude
- And additional business-specific fields

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.