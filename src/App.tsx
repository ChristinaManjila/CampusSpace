import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Venue,
  Booking,
  AIRecommendationRequest,
  AIRecommendationResult,
  Coordinates,
  NotificationItem,
  UserProfile,
  DEFAULT_USERS
} from './types';
import { INITIAL_VENUES, CAMPUS_CENTER } from './data/campusVenues';
import { INITIAL_BOOKINGS } from './data/sampleBookings';
import { rankVenues } from './utils/aiRecommender';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { LandingHero } from './components/LandingHero';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { ExplainableAIModal } from './components/ExplainableAIModal';
import { CampusMapView } from './components/CampusMapView';
import { LiveNavigationView } from './components/LiveNavigationView';
import { MyBookingsView } from './components/MyBookingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { DemandForecastView } from './components/DemandForecastView';
import { AdminApprovalView } from './components/AdminApprovalView';
import { BookingModal } from './components/BookingModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SettingsView } from './components/SettingsView';
import { LikedEventsView } from './components/LikedEventsView';

const LOCAL_STORAGE_KEY_VENUES = 'campusspace_venues_v2';
const LOCAL_STORAGE_KEY_BOOKINGS = 'campusspace_bookings_v2';
const LOCAL_STORAGE_KEY_USER = 'campusspace_user_v2';

export const App: React.FC = () => {
  // Navigation & Screen States
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [isLoginPage, setIsLoginPage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('student');

  // User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS['student'];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
      setCurrentRole(currentUser.role);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, [currentUser]);

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
      message: 'Found high-fit venues for your upcoming tech symposium.',
      type: 'info',
      timestamp: '5m ago',
      read: false
    },
    {
      id: 'n2',
      title: 'Low-Risk Auto Approval',
      message: 'Weekly robotics club meeting auto-approved under standard policy.',
      type: 'success',
      timestamp: '1h ago',
      read: false
    },
    {
      id: 'n3',
      title: 'Capacity Utilization Insight',
      message: 'Peak demand expected this Friday in Engineering Block venues.',
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
    eventType: 'Seminar',
    attendance: 120,
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '12:00',
    requiredFacilities: ['Projector', 'Air conditioning', 'Wi-Fi']
  });

  const [recommendations, setRecommendations] = useState<AIRecommendationResult[]>(() => {
    return rankVenues(INITIAL_VENUES, {
      eventType: 'Seminar',
      attendance: 120,
      date: '2026-09-18',
      startTime: '10:00',
      endTime: '12:00',
      requiredFacilities: ['Projector', 'Air conditioning', 'Wi-Fi'],
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
    showToast(`AI Match Complete: Ranked ${results.length} venues with suitability analysis`);
  };

  // Admin Approval / Rejection Handlers
  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Approved' } : b))
    );
    showToast(`Booking #${bookingId} has been Approved.`);
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Rejected' } : b))
    );
    showToast(`Booking #${bookingId} has been Rejected.`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    showToast(`Booking #${bookingId} cancelled.`);
  };

  // Venue Add / Edit Handler
  const handleSaveVenue = (savedVenue: Venue) => {
    setVenues((prev) => {
      const exists = prev.some((v) => v.id === savedVenue.id);
      if (exists) {
        return prev.map((v) => (v.id === savedVenue.id ? savedVenue : v));
      }
      return [savedVenue, ...prev];
    });
    showToast(`Venue "${savedVenue.name}" saved successfully.`);
  };

  // Reset demo state
  const handleResetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_VENUES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_BOOKINGS);
    setVenues(INITIAL_VENUES);
    setBookings(INITIAL_BOOKINGS);
    showToast('Demo data successfully restored to factory preset.');
  };

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsLoginPage(false);
    setIsLandingPage(false);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginPage(true);
    showToast('Signed out of CampusSpace.');
  };

  if (isLoginPage) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackToApp={() => setIsLoginPage(false)}
      />
    );
  }

  if (isLandingPage) {
    return (
      <LandingHero
        onEnterApp={(role) => {
          setCurrentRole(role);
          setIsLandingPage(false);
          setActiveTab(role === 'admin' ? 'admin' : 'dashboard');
        }}
        onOpenLogin={() => setIsLoginPage(true)}
      />
    );
  }

  const pendingApprovalsCount = bookings.filter((b) => b.status === 'Pending').length;

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
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginPage(true)}
        onLogout={handleLogout}
        onOpenLanding={() => setIsLandingPage(true)}
      />

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingApprovalsCount={pendingApprovalsCount}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginPage(true)}
          onLogout={handleLogout}
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
                setBookingModalVenue({ venue: v, matchScore: 95 });
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
              onCancelBooking={handleCancelBooking}
              onNavigateToBookingVenue={(venueId) => {
                const found = venues.find((v) => v.id === venueId);
                if (found) {
                  setNavigationTargetVenue(found);
                  setActiveTab('navigation');
                }
              }}
            />
          {activeTab === 'liked-events' && (
            <LikedEventsView
              onNavigateToVenue={(venueName) => {
                const found = venues.find((v) => v.name.toLowerCase().includes(venueName.toLowerCase()));
                if (found) {
                  setSelectedMapVenue(found);
                  setActiveTab('map');
                }
              }}
              onBookVenue={(venueName) => {
                const found = venues.find((v) => v.name.toLowerCase().includes(venueName.toLowerCase()));
                if (found) {
                  setBookingModalVenue({ venue: found });
                }
              }}
              onExploreEvents={() => {
                setActiveTab('dashboard');
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
              onCancelBooking={handleCancelBooking}
              onSaveVenue={handleSaveVenue}
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
            setBookingModalVenue(null);
            if (newBooking.status === 'Auto-approved') {
              showToast(`✓ Booking Auto-Approved for ${newBooking.venueName}!`);
            } else {
              showToast(`Reservation submitted for Admin Approval.`);
            }
          }}
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
