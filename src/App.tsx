import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Venue,
  Booking,
  AIRecommendationRequest,
  AIRecommendationResult,
  Coordinates,
  NotificationItem
} from './types';
import { INITIAL_VENUES, CAMPUS_CENTER } from './data/campusVenues';
import { INITIAL_BOOKINGS } from './data/sampleBookings';
import { rankVenues } from './utils/aiRecommender';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { LandingHero } from './components/LandingHero';
import { DashboardView } from './components/DashboardView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { ExplainableAIModal } from './components/ExplainableAIModal';
import { CampusMapView } from './components/CampusMapView';
import { LiveNavigationView } from './components/LiveNavigationView';
import { MyBookingsView } from './components/MyBookingsView';
import { QRCodeModal } from './components/QRCodeModal';
import { AnalyticsView } from './components/AnalyticsView';
import { DemandForecastView } from './components/DemandForecastView';
import { AdminApprovalView } from './components/AdminApprovalView';
import { BookingModal } from './components/BookingModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SettingsView } from './components/SettingsView';

const LOCAL_STORAGE_KEY_VENUES = 'campusspace_venues_v1';
const LOCAL_STORAGE_KEY_BOOKINGS = 'campusspace_bookings_v1';
const LOCAL_STORAGE_KEY_ROLE = 'campusspace_role_v1';

