import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, BookingStatus, UserRole, User } from '../types';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, Loader2, ShieldAlert, Check, X, Users, Briefcase, Trash2 } from 'lucide-react';
import { calculateDistance } from '../services/geo';
import { SeekerDashboard } from './seeker/SeekerDashboard';
import { ProviderDashboard } from './provider/ProviderDashboard';
import { toast } from 'react-hot-toast';

export const DashboardPage = () => {
    const { user } = useAuth();

    if (user?.role === UserRole.SEEKER) {
        return <SeekerDashboard />;
    }

    if (user?.role === UserRole.PROVIDER) {
        return <ProviderDashboard />;
    }

    // Fallback for Admin
    return <UnifiedDashboard />;
};

const UnifiedDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'verifications' | 'providers' | 'seekers'>('verifications');
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);
    const [allProviders, setAllProviders] = useState<User[]>([]);
    const [allSeekers, setAllSeekers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            if (user?.role === UserRole.ADMIN) {
                // Fetch all users
                const users = await api.getUsers();

                setPendingVerifications(users.filter(u => u.role === UserRole.PROVIDER && !u.isVerified && u.verificationStatus === 'PENDING'));
                setAllProviders(users.filter(u => u.role === UserRole.PROVIDER));
                setAllSeekers(users.filter(u => u.role === UserRole.SEEKER));
            }
        } catch (err) {
            console.error("Failed to load admin data", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [user]);

    const handleVerification = async (id: string, approved: boolean) => {
        try {
            await api.verifyProvider(id, approved);
            toast.success(approved ? "Provider approved successfully" : "Provider rejected");
            refreshData();
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Failed to update verification status");
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.deleteUser(id);
                toast.success("User deleted successfully");
                refreshData();
            } catch (error) {
                console.error("Delete failed", error);
                toast.error("Failed to delete user");
            }
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Admin Console
                    </h1>
                    <p className="mt-2 text-slate-500">
                        System Overview & User Management
                    </p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button
                        onClick={() => setActiveTab('verifications')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'verifications' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}
                    >
                        Verifications
                    </button>
                    <button
                        onClick={() => setActiveTab('providers')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'providers' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}
                    >
                        Providers
                    </button>
                    <button
                        onClick={() => setActiveTab('seekers')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'seekers' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}
                    >
                        Seekers
                    </button>
                </div>
            </div>

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-emerald-600" />
                        Pending Verifications
                    </h2>
                    {pendingVerifications.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
                            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                            <p className="text-slate-900 font-bold text-lg">All caught up!</p>
                            <p className="text-slate-500 text-sm">No pending provider verifications.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pendingVerifications.map(provider => (
                                <div key={provider.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <img src={provider.avatarUrl} alt="" className="w-16 h-16 rounded-xl bg-gray-100 object-cover" />
                                            <div>
                                                <h3 className="font-bold text-slate-900">{provider.name}</h3>
                                                <p className="text-sm text-slate-500 truncate max-w-[150px]">{provider.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                                                <span className="font-bold block mb-1 text-xs uppercase text-slate-400">Bio</span>
                                                <p className="line-clamp-3">{provider.bio}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {provider.skills?.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-white border border-gray-200 text-slate-600 text-[10px] uppercase font-bold rounded">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleVerification(provider.id, false)}
                                                className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-600 text-sm font-bold transition-colors"
                                            >
                                                <X className="h-4 w-4" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleVerification(provider.id, true)}
                                                className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 rounded-lg hover:bg-emerald-600 text-white text-sm font-bold shadow-sm transition-colors"
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PROVIDERS TAB */}
            {activeTab === 'providers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                        All Providers ({allProviders.length})
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Earnings</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {allProviders.map(provider => (
                                        <tr key={provider.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded-lg object-cover" src={provider.avatarUrl} alt="" />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-slate-900">{provider.name}</div>
                                                        <div className="text-sm text-slate-500">{provider.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                                ${provider.isVerified
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : provider.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {provider.verificationStatus || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                ${provider.totalEarnings || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(provider.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteUser(provider.id)} className="text-red-600 hover:text-red-900" title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SEEKERS TAB */}
            {activeTab === 'seekers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        All Seekers ({allSeekers.length})
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {allSeekers.map(seeker => (
                                        <tr key={seeker.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img className="h-10 w-10 rounded-lg object-cover" src={seeker.avatarUrl} alt="" />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-slate-900">{seeker.name}</div>
                                                        <div className="text-sm text-slate-500">{seeker.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {seeker.location?.address || `${seeker.location?.lat.toFixed(2)}, ${seeker.location?.lng.toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(seeker.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteUser(seeker.id)} className="text-red-600 hover:text-red-900" title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};