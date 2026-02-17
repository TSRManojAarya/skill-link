import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Message, User } from '../types';
import { Send, ArrowLeft, MoreVertical, Image as ImageIcon, MessageCircle } from 'lucide-react';

export const MessagesPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialRecipientId = searchParams.get('recipient');

    const [activeRecipientId, setActiveRecipientId] = useState<string | null>(initialRecipientId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations and initial messages
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;
            try {
                // In a real app, we'd have an endpoint like /api/conversations
                // For now, we'll fetch all messages and bookings to derive conversations
                // This is inefficient but works for migration
                const [allMsgs, bookings] = await Promise.all([
                    api.getMessages(),
                    api.getBookings()
                ]);

                const contactIds = new Set<string>();
                allMsgs.forEach(m => contactIds.add(m.senderId === user.id ? m.receiverId : m.senderId));
                bookings.filter(b => b.seekerId === user.id || b.providerId === user.id)
                    .forEach(b => contactIds.add(user.role === 'SEEKER' ? b.providerId : b.seekerId));

                const contacts = await Promise.all(
                    Array.from(contactIds).map(id => api.getUserById(id))
                );

                setConversations(contacts.filter((u): u is User => !!u));

                // If no active recipient but we have contacts, select first
                if (!activeRecipientId && contacts.length > 0 && contacts[0]) {
                    setActiveRecipientId(contacts[0].id);
                }
            } catch (err) {
                console.error("Failed to load conversations", err);
            }
        };
        fetchConversations();
    }, [user, activeRecipientId]); // Check dependencies needed

    // "Realtime" polling for active conversation
    useEffect(() => {
        if (user && activeRecipientId) {
            const fetchMessages = async () => {
                try {
                    const msgs = await api.getMessages();
                    const filtered = msgs.filter(
                        m => (m.senderId === user.id && m.receiverId === activeRecipientId) ||
                            (m.senderId === activeRecipientId && m.receiverId === user.id)
                    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    setMessages(filtered);
                } catch (err) {
                    console.error("Poll failed", err);
                }
            };

            const interval = setInterval(fetchMessages, 2000); // Poll every 2s
            fetchMessages(); // Initial fetch
            return () => clearInterval(interval);
        }
    }, [user, activeRecipientId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !activeRecipientId) return;

        try {
            const sentMsg = await api.sendMessage(undefined, activeRecipientId, newMessage);
            setNewMessage('');
            setMessages(prev => [...prev, sentMsg]);
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    const activeUser = conversations.find(c => c.id === activeRecipientId);

    return (
        <div className="h-[calc(100vh-64px)] flex bg-gray-100 overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${activeRecipientId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm mt-4">No conversations yet.</div>
                    ) : (
                        conversations.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setActiveRecipientId(contact.id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeRecipientId === contact.id ? 'bg-indigo-50 border-indigo-100' : ''}`}
                            >
                                <div className="relative">
                                    <img src={contact.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">Click to chat</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-white ${!activeRecipientId ? 'hidden md:flex' : 'flex'}`}>
                {!activeRecipientId ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveRecipientId(null)} className="md:hidden p-1 -ml-2 text-gray-600">
                                    <ArrowLeft className="h-6 w-6" />
                                </button>
                                {activeUser && (
                                    <>
                                        <img src={activeUser.avatarUrl} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{activeUser.name}</h3>
                                            <span className="text-xs text-green-600 font-medium">Online</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-8">
                                    This is the start of your conversation with {activeUser?.name}.
                                </div>
                            )}
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <ImageIcon className="h-6 w-6" />
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};