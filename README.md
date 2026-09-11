# CampusSpace

CampusSpace is an interactive campus venue booking and resource-optimization demo. It helps students, organizers, and administrators discover suitable venues, simulate bookings and QR check-ins, view campus navigation, and explore utilization analytics.

## Features

- AI-style venue recommendations based on event requirements
- Venue availability, capacity, facilities, and suitability scores
- Booking workflow with locally stored booking data
- QR smart passes and simulated check-in
- No-show / “ghost booking” prevention simulation
- Interactive campus map and venue navigation
- Resource-utilization analytics and demand forecasts
- Student, organizer, and administrator views
- Admin booking approval and rejection workflow

## Technology

- React 18, loaded in the browser
- Babel Standalone for JSX transformation
- Tailwind CSS via CDN
- Leaflet and OpenStreetMap for mapping
- Node.js static development server
- Browser `localStorage` for demo booking persistence

## Run locally

### Prerequisites

- Node.js
- `agy-node` available in your environment, as used by the supplied scripts

### Start the app

From the project directory:

```bash
npm run dev
```

Or on Windows, run:

```bat
start.bat
```

The app opens at:

```text
http://localhost:5173
```

## Verify the project

Run the included verification script:

```bash
node test_campus_space.js
```

It checks that required project files exist and starts a temporary HTTP server to verify the main page.

## Project structure

```text
CampusSpace/
├── index.html                 # Standalone interactive application
├── dev-server.js              # Local static server, runs on port 5173
├── start.bat                  # Windows launch helper
├── test_campus_space.js       # Basic verification script
├── package.json
└── src/                       # Modular TypeScript/React source layout
    ├── components/            # UI views and dialogs
    ├── data/                  # Sample venues, bookings, and analytics
    ├── types/                 # Shared TypeScript types
    └── utils/                 # Recommendations, routing, and QR helpers
```