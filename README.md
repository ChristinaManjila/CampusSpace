# CampusSpace

CampusSpace is an interactive campus venue booking and resource-management platform designed to help students and campus teams discover suitable venues, request bookings, manage events, and make better use of campus resources.

The project combines a React-based interface with campus venue data, booking workflows, recommendations, QR-based smart passes/check-in simulation, campus navigation, and resource-utilization analytics.

## Features

### Venue Discovery
- Browse campus venues and their availability.
- View venue capacity, facilities, and suitability information.
- Find venues based on event requirements.
- AI-style venue recommendations and suitability scoring.

### Booking Management
- Create venue booking requests with event and organizer information.
- Track booking status.
- Support booking approval and rejection workflows.
- Include requested facilities and event requirements.
- Simulate automatic/low-risk booking approval where supported by the application.

### User Roles

CampusSpace supports four main account roles:

- **Admin** — manages bookings, venues, approvals, and administrative information.
- **Student** — discovers venues, creates booking requests, views events, and uses student-focused features.
- **Team Lead** — manages team-related booking and event activities.
- **Maintenance** — views relevant approved bookings, venue requirements, facilities, and setup information.

> There is no separate "Organizer" account role. Organizer information may still be stored as event/booking information.

### Student Event Features
- Browse campus events.
- Save/like events for quick access.
- Access liked events from the student interface.

### Campus Navigation
- Interactive campus map.
- Venue location and navigation support.
- Leaflet/OpenStreetMap-based mapping.

### Smart Pass & Check-in
- QR-based smart pass functionality.
- Simulated QR check-in workflow.
- Support for no-show / "ghost booking" prevention simulation.

### Analytics
- Venue/resource utilization information.
- Demand and utilization forecasts.
- Administrative analytics views.

## Technology Stack

- **React 18**
- **TypeScript**
- **React DOM**
- **Lucide React** for icons
- **Leaflet** for maps
- **OpenStreetMap** for map data
- **Node.js** development server
- **PGlite / PostgreSQL-related tooling** included in the project dependencies
- Browser/local persistence is used by parts of the current application where applicable.

The repository currently uses a lightweight development server through `dev-server.js`, with the `npm run dev` and `npm start` scripts configured to use `agy-node`.

## Project Structure

```text
CampusSpace/
├── data/
│   └── postgres_db/          # Database-related project data
├── mace_src/                 # Project resources/source material
├── src/
│   ├── components/           # React UI components and views
│   ├── data/                 # Venue, booking, and application data
│   ├── server/               # Server/database-related code
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Recommendations, routing, QR and helper logic
│   └── App.tsx               # Main React application
├── dev-server.js             # Local development server
├── index.html                # Application entry point
├── package.json              # Project configuration and dependencies
├── start.bat                 # Windows startup helper
├── test_campus_space.js      # Basic project verification
└── README.md
```

## Requirements

Before running CampusSpace locally, install:

- Node.js
- npm
- `agy-node` available in the development environment

## Installation

Clone the repository:

```bash
git clone https://github.com/ChristinaManjila/CampusSpace.git
```

Move into the project directory:

```bash
cd CampusSpace
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Or:

```bash
npm start
```

On Windows, you can also use:

```text
start.bat
```

The application is served locally at:

```text
http://localhost:5173
```

## Verification

The repository includes a basic verification script.

Run:

```bash
node test_campus_space.js
```

The verification script checks required project files and starts a temporary HTTP server to verify that the main application page is available.

## Login

The login flow identifies the user's account role rather than requiring the user to manually select a role.

Supported roles:

| Role | Purpose |
|---|---|
| Admin | Administration, venue and booking management |
| Student | Venue discovery, events, bookings and student features |
| Team Lead | Team-related event and booking management |
| Maintenance | Venue setup and maintenance-related information |

For security, production deployments should use properly managed credentials and server-side authentication rather than hard-coded demonstration credentials.

## Booking Workflow

A typical booking flow is:

```text
User
  ↓
Browse / Search Venues
  ↓
Select Suitable Venue
  ↓
Enter Event & Booking Details
  ↓
Submit Booking Request
  ↓
Booking Status / Approval
  ↓
Smart Pass / Check-in
```

Venue suitability can take event requirements such as attendance, facilities, and venue capacity into account.

## Maps

CampusSpace uses Leaflet and OpenStreetMap for interactive campus mapping and venue navigation.

## Development Notes

The project is structured as a modular React/TypeScript application. UI components are separated from application data, shared types, server-related code, and utility functions.

When making changes:

1. Keep role-based behavior consistent.
2. Avoid introducing an additional account role called `organizer`.
3. Keep booking and venue data structures compatible with the existing application.
4. Test the booking workflow after changes.
5. Test all four user roles after authentication changes.
6. Run the verification script before committing major changes.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm start` | Starts the application server |
| `node test_campus_space.js` | Runs the basic project verification |

## Repository

GitHub:

https://github.com/ChristinaManjila/CampusSpace

## License

This project is licensed under the **MIT License**.

## CampusSpace Team

**CampusSpace Team**

Built as a campus-focused venue booking and resource-optimization project.
