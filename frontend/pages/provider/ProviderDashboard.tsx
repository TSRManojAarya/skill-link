import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, BookingStatus, Availability, PortfolioItem, User } from '../../types';
import {
    LayoutDashboard, Calendar as CalendarIcon, DollarSign, User as UserIcon,
    CheckCircle, XCircle, Clock, MapPin, MessageCircle, AlertTriangle,
    Plus, Trash2, Upload, Briefcase, Star, ChevronRight, Edit3, Save, Loader2, Image as ImageIcon,
    MoreHorizontal, Check, Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDistance } from '../../services/geo';

// --- MAIN DASHBOARD CONTAINER ---

export const ProviderDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'earnings' | 'profile'>('overview');

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10 flex flex-col justify-between">
                <div>
                    <div className="p-6 hidden md:block border-b border-gray-100">
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Provider Portal</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Manage your business</p>
                    </div>
                    <nav className="flex md:flex-col gap-1 p-2 md:p-4 overflow-x-auto md:overflow-visible scrollbar-hide">
                        <NavButton
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                            icon={<LayoutDashboard size={18} />}
                            label="Overview"
                        />
                        <NavButton
                            active={activeTab === 'schedule'}
                            onClick={() => setActiveTab('schedule')}
                            icon={<CalendarIcon size={18} />}
                            label="Schedule"
                        />
                        <NavButton
                            active={activeTab === 'earnings'}
                            onClick={() => setActiveTab('earnings')}
                            icon={<DollarSign size={18} />}
                            label="Earnings"
                        />
                        <NavButton
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            icon={<UserIcon size={18} />}
                            label="Profile"
                        />
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 hidden md:block">
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                        <Settings size={18} />
                        <span>Settings</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'schedule' && <ScheduleTab />}
                    {activeTab === 'earnings' && <EarningsTab />}
                    {activeTab === 'profile' && <ProfileTab />}
                </div>
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all w-full md:w-auto whitespace-nowrap md:whitespace-normal
            ${active
                ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <span className={active ? 'text-emerald-600' : 'text-slate-400'}>{icon}</span>
        <span>{label}</span>
        {active && <ChevronRight size={16} className="ml-auto hidden md:block opacity-50" />}
    </button>
);

// --- TAB COMPONENTS ---

