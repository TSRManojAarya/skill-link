import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, BookingStatus, User } from '../../types';
import { Calendar, Clock, MapPin, MessageCircle, Search, Check, ArrowRight, CreditCard, Activity, Briefcase, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SeekerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const [activeTab, setActiveTab] = useState<'tracker' | 'history' | 'cancelled'>('tracker');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [providers, setProviders] = useState<User[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const [allBookings, allProviders] = await Promise.all([
                        api.getBookings(),
                        api.getProviders()
                    ]);
                    // Filter by user ID if API returns all
                    if (Array.isArray(allBookings)) {
                        setBookings(allBookings.filter(b => b.seekerId === user.id));
                    }
                    if (Array.isArray(allProviders)) {
                        setProviders(allProviders);
                    }
                } catch (err) {
                    console.error("Failed to fetch dashboard data", err);
                }
            }
        };
        fetchData();
    }, [user]);

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'tracker') return [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(b.status);
        if (activeTab === 'history') return b.status === BookingStatus.COMPLETED;
        if (activeTab === 'cancelled') return [BookingStatus.CANCELLED, BookingStatus.REJECTED].includes(b.status);
        return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleCancel = async (bookingId: string) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await api.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
                const allBookings = await api.getBookings();
                setBookings(allBookings.filter(b => b.seekerId === user!.id));
            } catch (err) {
                console.error("Failed to cancel booking", err);
            }
        }
    };

    const getProvider = (id: string) => providers.find(p => p.id === id);

    const openReviewModal = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setRating(5);
        setComment('');
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = async () => {
        if (!selectedBookingId) return;
        try {
            await api.createReview({
                bookingId: selectedBookingId,
                rating,
                comment
            });
            setIsReviewModalOpen(false);
            alert('Review submitted successfully!');
            // Optionally refresh bookings or providers if needed
        } catch (error) {
            console.error(error);
            alert('Failed to submit review');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your projects and payments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/settings"
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </Link>
                        <div className="hidden md:block">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                Account Active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Widget 1: Spending */}
                    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                <CreditCard size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
                            </div>
                            <p className="text-4xl font-extrabold tracking-tight mb-2">$450.00</p>
                            <p className="text-xs text-emerald-400 font-medium">+12% from last month</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <CreditCard size={120} />
                        </div>
                    </div>

                    {/* Widget 2: Active Projects */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Requests</span>
                                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-700"><Activity size={18} /></div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-4xl font-extrabold text-slate-900">{bookings.filter(b => [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(b.status)).length}</p>
                                <span className="text-sm text-slate-500 font-bold">Projects</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    {/* Widget 3: CTA */}
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex flex-col justify-center items-start">
                        <div className="flex items-center gap-2 mb-2 text-emerald-800">
                            <Briefcase size={18} />
                            <span className="font-bold text-lg">New Project?</span>
                        </div>
                        <p className="text-sm text-emerald-700/80 mb-5 font-medium leading-relaxed">
                            Browse top-rated professionals in your area for your next task.
                        </p>
                        <Link to="/search" className="w-full">
                            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-emerald-200">
                                Find Service <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Project Timeline</h2>

                {/* Modern Tabs */}
                <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex shadow-sm">
                    {['tracker', 'history', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Booking List */}
            <div className="space-y-6">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Calendar className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">No projects found</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto font-medium">You don't have any {activeTab === 'tracker' ? 'active' : activeTab} projects right now.</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        activeTab === 'tracker' ? (
                            <TrackerCard key={booking.id} booking={booking} provider={getProvider(booking.providerId)} onCancel={() => handleCancel(booking.id)} />
                        ) : (
                            <HistoryCard
                                key={booking.id}
                                booking={booking}
                                provider={getProvider(booking.providerId)}
                                onRate={() => openReviewModal(booking.id)}
                            />
                        )
                    ))
                )}
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md m-4 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Rate Provider</h3>
                        <div className="flex gap-2 mb-4 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
                                >
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                            rows={4}
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TrackerCard: React.FC<{ booking: Booking; provider?: User; onCancel: () => void }> = ({ booking, provider, onCancel }) => {
    const navigate = useNavigate();

    // Calculate progress step
    let step = 1;
    if (booking.status === BookingStatus.ACCEPTED) step = 2;
    if (booking.status === BookingStatus.IN_PROGRESS) step = 3;
    if (booking.status === BookingStatus.COMPLETED) step = 4;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex gap-4">
                        <img
                            src={provider?.avatarUrl}
                            alt={provider?.name}
                            className="w-14 h-14 rounded-lg object-cover shadow-sm bg-gray-100"
                        />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-900 text-lg">{provider?.name || 'Unknown Provider'}</h4>
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                                <Clock size={14} className="text-emerald-600" />
                                {new Date(booking.scheduledDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Est. Total</p>
                        <p className="font-extrabold text-slate-900 text-2xl">${booking.price}</p>
                    </div>
                </div>

                {/* Modern Progress Tracker - High Contrast */}
                <div className="mb-8 relative px-2">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    {/* Active Line */}
                    <div className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-700 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                    <div className="relative z-10 flex justify-between">
                        <StepIndicator step={1} current={step} label="Requested" icon={<CreditCard size={14} />} />
                        <StepIndicator step={2} current={step} label="Accepted" icon={<Check size={14} />} />
                        <StepIndicator step={3} current={step} label="In Progress" icon={<Activity size={14} />} />
                    </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-lg text-sm text-slate-700 mb-6 border border-slate-100 font-medium">
                    "{booking.description}"
                </div>

                <div className="flex flex-wrap gap-3 justify-end border-t border-gray-100 pt-5">
                    <button
                        onClick={() => navigate(`/messages?bookingId=${booking.id}&recipient=${provider?.id}`)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-slate-900 transition-all"
                    >
                        <MessageCircle className="h-4 w-4" /> Message
                    </button>

                    {booking.status === BookingStatus.PENDING && (
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-transparent rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Cancel Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const StepIndicator = ({ step, current, label, icon }: { step: number, current: number, label: string, icon: React.ReactNode }) => {
    const isCompleted = current > step;
    const isActive = current === step;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 
                ${isCompleted || isActive
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-300'}
            `}>
                {isCompleted ? <Check size={14} /> : (isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <span className="text-[10px] font-bold">{step}</span>)}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive || isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );
};

const HistoryCard: React.FC<{ booking: Booking; provider?: User; onRate?: () => void }> = ({ booking, provider, onRate }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 transition-all flex justify-between items-center group">
            <div className="flex items-center gap-4">
                <img src={provider?.avatarUrl} className="w-12 h-12 rounded-lg bg-gray-100 grayscale group-hover:grayscale-0 transition-all" />
                <div>
                    <h4 className="font-bold text-slate-900">{provider?.name || 'Unknown'}</h4>
                    <p className="text-xs text-slate-500 font-medium">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
                <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1
                        ${booking.status === BookingStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {booking.status}
                    </span>
                    <p className="font-bold text-slate-900">${booking.price}</p>
                </div>
                {booking.status === BookingStatus.COMPLETED && onRate && (
                    <button
                        onClick={onRate}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-100 hover:bg-amber-100 transition-colors"
                    >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        Rate Provider
                    </button>
                )}
            </div>
        </div>
    );
};