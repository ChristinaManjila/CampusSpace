# CampusSpace

> **AI-Powered Campus Venue Booking & Optimization Platform**

CampusSpace is a smart campus venue management platform designed to make college event-space booking faster, more intelligent, and more efficient.

Traditional campus venue booking often depends on spreadsheets, manual approvals, or disconnected systems. This can lead to double bookings, delayed approvals, poor venue selection, and booked spaces remaining unused.

CampusSpace addresses these problems by combining venue booking, intelligent recommendations, map-based discovery, approval workflows, analytics, demand forecasting, notifications, and role-based access in one platform.

---

## 🚀 Key Features

### 1. Smart Venue Booking
- Browse available campus venues.
- Search and filter venues.
- View venue capacity, facilities, location, accessibility, and other details.
- Submit booking requests.
- Track booking status.
- Support booking statuses such as:
  - Pending
  - Auto-approved
  - Approved
  - Rejected
  - Cancelled

### 2. Explainable AI Venue Recommendations
CampusSpace includes an explainable recommendation engine that ranks venues according to the requirements of an event.

The recommendation score considers:

- **Capacity suitability** — 35%
- **Facility match** — 30%
- **Availability** — 20%
- **Historical suitability** — 10%
- **Proximity** — 5%

The system also provides reasons explaining why a venue received its recommendation score.

> **Note:** The current recommendation system is a deterministic weighted scoring engine, not a machine-learning or large-language model.

### 3. Campus Map
- Interactive campus map.
- Venue locations displayed geographically.
- Venue discovery through map-based navigation.
- Uses Leaflet for map functionality.

### 4. Live Navigation
- Helps users navigate to selected campus venues.
- Uses venue coordinates and simulated campus-location data.

### 5. Booking Management
Users can:
- View their bookings.
- Track booking status.
- Cancel bookings where applicable.
- Receive booking-related notifications.

### 6. Admin Approval System
Administrators can:
- View pending booking requests.
- Approve or reject bookings.
- Cancel bookings.
- Add new venues.
- Edit existing venue information.
- Monitor venue utilization.

### 7. Auto-Approval Workflow
Certain bookings can be handled through an auto-approval workflow based on predefined conditions and booking information, reducing unnecessary manual approval work.

### 8. No-Show / Ghost Booking Management
CampusSpace includes functionality for monitoring venue utilization and no-show behaviour.

This helps identify cases where a venue is booked but not actually used and supports better campus resource utilization.

### 9. Analytics Dashboard
Administrators can view campus resource information such as:
- Total venues
- Pending approvals
- Today's bookings
- Average utilization
- No-show rate
- Venue usage information

### 10. Demand Forecasting
The application includes a demand forecasting view intended to help administrators understand expected venue demand and plan campus resources more efficiently.

### 11. Role-Based Access
The project supports different user roles:

- **Admin**
- **Student**
- **Team Lead**
- **Maintenance**

Different roles can be used to control access to relevant parts of the application.

### 12. Notifications
The application supports notifications for important booking and system events.

### 13. Liked Events
Users can save or like events for easier access later.

### 14. Settings & Profile
Users can manage application settings and profile-related information through the settings interface.

### 15. Demo Data Reset
The application includes functionality for resetting demo data, making it easier to demonstrate the system repeatedly during presentations or testing.

---

## 🧠 How the Recommendation System Works

CampusSpace uses a weighted scoring approach to rank venues.

For each venue, the system calculates individual scores for:

1. Capacity
2. Facilities
3. Availability
4. Historical suitability
5. Proximity

The final score is calculated as:

```text
Overall Score =
    Capacity Score × 0.35
  + Facility Score × 0.30
  + Availability Score × 0.20
  + Historical Score × 0.10
  + Proximity Score × 0.05
```

Venues are then sorted from the highest score to the lowest score.

### Distance Calculation

The recommendation engine uses the **Haversine formula** to calculate the geographical distance between two coordinates.

Walking time is estimated from the calculated distance.

The system also generates human-readable explanations so users can understand why a particular venue was recommended.

---

## 🏗️ Technology Stack

### Frontend
- React
- TypeScript
- React DOM
- Lucide React
- Leaflet

### Backend / Server
- Node.js-based development server
- Custom server implementation in `dev-server.js`

