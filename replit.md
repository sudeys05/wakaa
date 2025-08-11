# Overview

This is a Police Management System built as a full-stack web application. The system provides police departments with tools to manage cases, occurrence book (OB) entries, license plate records, and user administration. It features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.
Code style: JavaScript/JSX only - all files use pure JavaScript syntax without TypeScript features

# Recent Updates (August 2025)

- ✅ Successfully converted entire project from TypeScript to JavaScript (.js/.jsx) files only
- ✅ Police vehicle tracking system fully implemented in JavaScript:
  - Database schema for vehicle location and patrol area tracking
  - Backend API endpoints for vehicle management (CRUD operations)  
  - Interactive map with vehicle markers, patrol areas, and status indicators
  - Integration with existing Geofiles section for vehicle tracking
- ✅ Sample data includes 4 police vehicles with different types and patrol areas
- ✅ Server startup fixed for JavaScript-only environment
- ✅ All TypeScript dependencies removed from core application files

# Migration Status (August 2025)

The project has been successfully migrated from Replit Agent to the standard Replit environment:
- ✅ All TypeScript files converted to JavaScript (.ts → .js)
- ✅ Dependencies installed and configured
- ✅ Server running successfully on port 5000
- ✅ Client-side React application functional
- ✅ Database schema and storage layer operational

Note: The package.json still references TypeScript files in the dev script, but the application runs correctly using the JavaScript files directly.

# System Architecture

## Frontend Architecture
- **Framework**: React with JSX and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Navigation**: Browser history-aware navigation with proper back button support for case management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: JavaScript with ES modules for modern features
- **Session Management**: Express-session with PostgreSQL storage for secure authentication
- **API Design**: RESTful endpoints with middleware-based authentication and authorization
- **Development**: Hot module replacement with Vite integration for rapid development

## Enhanced Features (January 2025)
- **Collapsible Sidebar**: Three-dot expandable navigation with user session persistence and hamburger menu icon when collapsed
- **Role-Based Profile Management**: Admin-only access to officer management with full CRUD operations and black background filter styling
- **Advanced Search & Filtering**: Multi-criteria search by departments, badge numbers, names, and specializations
- **Case Navigation**: Browser-aware case management with proper back button functionality for seamless navigation
- **Police-Specific Data Models**: Comprehensive officer profiles with department assignments and specializations
- **Integrated Case Management**: New case creation with backend API integration and real-time dashboard updates
- **Dashboard Navigation**: Clickable case statistics cards that link directly to the cases section
- **Authentication Flow**: Logout functionality that redirects users to the login page automatically
- **Case Editing**: Full case editing functionality with form validation and backend integration
- **Refresh Functionality**: Manual refresh button for cases list with loading animation

## Database Architecture
- **Database**: PostgreSQL with Neon serverless integration
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Structured tables for users, cases, occurrence book entries, license plates, and password reset tokens
- **Authentication**: Session-based authentication with role-based access control (admin/user roles)

## Security Features
- **Authentication**: Session-based authentication with secure HTTP-only cookies and automatic logout redirection
- **Authorization**: Role-based access control with admin and user permissions, including profile management restrictions
- **Password Management**: Secure password reset functionality with time-limited tokens
- **Input Validation**: Zod schema validation on both frontend and backend
- **Admin Access Control**: Profile management section restricted to administrators only

## Project Structure
- **Monorepo Layout**: Client, server, and shared code in separate directories
- **Shared Schema**: Common JavaScript modules and Zod schemas shared between frontend and backend
- **Asset Management**: Centralized asset handling with proper path resolution
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool with hot module replacement for development
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Node.js**: Pure JavaScript runtime without TypeScript compilation

## Authentication and Session Management
- **Express Session**: Server-side session management
- **Connect PG Simple**: PostgreSQL session store for persistent sessions

## Data Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema parsing

## Utilities
- **date-fns**: Date manipulation and formatting library
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: Secure URL-friendly unique string ID generator