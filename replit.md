# Dokan E-commerce Platform

## Overview

Dokan is a comprehensive multi-vendor e-commerce platform that enables users to shop, vendors to sell products, and administrators to manage the entire marketplace. The platform supports user authentication, product management, shopping cart functionality, order processing, and real-time inventory tracking with a modern React frontend and Express.js backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express session with memory store for development
- **Authentication**: Session-based authentication with role-based access control
- **API Design**: RESTful API structure with role-specific endpoints

### Database Schema Design
- **Users Table**: Stores user information with role-based access (user, vendor, admin)
- **Vendors Table**: Extended vendor information linked to user accounts
- **Products Table**: Product catalog with vendor associations and inventory tracking
- **Orders/Cart Tables**: Shopping cart and order management functionality
- **Categories Table**: Product categorization system
- **Reviews/Coupons**: Customer feedback and promotional features

### Authentication & Authorization
- **Multi-role System**: Users, vendors, and admins with distinct capabilities
- **Protected Routes**: Client-side route protection based on user roles
- **Session Persistence**: Server-side session management with HTTP-only cookies
- **Role-specific Dashboards**: Separate interfaces for each user type

### Component Architecture
- **Reusable UI Components**: Modular component library with consistent design
- **Page Components**: Role-specific dashboard pages and public pages
- **Protected Route Wrapper**: Authentication enforcement for sensitive pages
- **Layout Components**: Navbar, sidebar, and cart components for consistent UX

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database with Neon serverless hosting
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Drizzle Kit**: Database migration and schema management tools

### UI & Styling
- **Radix UI**: Accessible primitive components for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production build optimization for server code
- **PostCSS**: CSS processing with Tailwind integration

### Validation & Forms
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management with performance optimization
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Date & Time
- **Date-fns**: Date manipulation and formatting utilities

### Server Infrastructure
- **Express Session**: Session management with configurable stores
- **Connect PG Simple**: PostgreSQL session store for production
- **CORS & Security**: Request handling and security middleware