### Database Layer
The project contains a flexible relational data layer supporting:

- PostgreSQL
- PGlite
- Embedded JSON-backed relational storage

The database implementation is located in:

```text
src/server/db.js
```

### Browser Storage
The current React application also uses `localStorage` for some application state and demo persistence.

### Mapping
- Leaflet
- OpenStreetMap-compatible map data

---

## 📁 Project Structure

```text
CampusSpace/
│
├── data/
│   └── postgres_db/
│       ├── bookings.json
│       ├── events.json
│       ├── liked_events.json
│       ├── users.json
│       └── venues.json
│
├── mace_src/
│
├── src/
│   ├── components/
│   │   ├── AIRecommendationsView.tsx
│   │   ├── AdminApprovalView.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── BookingModal.tsx
│   │   ├── CampusMapView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── DemandForecastView.tsx
│   │   ├── ExplainableAIModal.tsx
│   │   ├── LandingHero.tsx
│   │   ├── LikedEventsView.tsx
│   │   ├── LiveNavigationView.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MyBookingsView.tsx
│   │   ├── Navbar.tsx
│   │   ├── NotificationsDrawer.tsx
│   │   ├── SettingsView.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── server/
│   │   └── db.js
│   │
│   ├── utils/
│   │   └── aiRecommender.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── App.tsx
│
├── dev-server.js
├── index.html
├── package.json
├── start.bat
├── test_campus_space.js
└── README.md
```

---

## 🔑 Important Source Files

### `src/App.tsx`

The main React application.

It handles major application-level functionality such as:

- User roles
- Login/logout flow
- Navigation
- Venue state
- Booking state
- Notifications
- Search
- Recommendations
- Admin actions
- Venue creation/editing
- Demo data reset
- Different application views

---

### `src/utils/aiRecommender.ts`

Contains the venue recommendation engine.

It handles:

- Venue scoring
- Distance calculation
- Capacity matching
- Facility matching
- Availability scoring
- Historical suitability
- Recommendation ranking
- Explainable recommendation reasons

---

### `src/types/index.ts`

Contains the TypeScript type definitions used throughout the project.

Examples include:

- Users
- Venues
- Bookings
- Events
- Facilities
- Notifications
- Coordinates
- User roles
- Booking statuses
- AI recommendation types

---

### `src/server/db.js`

Contains the database/data-layer implementation.

It supports different storage modes including:

- External PostgreSQL through `DATABASE_URL`
- PGlite
- Embedded JSON-backed relational storage

It also creates/seeds the required tables and demo data.

---

### `src/components/AdminApprovalView.tsx`

Contains the administrative venue and booking management interface.

It includes functionality for:

- Booking approvals
- Booking rejection
- Venue management
- Venue editing
- Utilization information
- No-show information

---

## 💾 Database Design

The data layer contains tables/entities for:

```text
users
venues
bookings
events
liked_events
```

### Users

Stores information related to application users and their roles.

### Venues

Stores information such as:

- Venue name
- Building
- Category
- Capacity
- Floor
- Coordinates
- Facilities
- Status
- Energy rating
- Historical suitability
- Cancellation rate
- Historical average occupancy
- Accessibility
- Description
- Available time slots

### Bookings

Stores booking-related information including:

- User
- Venue
- Event information
- Time
- Booking status
- Approval information

### Events

Stores campus event information.

### Liked Events

Stores events saved by users.

---

## 🔐 Demo Login

The project contains preset demo accounts for testing and demonstrations.

| Role | Username / Email |
|---|---|
| Admin | admin@campus.edu |
| Student | student@campus.edu |
| Team Lead | teamlead@campus.edu |
| Maintenance | maintenance@campus.edu |

> The repository contains demo credentials for local testing. Do not use these credentials for a production deployment.

---

## ⚙️ Installation

### 1. Clone the Repository

Clone the CampusSpace repository and open the project directory.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The exact command used by the project scripts is defined in `package.json`.

### 4. Start the Application

The project also provides:

```bash
npm start
```

A Windows startup script is also included:

```text
start.bat
```

---

## 🗄️ PostgreSQL Configuration

The database layer can use an external PostgreSQL database through the `DATABASE_URL` environment variable.

Example:

```text
DATABASE_URL=<your-postgresql-connection-string>
```

The project can also operate using its alternative local data-storage modes.

