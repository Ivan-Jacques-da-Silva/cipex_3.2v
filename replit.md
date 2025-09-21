# WowDash Portal CIPEX

## Overview

WowDash is a comprehensive educational portal designed for the CIPEX learning institution. The system serves as a digital platform where students and administrators can access courses, manage user accounts, handle finances, and interact with educational content. Built as a full-stack web application with React frontend and Express.js backend, it provides features including user management, school administration, course enrollment, audio content delivery, calendar scheduling, and financial tracking.

## Recent Changes

**September 21, 2025 - Database Migration Completed**
- Successfully migrated the educational management system from MySQL to PostgreSQL with Prisma ORM
- Implemented all essential routes including user management, schools, classes, courses, enrollments, attendance, grades, summaries, and extra materials
- Added audio visualization tracking, material extra management, class summaries, notes management, and birthday tracking features
- Enhanced security with bcrypt password hashing for new user registrations and profile updates
- Added basic authentication middleware to protect sensitive routes
- Normalized directory structure and file serving for better compatibility
- Server running on port 3001 with PostgreSQL database connections working correctly

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18.2.0 with functional components and hooks
- **Routing**: React Router DOM for single-page application navigation using HashRouter
- **UI Framework**: Bootstrap 5.3.3 with React Bootstrap components for responsive design
- **Styling**: CSS modules and utility classes, with custom stylesheets for component-specific styling
- **State Management**: React hooks for local state management, no global state library implemented
- **Interactive Features**: 
  - Drag-and-drop functionality using @dnd-kit libraries
  - Calendar integration with FullCalendar
  - Rich text editing with React Quill
  - Charts and data visualization with ApexCharts
  - File upload capabilities with custom components

### Backend Architecture
- **Framework**: Express.js with Node.js runtime
- **Database ORM**: Prisma Client for database operations and schema management
- **API Design**: RESTful API endpoints for CRUD operations
- **File Handling**: Multer middleware for file uploads with organized directory structure
- **Database Migration**: Transition from MySQL to PostgreSQL with Prisma as the ORM layer
- **CORS Configuration**: Comprehensive CORS setup supporting multiple allowed origins for different environments

### Authentication & Authorization
- **Authentication Method**: Login-based system with credential validation
- **Password Security**: bcryptjs for password hashing
- **Session Management**: Basic session handling without advanced token-based authentication
- **Access Control**: Role-based access appears to be implemented for different user types (students, administrators)

### Data Storage Solutions
- **Primary Database**: PostgreSQL (migrated from MySQL)
- **ORM**: Prisma for type-safe database operations and schema management
- **File Storage**: Local file system with organized directories for different content types:
  - Audio course materials (`/backend/AudioCurso/`)
  - Profile pictures (`/backend/FotoPerfil/`)
  - Course materials (`/backend/MaterialCurso/`)
  - Extra materials (`/backend/MaterialExtra/`)
  - Class materials (`/backend/materialdeaula/`)
  - Training content (`/backend/treinamento/`)

### Component Architecture
- **Modular Design**: Separate components for different functional areas (audio, calendar, financial, modals)
- **Responsive Components**: Mobile-first approach with CSS media queries for different screen sizes
- **Reusable Components**: Shared components for common UI elements like forms, tables, and navigation

## External Dependencies

### Frontend Libraries
- **UI Components**: React Bootstrap, Phosphor Icons, React Icons for comprehensive UI toolkit
- **Data Visualization**: ApexCharts and React ApexCharts for charts and graphs
- **Date/Time Handling**: Day.js for date manipulation, React DatePicker for date selection, Flatpickr for calendar widgets
- **Interactive Features**: 
  - @dnd-kit suite for drag-and-drop functionality
  - FullCalendar for calendar and scheduling features
  - React Beautiful DND for list reordering
- **Content Editing**: React Quill for rich text editing capabilities
- **Animation**: Animate.css for CSS animations, Canvas Confetti for celebration effects
- **Data Tables**: DataTables.net for advanced table functionality with sorting and filtering

### Backend Dependencies
- **Web Framework**: Express.js for HTTP server and API endpoints
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Security**: bcryptjs for password hashing, CORS for cross-origin request handling
- **File Processing**: Multer for handling multipart form data and file uploads
- **Development Tools**: Nodemon for development server auto-restart

### Development & Testing Tools
- **Testing Framework**: React Testing Library with Jest for component testing
- **Code Quality**: ESLint configuration for code standards
- **Build Tools**: React Scripts for webpack configuration and build process
- **Development Server**: Create React App setup for development environment

### Third-Party Integrations
- **Maps**: JSVectorMap for interactive map visualizations
- **Syntax Highlighting**: Highlight.js for code display
- **Layout Engine**: Isotope Layout for dynamic grid layouts
- **External APIs**: Axios for HTTP client requests to external services or internal API endpoints

The system is designed with a clear separation of concerns, modular architecture, and comprehensive tooling for both development and production environments. The migration from MySQL to PostgreSQL indicates a focus on modern, scalable database solutions while maintaining backwards compatibility during the transition period.