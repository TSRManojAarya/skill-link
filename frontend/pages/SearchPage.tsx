import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';
import { api } from '../services/api';
import { calculateDistance, DEFAULT_LOCATION } from '../services/geo';
import { User, UserRole, Booking, BookingStatus, Availability, Message } from '../types';
import { Search, Filter, Map as MapIcon, List, Star, Clock, DollarSign, Shield, CheckCircle, X, ArrowDownUp, ShieldCheck, MapPin, ChevronLeft, Briefcase, Image as ImageIcon, ArrowRight, AlertCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fallback constant for UI display if data is missing
const DEFAULT_DISPLAY_AVAILABILITY: Availability[] = [
  { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Sat', enabled: false, startTime: '10:00', endTime: '14:00' },
  { day: 'Sun', enabled: false, startTime: '10:00', endTime: '14:00' },
];

export const SearchPage = () => {
  const { user, updateUserLocation } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(50); // Increased default
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [providers, setProviders] = useState<User[]>([]);
  const [providerStats, setProviderStats] = useState<{ jobs: number }>({ jobs: 0 });
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateUserLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.log('Location permission denied, using default.');
        }
      );
    }
  }, [updateUserLocation]);

  // Load providers - Re-fetch whenever the component mounts to catch new registrations
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const allProviders = await api.getProviders();
        setProviders(allProviders);
      } catch (error) {
        console.error("Failed to fetch providers", error);
      }
    };
    fetchProviders();
  }, []);

  // Calculate provider stats when selected
  useEffect(() => {
    const fetchStats = async () => {
      if (selectedProvider) {
        try {
          const allBookings = await api.getBookings();
          // Filter completed jobs for this provider
          if (Array.isArray(allBookings)) {
            const completedJobs = allBookings.filter(b => b.providerId === selectedProvider.id && b.status === BookingStatus.COMPLETED).length;
            setProviderStats({ jobs: completedJobs });
          }
        } catch (error) {
          console.error("Failed to fetch bookings for stats", error);
        }

        setShowProfileView(true);
        setBookingDate(''); // Reset booking form
        setBookingDesc('');
        setInitialMessage('');
        setAvailabilityError(null);
      } else {
        setShowProfileView(false);
      }
    };
    fetchStats();
  }, [selectedProvider]);

  const location = user?.location || DEFAULT_LOCATION;

  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Distance Filter
      if (provider.location) {
        const dist = calculateDistance(location, provider.location);
        if (dist > radius) return false;
      }
      // Text Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = provider.name.toLowerCase().includes(term);
        const matchesSkill = provider.skills?.some(s => s.toLowerCase().includes(term));
        return matchesName || matchesSkill;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        // Simplified rating mock
        const scoreA = (a.isVerified ? 10 : 0) + (a.totalEarnings || 0);
        const scoreB = (b.isVerified ? 10 : 0) + (b.totalEarnings || 0);
        return scoreB - scoreA;
      } else {
        // Sort by distance
        const distA = a.location ? calculateDistance(location, a.location) : Infinity;
        const distB = b.location ? calculateDistance(location, b.location) : Infinity;
        return distA - distB;
      }
    });
  }, [providers, location, radius, searchTerm, sortBy]);

  // Get availability helper (uses fallback if missing)
  const getProviderSchedule = () => selectedProvider?.availability || DEFAULT_DISPLAY_AVAILABILITY;

  // Validate Availability Logic
  const checkAvailability = (dateString: string): boolean => {
    if (!selectedProvider) return true;

    const schedule = getProviderSchedule();
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"
    const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }); // "14:30"

    const daySlot = schedule.find(s => s.day === dayName);

    if (!daySlot || !daySlot.enabled) {
      setAvailabilityError(`${selectedProvider.name} is not working on ${dayName}s.`);
      return false;
    }

    if (time < daySlot.startTime || time > daySlot.endTime) {
      setAvailabilityError(`${selectedProvider.name} only works between ${daySlot.startTime} and ${daySlot.endTime} on ${dayName}s.`);
      return false;
    }

    setAvailabilityError(null);
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingDate(e.target.value);
    if (e.target.value) {
      checkAvailability(e.target.value);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !user) return;

    // Final validation
    if (!checkAvailability(bookingDate)) {
      return;
    }

    try {
      const bookingPayload = {
        providerId: selectedProvider.id,
        scheduledDate: bookingDate,
        description: bookingDesc,
        price: selectedProvider.hourlyRate || 0,
        location: location
      };

      const createdBooking = await api.createBooking(bookingPayload);

      // Send initial message if present
      if (initialMessage.trim()) {
        await api.sendMessage(
          createdBooking.id,
          selectedProvider.id,
          initialMessage
        );
      }

      setIsBookingModalOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Booking creation failed", error);
      // alert("Failed to create booking. Please try again.");
      // Using toast if available or console for now, user said "Failed to create booking" popup appeared.
      // The alert is the popup.
      // Let's see the error details in console via browser if possible, but I can't see browser console.
      // I will try to surface the error message in the alert/toast if I can.
      alert(`Failed to create booking: ${error.message || "Unknown error"}`);
    }
  };

  const closeProfile = () => {
    setSelectedProvider(null);
    setShowProfileView(false);
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">

      {/* Sidebar - Conditional Rendering for List OR Profile */}
      <div className={`w-full md:w-[450px] flex flex-col bg-white border-r border-gray-200 shadow-xl z-20 ${viewMode === 'map' ? 'hidden md:flex' : 'flex h-full'}`}>

        {/* VIEW 1: SEARCH & LIST */}
        {!showProfileView ? (
          <>
            <div className="p-6 bg-white z-20 border-b border-gray-100">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Find Professionals</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services (e.g. Electrician, Tutor)..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none shadow-sm text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>Search Radius</span>
                    <span className="text-emerald-700">{radius} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                      className="bg-transparent text-xs font-bold text-slate-900 outline-none border-none focus:ring-0 p-0 cursor-pointer"
                    >
                      <option value="distance">Distance</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="md:hidden p-2 text-slate-600 hover:bg-white hover:shadow-md rounded-lg transition-all"
                  >
                    {viewMode === 'list' ? <MapIcon className="h-5 w-5" /> : <List className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center px-1 mb-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {filteredProviders.length} Providers Found
                </div>
              </div>

              {filteredProviders.map(provider => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`group relative bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-emerald-300 hover:shadow-md`}
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={provider.avatarUrl}
                        alt={provider.name}
                        className="w-14 h-14 rounded-lg object-cover shadow-sm bg-gray-100"
                      />
                      {provider.isVerified ? (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-100 border border-white rounded-full p-0.5 shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-blue-100 border border-white rounded-full px-1.5 py-0.5 shadow-sm">
                          <span className="text-[8px] font-bold text-blue-700 uppercase">New</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight truncate">{provider.name}</h3>
                          {provider.location ? (
                            <>
                              <MapPin className="h-3 w-3 mr-1" />
                              {calculateDistance(location, provider.location)} km away
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Remote / Unknown location</span>
                          )}
                        </div>
                        <div className="flex items-center bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          <Star className="h-3 w-3 text-amber-500 fill-current mr-1" />
                          <span className="text-xs font-bold text-amber-700">{provider.averageRating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {provider.skills?.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide bg-slate-100 text-slate-600 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-slate-900">${provider.hourlyRate}</span>
                      <span className="text-xs text-slate-500 font-medium">/hr</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 group-hover:underline">
                      View Profile
                    </span>
                  </div>
                </div>
              ))}
              {filteredProviders.length === 0 && (
                <div className="text-center py-12 px-6">
                  <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                    <Search className="h-6 w-6 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">No matches found</h3>
                  <p className="text-slate-500 text-sm mt-1 mb-4">Try expanding your search radius or changing your search terms.</p>
                  <button
                    onClick={() => setRadius(500)}
                    className="text-emerald-600 font-bold text-sm hover:underline"
                  >
                    Search Statewide (500km)
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* VIEW 2: PROVIDER PROFILE */
          selectedProvider && (
            <div className="flex flex-col h-full bg-white animate-in slide-in-from-left-4 duration-300">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <button onClick={closeProfile} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <ChevronLeft className="h-6 w-6 text-slate-600" />
                </button>
                <span className="font-bold text-slate-800">Provider Profile</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img src={selectedProvider.avatarUrl} className="w-24 h-24 rounded-2xl object-cover shadow-lg bg-gray-100" />
                    {selectedProvider.isVerified && (
                      <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
                        <ShieldCheck className="h-6 w-6 text-emerald-500 fill-white" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{selectedProvider.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedProvider.skills?.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-6">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900">${selectedProvider.hourlyRate}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Hourly Rate</p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <div className="flex items-center justify-center gap-1 text-slate-900">
                      <span className="text-2xl font-extrabold">4.9</span>
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Rating</p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-2xl font-extrabold text-slate-900">{providerStats.jobs}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Jobs Done</p>
                  </div>
                </div>

                {/* Weekly Availability Display */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" /> Availability
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-2">
                      {getProviderSchedule().map((slot) => (
                        <div key={slot.day} className="flex justify-between items-center text-sm">
                          <span className={`font-bold w-12 ${slot.enabled ? 'text-slate-800' : 'text-slate-400'}`}>{slot.day}</span>
                          {slot.enabled ? (
                            <span className="text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded text-xs">{slot.startTime} - {slot.endTime}</span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unavailable</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {selectedProvider.bio || "No bio available for this provider."}
                  </p>
                </div>

                {/* Portfolio */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    Past Projects
                  </h3>
                  {selectedProvider.portfolio && selectedProvider.portfolio.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProvider.portfolio.map(item => (
                        <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-bold truncate w-full">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
                      <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No portfolio items uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-600 hover:shadow-emerald-200 transition-all flex justify-center items-center gap-2 active:scale-95"
                >
                  Book Service <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )
        )}

      </div>

      {/* Map View */}
      <div className={`flex-1 relative ${viewMode === 'list' ? 'hidden md:block' : 'block h-full'}`}>
        <MapComponent
          center={location}
          providers={filteredProviders}
          currentUserLocation={location}
          onSelectProvider={(p) => setSelectedProvider(p)}
          selectedProviderId={selectedProvider?.id}
        />

        {/* Floating Toggle on Map for Mobile */}
        <button
          onClick={() => {
            if (showProfileView) {
              closeProfile();
            } else {
              setViewMode('list');
            }
          }}
          className="absolute top-4 left-4 md:hidden z-[1000] bg-white p-3 rounded-full shadow-lg border border-gray-100 text-slate-700"
        >
          {showProfileView ? <ChevronLeft className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </button>

        {/* Mobile Floating Action Card - ONLY if profile is NOT open in sidebar (sidebar logic handles mobile visibility usually, but here we might want a quick peek) */}
        {selectedProvider && !showProfileView && viewMode === 'map' && (
          <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-200 md:hidden z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <img src={selectedProvider.avatarUrl} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{selectedProvider.name}</h4>
                <p className="text-sm text-slate-500">
                  ${selectedProvider.hourlyRate}/hr
                  {selectedProvider.location && ` • ${calculateDistance(location, selectedProvider.location)} km away`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowProfileView(true);
                setViewMode('list'); // Switch to list view container which holds the profile
              }}
              className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold shadow-md hover:bg-emerald-700"
            >
              View Full Profile
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">Request Service</h2>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl mb-6 border border-emerald-100">
                <img src={selectedProvider.avatarUrl} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-0.5">Booking with</p>
                  <p className="font-bold text-slate-900 text-lg">{selectedProvider.name}</p>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date & Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="datetime-local"
                      required
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium ${availabilityError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                      value={bookingDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  {availabilityError && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-1">
                      <AlertCircle size={16} />
                      {availabilityError}
                    </div>
                  )}
                  {/* Show available slots hint */}
                  {!availabilityError && (
                    <p className="text-xs text-slate-500 mt-2 ml-1">
                      Available: {getProviderSchedule().filter(d => d.enabled).map(d => d.day).join(', ')} ({getProviderSchedule()[0].startTime} - {getProviderSchedule()[0].endTime})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description of Work</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none shadow-sm transition-all"
                    placeholder="Describe the issue in detail..."
                    value={bookingDesc}
                    onChange={(e) => setBookingDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-500" /> Message to Provider (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none shadow-sm transition-all"
                    placeholder="Any specific instructions or questions?..."
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!!availabilityError}
                    className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold shadow-lg hover:bg-emerald-600 hover:shadow-emerald-200 transition-all flex justify-center items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Send Request <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};