Do not commit real database credentials, API keys, or secrets to the repository.

---

## 🧪 Testing

A project test file is included:

```text
test_campus_space.js
```

Run the relevant test command or execute the test file according to the local development environment.

---

## 🔄 Application Flow

A typical user flow is:

```text
Login
  ↓
Dashboard
  ↓
Search / Map / Recommendations
  ↓
Select Venue
  ↓
View Venue Details
  ↓
Create Booking
  ↓
Booking Approval / Auto-Approval
  ↓
Booking Confirmation
  ↓
Check-in / Usage
  ↓
Analytics & Utilization
```

---

## 👥 User Roles

### Admin
Administrators can manage:

- Booking approvals
- Venues
- Venue information
- Utilization analytics
- System-level management functions

### Student
Students can:

- Discover venues
- Get recommendations
- Create bookings
- View bookings
- Track booking status
- Save events

### Team Lead
Team leads can use the booking and event-management workflow for organizing activities.

### Maintenance
The maintenance role is included for campus resource-management workflows.

---

## 🎯 Problem Statement

Campus venue booking is often handled manually using spreadsheets, forms, messages, or disconnected systems.

This creates several problems:

- Double booking
- Delayed approvals
- Difficulty finding suitable venues
- Poor resource utilization
- Booked-but-unused venues
- Lack of demand insights
- No centralized campus venue information

CampusSpace aims to provide a centralized and intelligent solution for these problems.

---

## 💡 Proposed Solution

CampusSpace brings the complete venue-management workflow into one platform.

Instead of simply showing whether a venue is free or occupied, the system attempts to answer:

> **"Which venue is the best choice for my event?"**

The platform considers event requirements such as:

- Expected attendance
- Required facilities
- Availability
- Distance
- Historical suitability

It then ranks suitable venues and explains the recommendation.

For administrators, CampusSpace provides:

- Approval management
- Venue management
- Utilization analytics
- No-show monitoring
- Demand forecasting

---

## 🌟 What Makes CampusSpace Different?

Traditional booking systems mainly answer:

> **"Is this room available?"**

CampusSpace aims to answer:

> **"Which available room is best for my event, and why?"**

This changes the system from a basic booking calendar into a **resource optimization platform**.

---

## 🧩 Main Modules

```text
CampusSpace
│
├── Authentication
│
├── Dashboard
│
├── Venue Discovery
│
├── AI Recommendations
│
├── Campus Map
│
├── Live Navigation
│
├── Booking Management
│
├── Admin Approval
│
├── Venue Management
│
├── Analytics
│
├── Demand Forecasting
│
├── Notifications
│
├── Liked Events
│
└── Settings
```

---

## 🔮 Future Improvements

Possible future improvements include:

- Real production authentication and authorization
- Secure password hashing and session management
- Full database-backed production deployment
- Real-time QR check-in
- Automatic release of unused venues after a configurable grace period
- Machine-learning-based demand forecasting
- More advanced venue recommendation models
- Calendar integration
- Email/SMS/push notifications
- Integration with college ERP systems
- Multi-campus support
- Real-time occupancy sensors
- Energy-aware venue recommendations
- Advanced analytics and reporting

---

## 🛡️ Security Notes

This repository is designed primarily as a college project/demo.

Before production deployment, the following should be strengthened:

- Password hashing
- Authentication/session security
- Authorization checks
- Input validation
- Database access controls
- Secret management
- API security
- Rate limiting
- Production database configuration

Never commit:

```text
API keys
Database passwords
Authentication secrets
Private tokens
Production credentials
```

---

## 📌 Project Status

**Status:** College Project / Hackathon Prototype

The project currently demonstrates the core concept of an intelligent campus venue booking and optimization platform with booking workflows, explainable venue recommendations, map-based discovery, administration, analytics, and a flexible local database layer.

---

## 👨‍💻 Team

**CampusSpace Team**

Built as a college project at:

**Mar Athanasius College of Engineering (MACE)**

---

## 📄 License

This project is released under the **MIT License**.

---

## ⭐ Summary

CampusSpace is more than a room-booking system.

It combines:

**Venue Booking + Explainable Recommendations + Maps + Approval Management + Analytics + Demand Forecasting**

to help colleges use their physical spaces more efficiently while making event planning easier for students and organizers.