const OverviewTab = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const all = await api.getBookings();
            if (Array.isArray(all)) {
                setBookings(all.filter(b => b.providerId === user.id).reverse());
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [user]);

    const handleAction = async (id: string, status: BookingStatus) => {
        try {
            await api.updateBookingStatus(id, status);
            refreshData();
        } catch (err) {
            console.error("Failed to update booking", err);
        }
    };

    const pending = bookings.filter(b => b.status === BookingStatus.PENDING);
    const active = bookings.filter(b => [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(b.status));

    // Completion calculation
    const profileCompletion = [
        user?.bio,
        user?.skills?.length,
        user?.portfolio?.length,
        user?.isVerified
    ].filter(Boolean).length / 4 * 100;

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Here's what's happening today.</p>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Earnings" value={`$${user?.totalEarnings || 0}`} icon={<DollarSign className="text-emerald-600" />} color="bg-emerald-50 border-emerald-100" />
                <StatCard label="Active Jobs" value={active.length.toString()} icon={<Briefcase className="text-blue-600" />} color="bg-blue-50 border-blue-100" />
                <StatCard label="Pending" value={pending.length.toString()} icon={<AlertTriangle className="text-amber-500" />} color="bg-amber-50 border-amber-100" />
                <StatCard label="Rating" value="4.9" icon={<Star className="text-yellow-400 fill-current" />} color="bg-yellow-50 border-yellow-100" />
            </div>

            {/* Profile Alert */}
            {profileCompletion < 100 && (
                <div className="bg-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <AlertTriangle size={18} className="text-emerald-400" />
                                Complete your profile
                            </h4>
                            <p className="text-slate-300 text-sm mt-1 max-w-lg">
                                You are {profileCompletion}% of the way there. Adding portfolio items and verifying your ID increases trust and gets you more jobs.
                            </p>
                        </div>
                        <div className="w-full sm:w-auto min-w-[150px]">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${profileCompletion}%` }}></div>
                            </div>
                            <p className="text-right text-xs mt-2 font-bold text-emerald-400">{profileCompletion}% Completed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Lists */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">{pending.length}</span>
                        Action Required
                    </h3>
                    {pending.length === 0 ? (
                        <div className="text-slate-400 text-sm font-medium bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                            No pending requests.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pending.map(b => (
                                <BookingCard key={b.id} booking={b} onAction={handleAction} />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">{active.length}</span>
                        Active Jobs
                    </h3>
                    {active.length === 0 ? (
                        <div className="text-slate-400 text-sm font-medium bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                            No active jobs right now.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {active.map(b => (
                                <BookingCard key={b.id} booking={b} onAction={handleAction} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScheduleTab = () => {
    const { user, updateUserProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [availability, setAvailability] = useState<Availability[]>(
        user?.availability || [
            { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' },
            { day: 'Sat', enabled: false, startTime: '10:00', endTime: '14:00' },
            { day: 'Sun', enabled: false, startTime: '10:00', endTime: '14:00' },
        ]
    );

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updatedUser = { ...user, availability };
            await updateUserProfile(updatedUser);
            toast.success('Schedule saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save schedule.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDay = (index: number) => {
        const newAvail = [...availability];
        newAvail[index].enabled = !newAvail[index].enabled;
        setAvailability(newAvail);
    };

    const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const newAvail = [...availability];
        newAvail[index] = { ...newAvail[index], [field]: value };
        setAvailability(newAvail);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Weekly Availability</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage when you can accept new jobs.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
            <div className="divide-y divide-gray-100">
                {availability.map((slot, index) => (
                    <div key={slot.day} className={`p-4 flex items-center justify-between transition-colors ${!slot.enabled ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                        <div className="flex items-center gap-4 w-32">
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                <input
                                    type="checkbox"
                                    name={`toggle-${index}`}
                                    id={`toggle-${index}`}
                                    checked={slot.enabled}
                                    onChange={() => toggleDay(index)}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer shadow-sm transform transition-transform duration-300"
                                    style={{
                                        right: slot.enabled ? '0' : 'auto',
                                        left: slot.enabled ? 'auto' : '0',
                                        borderColor: 'transparent'
                                    }}
                                />
                                <label htmlFor={`toggle-${index}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${slot.enabled ? 'bg-emerald-600' : 'bg-gray-300'}`}></label>
                            </div>
                            <span className={`font-bold text-sm ${slot.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{slot.day}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="time"
                                value={slot.startTime}
                                disabled={!slot.enabled}
                                onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm font-medium bg-white disabled:bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
                            />
                            <span className="text-slate-300 font-bold text-xs">TO</span>
                            <input
                                type="time"
                                value={slot.endTime}
                                disabled={!slot.enabled}
                                onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm font-medium bg-white disabled:bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EarningsTab = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<Booking[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                try {
                    const all = await api.getBookings();
                    setHistory(all.filter(b => b.providerId === user.id && b.status === BookingStatus.COMPLETED));
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchHistory();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Earnings</h2>
                        <div className="text-5xl font-extrabold tracking-tight text-white">${user?.totalEarnings || 0}</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                        <DollarSign className="text-emerald-500 h-8 w-8" />
                    </div>
                </div>
                <div className="mt-8 flex gap-4 text-sm">
                    <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                        <span className="block text-xs text-slate-400 mb-0.5">Jobs Completed</span>
                        <span className="font-bold">{history.length}</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                        <span className="block text-xs text-slate-400 mb-0.5">Average / Job</span>
                        <span className="font-bold">${(user?.totalEarnings && history.length) ? (user.totalEarnings / history.length).toFixed(0) : 0}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 font-medium">No earnings history yet.</td>
                                </tr>
                            ) : (
                                history.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {new Date(job.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            {job.description.substring(0, 30)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-[10px] uppercase font-bold tracking-wide rounded bg-emerald-100 text-emerald-800">
                                                Paid
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-bold">
                                            +${job.price}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ProfileTab = () => {
    const { user, updateUserProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        hourlyRate: user?.hourlyRate || 0,
        serviceRadius: user?.serviceRadius || 10,
        skills: user?.skills?.join(', ') || ''
    });
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(user?.portfolio || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const updatedUser: User = {
                ...user,
                ...formData,
                hourlyRate: Number(formData.hourlyRate),
                serviceRadius: Number(formData.serviceRadius),
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                portfolio
            };
            await updateUserProfile(updatedUser);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem: PortfolioItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    imageUrl: reader.result as string,
                    description: 'Uploaded Project'
                };
                setPortfolio([...portfolio, newItem]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePortfolioItem = (id: string) => {
        setPortfolio(portfolio.filter(p => p.id !== id));
    };

    const updatePortfolioDescription = (id: string, desc: string) => {
        setPortfolio(portfolio.map(p => p.id === id ? { ...p, description: desc } : p));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-100 pb-4">Personal Details</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Rate ($)</label>
                            <input
                                type="number"
                                name="hourlyRate"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
                        <textarea
                            name="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Skills (comma separated)</label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="Plumbing, Electrical, Repairs..."
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">Service Radius</label>
                            <span className="text-sm font-bold text-emerald-700">{formData.serviceRadius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            name="serviceRadius"
                            value={formData.serviceRadius}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-slate-900">Portfolio Gallery</h3>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Photo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {portfolio.map(item => (
                        <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                <button
                                    onClick={() => removePortfolioItem(item.id)}
                                    className="absolute top-3 right-3 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="p-3 bg-white border-t border-gray-100">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updatePortfolioDescription(item.id, e.target.value)}
                                    className="w-full text-xs font-bold text-slate-700 border-none focus:ring-0 outline-none bg-transparent placeholder-slate-400"
                                    placeholder="Add description..."
                                />
                            </div>
                        </div>
                    ))}
                    {portfolio.length === 0 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="col-span-full border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all group"
                        >
                            <div className="bg-slate-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform border border-slate-200">
                                <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">Upload photos</p>
                            <p className="text-xs text-slate-500 mt-1">Showcase your best work</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end sticky bottom-6">
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
    <div className={`bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all hover:shadow-md ${color.includes('border') ? color.split(' ').find(c => c.startsWith('border')) : 'border-gray-200'}`}>
        <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-white border border-gray-100 shadow-sm`}>{icon}</div>
    </div>
);

const BookingCard: React.FC<{ booking: Booking, onAction: (id: string, status: BookingStatus) => void }> = ({ booking, onAction }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group hover:border-emerald-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">Service Request</h4>
                        <p className="text-sm text-slate-500 font-medium">
                            {new Date(booking.scheduledDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-extrabold text-slate-900 text-xl">${booking.price}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated</div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 mb-5 border border-slate-100 font-medium italic">
                "{booking.description}"
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                {booking.status === BookingStatus.PENDING && (
                    <>
                        <button
                            onClick={() => onAction(booking.id, BookingStatus.REJECTED)}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => onAction(booking.id, BookingStatus.ACCEPTED)}
                            className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg shadow-sm transition-colors"
                        >
                            Accept Job
                        </button>
                    </>
                )}
                {booking.status === BookingStatus.ACCEPTED && (
                    <>
                        <button
                            onClick={() => navigate(`/messages?bookingId=${booking.id}&recipient=${booking.seekerId}`)}
                            className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg border border-gray-200 flex items-center gap-2 transition-colors"
                        >
                            <MessageCircle size={16} /> Chat
                        </button>
                        <button
                            onClick={() => onAction(booking.id, BookingStatus.IN_PROGRESS)}
                            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                        >
                            Start Job
                        </button>
                    </>
                )}
                {booking.status === BookingStatus.IN_PROGRESS && (
                    <button
                        onClick={() => onAction(booking.id, BookingStatus.COMPLETED)}
                        className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <CheckCircle size={16} /> Mark Complete
                    </button>
                )}
            </div>
        </div>
    );
};