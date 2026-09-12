# 🏫 CampusSpace

### AI-Powered Campus Venue Booking & Resource Optimization Platform

CampusSpace is an intelligent campus venue management platform designed to simplify **venue discovery, booking, approval, navigation, event management, and resource utilization**.

Traditional campus venue booking often depends on spreadsheets, forms, manual approvals, and disconnected communication channels. This can lead to **double bookings, delayed approvals, unsuitable venue selection, unused reserved spaces, and inefficient resource management**.

CampusSpace brings these processes together into a single platform with **smart venue recommendations, booking workflows, QR-based check-ins, campus navigation, analytics, and administrative management**.

---

## ✨ Features

### 🤖 Smart Venue Recommendations

CampusSpace recommends suitable venues based on an event's requirements instead of simply showing available rooms.

The recommendation engine considers:

- 👥 Expected attendance
- 🪑 Venue capacity
- 🖥️ Required facilities
- 📅 Availability
- 📍 Distance from the user
- 📊 Historical suitability
- 🎯 Event type

Each venue receives a **match score** and an explanation describing why it was recommended.

### Recommendation Score

The current recommendation engine uses an explainable weighted scoring model:

| Factor | Weight |
|---|---:|
| Capacity Fit | 35% |
| Facility Match | 30% |
| Availability | 20% |
| Historical Suitability | 10% |
| Proximity | 5% |

```text
Overall Score =
    Capacity Fit × 0.35
  + Facility Match × 0.30
  + Availability × 0.20
  + Historical Suitability × 0.10
  + Proximity × 0.05
