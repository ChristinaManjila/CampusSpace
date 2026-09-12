import React, { useState, useEffect } from 'react';
import { LikedEvent, CampusEvent } from '../types';

interface LikedEventsViewProps {
  onNavigateToVenue?: (venueName: string) => void;
  onBookVenue?: (venueName: string) => void;
  onExploreEvents?: () => void;
}

export const LikedEventsView: React.FC<LikedEventsViewProps> = ({
  onNavigateToVenue,
  onBookVenue,
  onExploreEvents
}) => {
  const [likedEvents, setLikedEvents] = useState<LikedEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEventDetails, setSelectedEventDetails] = useState<CampusEvent | null>(null);

  const fetchLikedEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('campusspace_auth_token');
      const res = await fetch('/api/liked-events', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setLikedEvents(data.likedEvents || []);
      }
    } catch (err) {
      console.error('Failed to load liked events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedEvents();
  }, []);

  const handleUnlike = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('campusspace_auth_token');
      await fetch(`/api/liked-events/${bookingId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setLikedEvents((prev) => prev.filter((item) => String(item.bookingId) !== String(bookingId)));
    } catch (err) {
      console.error('Failed to unlike event:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-semibold mb-2">
            <span>❤️</span>
            <span>Student Liked Events Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Liked Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            PostgreSQL-backed saved events with venue navigation and direct booking shortcuts.
          </p>
        </div>

        {onExploreEvents && (
          <button
            onClick={onExploreEvents}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <span>📅</span>
            <span>Explore More Events</span>
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 border border-slate-800 rounded-3xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-slate-400">Loading saved events from PostgreSQL...</p>
        </div>
      ) : likedEvents.length === 0 ? (
        <div className="p-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center max-w-lg mx-auto">
          <div className="text-5xl mb-4">🤍</div>
          <h3 className="text-lg font-bold text-white mb-2">No Liked Events Yet</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You haven't liked any campus events yet. Browse events, symposiums, and hackathons, and click the heart icon to save them here for quick access.
          </p>
          {onExploreEvents && (
            <button
              onClick={onExploreEvents}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
            >
              Browse Campus Events →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedEvents.map((item) => {
            const ev = item.event;
            const title = ev ? ev.title : `Event #${item.bookingId}`;
            const venue = ev ? ev.venue : 'Campus Space';
            const date = ev ? ev.date : 'Upcoming';
            const time = ev ? `${ev.startTime || ''} – ${ev.endTime || ''}` : '';
            const desc = ev ? ev.description : 'Saved campus event';
            const college = ev ? ev.college : 'MACE';

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition group relative"
              >
                {/* Top Poster Image */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  {ev?.posterUrl ? (
                    <img
                      src={ev.posterUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600 bg-gradient-to-tr from-slate-950 to-slate-900">
                      🎨
                    </div>
                  )}

                  {/* Heart button */}
                  <button
                    onClick={() => handleUnlike(String(item.bookingId))}
                    title="Unlike this event"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/80 backdrop-blur-md border border-rose-500/40 text-rose-400 hover:bg-rose-950 hover:scale-110 flex items-center justify-center text-base transition shadow-md"
                  >
                    ♥
                  </button>

                  {/* College Tag */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300">
                    🏛 {college}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 leading-tight">
                      {title}
                    </h3>

                    <div className="space-y-1 text-xs mb-3">
                      <div className="text-cyan-400 font-medium flex items-center gap-1.5">
                        <span>📅</span>
                        <span>{date} {time && `• ${time}`}</span>
                      </div>
                      <div className="text-slate-400 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{venue}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {desc}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onNavigateToVenue && onNavigateToVenue(venue)}
                        className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <span>🧭</span>
                        <span>View on Map</span>
                      </button>

                      <button
                        onClick={() => onBookVenue && onBookVenue(venue)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <span>📅</span>
                        <span>Book Venue</span>
                      </button>
                    </div>

                    {ev && (
                      <button
                        onClick={() => setSelectedEventDetails(ev)}
                        className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-200 transition font-medium"
                      >
                        View Event Overview & Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedEventDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedEventDetails(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {selectedEventDetails.category}
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedEventDetails.title}
                </h2>
                <p className="text-xs text-slate-400">{selectedEventDetails.college}</p>
              </div>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <div><strong>Date:</strong> {selectedEventDetails.date} ({selectedEventDetails.startTime} – {selectedEventDetails.endTime})</div>
              <div><strong>Venue:</strong> {selectedEventDetails.venue}</div>
              <div><strong>Organizer:</strong> {selectedEventDetails.organizer}</div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedEventDetails.description}
            </p>

            <div className="flex gap-2 pt-2">
              {selectedEventDetails.registrationLink && (
                <a
                  href={selectedEventDetails.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black text-center font-bold text-xs hover:bg-cyan-400 transition"
                >
                  Register Online 🔗
                </a>
              )}
              {selectedEventDetails.googleFormLink && (
                <a
                  href={selectedEventDetails.googleFormLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-center font-bold text-xs hover:bg-emerald-500 transition"
                >
                  Google Form 📝
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