export const App: React.FC = () => {
  // Navigation & Screen States
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('organizer');

  // Persistence: Venues & Bookings
  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_VENUES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_VENUES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_VENUES, JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'AI Recommendation Ready',
      message: 'Found 3 high-fit venues for your upcoming National AI Hackathon.',
      type: 'info',
      timestamp: '5m ago',
      read: false
    },
    {
      id: 'n2',
      title: 'Check-in Reminder',
      message: 'Dr. Kalam Auditorium booking completed with 100% verified attendance.',
      type: 'success',
      timestamp: '2h ago',
      read: false
    },
    {
      id: 'n3',
      title: 'Ghost Booking Release Warning',
      message: 'Smart door scanner armed: unverified rooms release after 15 min.',
      type: 'warning',
      timestamp: 'Yesterday',
      read: true
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Geolocation & Campus simulation
  const [userLocation, setUserLocation] = useState<Coordinates>(CAMPUS_CENTER);
  const [isSimulatingLocation, setIsSimulatingLocation] = useState<boolean>(true);

  // AI Recommendation engine state
  const [lastRequest, setLastRequest] = useState<AIRecommendationRequest | null>({
    eventType: 'Hackathon',
    attendance: 180,
    date: '2026-09-15',
    startTime: '09:00',
    endTime: '18:00',
    requiredFacilities: ['Projector', 'Wi-Fi', 'Air Conditioning', 'Power Outlets']
  });

  const [recommendations, setRecommendations] = useState<AIRecommendationResult[]>(() => {
    return rankVenues(INITIAL_VENUES, {
      eventType: 'Hackathon',
      attendance: 180,
      date: '2026-09-15',
      startTime: '09:00',
      endTime: '18:00',
      requiredFacilities: ['Projector', 'Wi-Fi', 'Air Conditioning', 'Power Outlets'],
      userLocation: CAMPUS_CENTER
    });
  });

  // Modal active states
  const [selectedDetailsRec, setSelectedDetailsRec] = useState<AIRecommendationResult | null>(null);
  const [selectedMapVenue, setSelectedMapVenue] = useState<Venue | null>(null);
  const [bookingModalVenue, setBookingModalVenue] = useState<{
    venue: Venue;
    matchScore?: number;
  } | null>(null);
  const [qrModalBooking, setQrModalBooking] = useState<Booking | null>(null);
  const [navigationTargetVenue, setNavigationTargetVenue] = useState<Venue | null>(null);

  // Toast alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // AI Recommender Submit Handler
  const handleFindBestVenue = (req: AIRecommendationRequest) => {
    const fullReq = { ...req, userLocation };
    setLastRequest(fullReq);
    const results = rankVenues(venues, fullReq);
    setRecommendations(results);
    setActiveTab('recommendations');
    showToast(`AI Match Complete: Ranked ${results.length} venues for your ${req.eventType}`);
  };

  // Check-in simulator (to demonstrate anti-ghost booking)
  const handleSimulateCheckIn = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            checkedIn: true,
            checkedInAt: new Date().toISOString()
          };
        }
        return b;
      })
    );

    // Update venue status to booked
    const b = bookings.find((item) => item.id === bookingId);
    if (b) {
      setVenues((prev) =>
        prev.map((v) => (v.id === b.venueId ? { ...v, status: 'booked' } : v))
      );
    }

    showToast('✓ Check-in Verified! Door unlocked & venue confirmed active.');
  };

  // Admin Approval / Rejection Handlers
  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );
    showToast(`Request #${bookingId} approved by Campus Administration.`);
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    showToast(`Request #${bookingId} rejected.`);
  };

  // Reset demo state
  const handleResetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_VENUES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_BOOKINGS);
    setVenues(INITIAL_VENUES);
    setBookings(INITIAL_BOOKINGS);
    showToast('Demo data successfully restored to factory preset.');
  };

  if (isLandingPage) {
    return (
      <LandingHero
        onEnterApp={(role) => {
          setCurrentRole(role);
          setIsLandingPage(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl shadow-cyan-500/30 text-xs flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuickLocate={() => {
          setIsSimulatingLocation(true);
          setUserLocation(CAMPUS_CENTER);
          showToast('Campus GPS locked: Central Plaza (19.1334, 72.9133)');
        }}
        isSimulatingLocation={isSimulatingLocation}
      />

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onFindBestVenue={handleFindBestVenue}
              venues={venues}
              bookings={bookings}
              onSelectVenueForMap={(v) => {
                setSelectedMapVenue(v);
                setActiveTab('map');
              }}
              onQuickBookVenue={(v) => {
                setBookingModalVenue({ venue: v, matchScore: 92 });
              }}
            />
          )}

          {activeTab === 'map' && (
            <CampusMapView
              venues={venues}
              selectedVenue={selectedMapVenue}
              onSelectVenue={setSelectedMapVenue}
              onBookVenue={(v) => setBookingModalVenue({ venue: v, matchScore: 90 })}
              onNavigateToVenue={(v) => {
                setNavigationTargetVenue(v);
                setActiveTab('navigation');
              }}
              recommendedVenueId={recommendations[0]?.venue.id}
              userLocation={userLocation}
            />
          )}

          {activeTab === 'recommendations' && (
            <AIRecommendationsView
              recommendations={recommendations}
              lastRequest={lastRequest}
              onSelectVenueForDetails={setSelectedDetailsRec}
              onSelectVenueForMap={(v) => {
                setSelectedMapVenue(v);
                setActiveTab('map');
              }}
              onBookVenue={(v, score) => {
                setBookingModalVenue({ venue: v, matchScore: score });
              }}
              onModifySearch={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'bookings' && (
            <MyBookingsView
              bookings={bookings}
              onOpenQRModal={setQrModalBooking}
              onCancelBooking={(id) => {
                setBookings((prev) =>
                  prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
                );
                showToast('Booking cancelled.');
              }}
              onNavigateToBookingVenue={(venueId) => {
                const found = venues.find((v) => v.id === venueId);
                if (found) {
                  setNavigationTargetVenue(found);
                  setActiveTab('navigation');
                }
              }}
            />
          )}

          {activeTab === 'navigation' && (
            <LiveNavigationView
              venues={venues}
              userLocation={userLocation}
              onUpdateUserLocation={setUserLocation}
              initialDestinationVenue={navigationTargetVenue || recommendations[0]?.venue}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'forecast' && <DemandForecastView />}

          {activeTab === 'admin' && (
            <AdminApprovalView
              bookings={bookings}
              venues={venues}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              onRoleChange={setCurrentRole}
              onResetDemoData={handleResetDemoData}
              isSimulatingLocation={isSimulatingLocation}
              onToggleSimulateLocation={() => setIsSimulatingLocation(!isSimulatingLocation)}
            />
          )}
        </main>
      </div>

      {/* Explainable AI Modal */}
      {selectedDetailsRec && (
        <ExplainableAIModal
          recommendation={selectedDetailsRec}
          onClose={() => setSelectedDetailsRec(null)}
          onBook={() => {
            setBookingModalVenue({
              venue: selectedDetailsRec.venue,
              matchScore: selectedDetailsRec.matchScore
            });
            setSelectedDetailsRec(null);
          }}
          onViewOnMap={() => {
            setSelectedMapVenue(selectedDetailsRec.venue);
            setSelectedDetailsRec(null);
            setActiveTab('map');
          }}
        />
      )}

      {/* Booking Form Modal */}
      {bookingModalVenue && (
        <BookingModal
          venue={bookingModalVenue.venue}
          initialMatchScore={bookingModalVenue.matchScore}
          currentRole={currentRole}
          onClose={() => setBookingModalVenue(null)}
          onConfirmBooking={(newBooking) => {
            setBookings([newBooking, ...bookings]);
            showToast(`Reservation confirmed for ${newBooking.venueName}! Smart Pass generated.`);
            setQrModalBooking(newBooking);
          }}
        />
      )}

      {/* QR Pass Modal */}
      {qrModalBooking && (
        <QRCodeModal
          booking={qrModalBooking}
          onClose={() => setQrModalBooking(null)}
          onSimulateCheckIn={handleSimulateCheckIn}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }}
      />
    </div>
  );
};
