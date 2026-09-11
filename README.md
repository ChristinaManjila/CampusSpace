# CampusSpace

> Smart venue booking and utilization tracking for college campuses.

CampusSpace reimagines campus venue booking by moving beyond static calendars. Instead of just showing whether a room is free or taken, it recommends the *right* venue for your event, detects unused bookings, and gives administrators real insight into how spaces are actually being used.

## The Problem

Venue booking on most college campuses is still handled through spreadsheets, manual approvals, or disconnected systems. This leads to:

- **Double bookings** from uncoordinated scheduling
- **Delayed approvals** that slow down event planning
- **Inefficient use of space** — rooms marked "booked" often sit empty
- **No fit-checking** — existing digital portals only show availability, not suitability

Even institutions with basic digital booking portals are left with tools that function as glorified calendars, offering no help in matching events to appropriate venues or reclaiming wasted capacity.

## The Solution

CampusSpace shifts the focus from simple scheduling to **intelligent venue matching and utilization tracking**.

### Key Features

- **Smart Venue Recommendations**
  Given an event's type, expected attendance, required facilities, and preferred timing, CampusSpace recommends the most suitable available venues — ranked by fit using historical booking patterns — rather than just listing open slots.

- **QR-Based Check-In & No-Show Detection**
  Organizers check in via QR code at the start of their event. Unclaimed bookings are automatically detected and released back into the pool, reducing artificial scarcity caused by no-shows.

- **Demand Forecasting**
  The system anticipates high-demand periods based on past booking trends, helping organizers plan ahead instead of scrambling to resolve conflicts after they arise.

- **Utilization Dashboard**
  Administrators get a dashboard revealing underused or overbooked facilities, supporting data-driven decisions about campus resource planning.

- **Auto-Approval for Low-Risk Requests**
  Requests that meet low-risk criteria are automatically approved, cutting down on manual workload for faculty coordinators while keeping oversight where it matters.

## How It Works

1. An organizer submits an event request with details: type, expected attendance, required facilities, and preferred timing.
2. CampusSpace ranks available venues by fit, using historical data rather than raw availability alone.
3. Low-risk bookings are auto-approved; others are routed for manual review.
4. On the day of the event, organizers check in via QR code.
5. No-shows are detected automatically, and the venue is released back into the booking pool.
6. Administrators monitor usage trends and space efficiency through the utilization dashboard.

## Tech Stack

> _Update this section with your actual stack._

- **Frontend:** _e.g. React / Next.js_
- **Backend:** _e.g. Node.js / Express_
- **Database:** _e.g. PostgreSQL / MongoDB_
- **Other:** QR code generation/scanning library, scheduling/analytics logic

## Getting Started

### Prerequisites

- Node.js (vX.X or higher)
- A running database instance (see `.env.example`)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/campusspace.git
cd campusspace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the development server
npm run dev
```

## Roadmap

- [ ] Core venue recommendation engine
- [ ] QR check-in and no-show detection
- [ ] Utilization analytics dashboard
- [ ] Demand forecasting model
- [ ] Auto-approval rules engine
- [ ] Mobile-friendly organizer interface

## Contributing

Contributions are welcome. Please open an issue to discuss any major changes before submitting a pull request.

## License

_Specify your license here (e.g. MIT)._

## Contact

_Add your name/team and contact info here._
