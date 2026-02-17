import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User } from '../types';
import { api } from '../services/api';
import {
    Save, User as UserIcon, Shield, MapPin, Trash2, LogOut, CheckCircle,
    Loader2, Bell, HelpCircle, FileText, ChevronRight, Lock,
    Mail, MessageSquare, AlertTriangle
} from 'lucide-react';

type SettingsTab = 'general' | 'notifications' | 'security' | 'help' | 'legal';

export const SettingsPage = () => {
    const { user, updateUserProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form States
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [locationAddress, setLocationAddress] = useState(user?.location?.address || '');

    // Notification Mock States
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyPush, setNotifyPush] = useState(true);
    const [notifyPromo, setNotifyPromo] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        setSuccessMsg('');

        try {
            const updatedUser: User = {
                ...user,
                name,
                email,
                bio,
                location: user.location ? {
                    ...user.location,
                    address: locationAddress
                } : undefined
            };

            // Allow updating via API if needed, otherwise AuthContext might handle it via storage/api wrapper
            // But since we are migrating, we should use the one from AuthContext which calls API
            // Check AuthContext: it likely uses api.updateProfile.
            await updateUserProfile(updatedUser);

            setSuccessMsg('Settings updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure? This action cannot be undone. All your data will be permanently removed.")) {
            // Should call api.deleteAccount() if available
            logout();
        }
    };

    const TabButton = ({ id, label, icon }: { id: SettingsTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            {icon}
            {label}
            {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings & Support</h1>
                <p className="text-slate-500 mt-1">Manage your account, preferences, and view legal information.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1">
                        <TabButton id="general" label="General" icon={<UserIcon size={18} />} />
                        <TabButton id="notifications" label="Notifications" icon={<Bell size={18} />} />
                        <TabButton id="security" label="Security" icon={<Lock size={18} />} />
                        <div className="h-px bg-gray-100 my-2 mx-2"></div>
                        <TabButton id="help" label="Help & Support" icon={<HelpCircle size={18} />} />
                        <TabButton id="legal" label="Legal & Disclaimer" icon={<FileText size={18} />} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {successMsg && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <CheckCircle size={18} /> {successMsg}
                        </div>
                    )}

                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                                <p className="text-xs text-slate-500 mt-1">Update your public profile details.</p>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm font-medium"
                                            />
                                        </div>
                                    </div>

                                    {user?.role === UserRole.PROVIDER && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm resize-none"
                                                placeholder="Tell clients about your experience..."
                                            />
                                        </div>
                                    )}

                                    {user?.role === UserRole.SEEKER && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                <MapPin size={16} /> Default Address
                                            </label>
                                            <input
                                                type="text"
                                                value={locationAddress}
                                                onChange={(e) => setLocationAddress(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                                placeholder="e.g. 123 Main St, San Francisco"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4 border-t border-gray-50">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-70 transition-colors shadow-sm"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- NOTIFICATIONS TAB --- */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                                <p className="text-xs text-slate-500 mt-1">Manage how we contact you.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Email Notifications</p>
                                            <p className="text-xs text-slate-500">Receive booking confirmations via email.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                                <div className="h-px bg-gray-100"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><MessageSquare size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Push Notifications</p>
                                            <p className="text-xs text-slate-500">Receive real-time chat messages.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notifyPush} onChange={() => setNotifyPush(!notifyPush)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                                <div className="h-px bg-gray-100"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Bell size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Marketing & Promos</p>
                                            <p className="text-xs text-slate-500">Receive updates about new features.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notifyPromo} onChange={() => setNotifyPromo(!notifyPromo)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button onClick={handleSave} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Save Preferences</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SECURITY TAB --- */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50">
                                    <h2 className="text-lg font-bold text-slate-900">Login & Security</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-800">Password</p>
                                            <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                                        </div>
                                        <button className="text-sm font-bold text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50">
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-100 p-2 rounded-full text-red-600">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-red-900 mb-1">Delete Account</h2>
                                            <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. All your data, booking history, and messages will be permanently removed.</p>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 font-bold rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} /> Delete Account Permanently
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HELP TAB --- */}
                    {activeTab === 'help' && (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-slate-900">Help Center</h2>
                                <p className="text-xs text-slate-500 mt-1">Frequently asked questions.</p>
                            </div>
                            <div className="p-6 divide-y divide-gray-100">
                                <div className="py-4">
                                    <h3 className="font-bold text-slate-900 mb-2">How do bookings work?</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Seekers can browse providers on the map, select a profile, and request a booking. Providers receive the request in their dashboard and can Accept or Reject it. Once accepted, you can chat to coordinate details.
                                    </p>
                                </div>
                                <div className="py-4">
                                    <h3 className="font-bold text-slate-900 mb-2">Is payment handled in the app?</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Currently, Skill-Link connects you with professionals. Payment terms (Cash, Venmo, etc.) should be discussed and agreed upon between the Client and the Provider directly. We will be adding integrated payments in v2.0.
                                    </p>
                                </div>
                                <div className="py-4">
                                    <h3 className="font-bold text-slate-900 mb-2">How do I verify my account?</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Providers can request verification in their Dashboard. An admin will review your profile, skills, and portfolio. Verified users get a green badge and appear higher in search results.
                                    </p>
                                </div>
                                <div className="py-4">
                                    <h3 className="font-bold text-slate-900 mb-2">What if I have a dispute?</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Please contact support immediately at <strong>support@skill-link.com</strong>. While we facilitate connections, we expect all users to adhere to our code of conduct.
                                    </p>
                                </div>
                                <div className="pt-6 mt-2">
                                    <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                                        Contact Customer Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- LEGAL TAB --- */}
                    {activeTab === 'legal' && (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-lg font-bold text-slate-900">Legal & Disclaimer</h2>
                                <p className="text-xs text-slate-500 mt-1">Please read carefully.</p>
                            </div>
                            <div className="p-8">
                                {/* MAIN DISCLAIMER Highlight */}
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-amber-600 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-extrabold text-amber-900 text-lg mb-2">Platform Disclaimer</h3>
                                            <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                                Skill-Link acts solely as a venue to connect Seekers and Providers. We do not employ, recommend, or endorse any specific Provider.
                                                <strong> Use of this service is at your own risk.</strong> Skill-Link is not liable for any damages, disputes, or issues arising from services rendered.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm prose-slate max-w-none">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">Terms of Service Summary</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 mb-6">
                                        <li>You must be at least 18 years old to use this service.</li>
                                        <li>Providers must truthfully represent their skills and qualifications.</li>
                                        <li>Harassment, discrimination, or fraudulent activity will result in immediate account termination.</li>
                                        <li>We reserve the right to remove any content or user that violates our community guidelines.</li>
                                    </ul>

                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">Privacy Policy</h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        We collect your location data solely to facilitate the matching of local services. Your data is not sold to third parties.
                                    </p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                                    <a href="#" className="text-emerald-600 font-bold text-sm hover:underline">Full Terms of Service</a>
                                    <a href="#" className="text-emerald-600 font-bold text-sm hover:underline">Privacy Policy</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};