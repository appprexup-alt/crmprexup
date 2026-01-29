
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, Message } from '../types';
import { Search, MessageCircle, Loader2, ArrowLeft, Phone, Bot, BotOff, MoreVertical } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface ConversationsPageProps {
    leads: Lead[];
    onUpdateLead: (lead: Partial<Lead> & { id: string }) => void;
}

const ConversationsPage: React.FC<ConversationsPageProps> = ({ leads, onUpdateLead }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileList, setShowMobileList] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filtrar leads con mensajes
    const leadsWithMessages = leads.filter(lead => lead.phone);

    // Buscar leads
    const filteredLeads = leadsWithMessages.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
    );

    // Cargar mensajes cuando se selecciona un lead
    useEffect(() => {
        if (selectedLead) {
            fetchMessages(selectedLead.id);
            // Auto-ocultar lista en mobile
            if (window.innerWidth < 768) {
                setShowMobileList(false);
            }
        }
    }, [selectedLead]);

    // Realtime subscription
    useEffect(() => {
        if (!selectedLead) return;

        const channel = supabase
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `lead_id=eq.${selectedLead.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedLead]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (leadId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: string, fileName?: string) => {
        if (!selectedLead) return;

        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    lead_id: selectedLead.id,
                    content: content,
                    direction: 'outbound',
                    type: mediaType || 'text',
                    status: 'sent',
                    media_url: mediaUrl,
                    media_type: mediaType,
                    file_name: fileName
                }]);

            if (error) throw error;

            // Note: Realtime subscription will add the message to state
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar mensaje');
        }
    };

    const toggleChatbot = async () => {
        if (!selectedLead) return;

        const newValue = !selectedLead.chatbot_enabled;

        onUpdateLead({
            id: selectedLead.id,
            chatbot_enabled: newValue
        });

        setSelectedLead({ ...selectedLead, chatbot_enabled: newValue });
    };

    const getLastMessage = (lead: Lead) => {
        // Aquí podrías hacer una query separada, por simplicidad mostramos placeholder
        return lead.last_message || 'Nuevo chat';
    };

    const formatMessageTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Ayer';
        } else if (days < 7) {
            return d.toLocaleDateString('es-PE', { weekday: 'short' });
        } else {
            return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Superior similar a otras páginas */}
            <header className="mb-4 shrink-0">
                <h1 className="text-lg font-bold text-white tracking-tight uppercase">WhatsApp <span className="primary-gradient-text">Omnicanal</span></h1>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none">Gestión de Mensajería y AI</p>
            </header>

            <div className="flex-1 flex bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-0">
                {/* SIDEBAR - Lista de conversaciones */}
                <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 bg-slate-900/40 border-r border-slate-800/50`}>
                    {/* Search */}
                    <div className="p-4 border-b border-slate-800/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input
                                type="text"
                                placeholder="Buscar chat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-pink-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Lista de conversaciones */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8">
                                <MessageCircle size={40} className="mb-3 opacity-20" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Sin chats</p>
                            </div>
                        ) : (
                            filteredLeads.map((lead) => (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`w-full p-4 border-b border-slate-800/30 hover:bg-white/5 transition-all text-left ${selectedLead?.id === lead.id ? 'bg-white/5 border-l-2 border-l-pink-500' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                                            {lead.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className="font-bold text-slate-200 text-xs truncate">{lead.name}</h3>
                                                <span className="text-[9px] font-bold text-slate-600 uppercase">
                                                    {lead.created_at && formatMessageTime(lead.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 truncate font-medium">
                                                {getLastMessage(lead)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* CHAT WINDOW */}
                <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-slate-950/30 backdrop-blur-sm`}>
                    {selectedLead ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowMobileList(true)}
                                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft size={18} className="text-slate-400" />
                                    </button>

                                    <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold shadow-lg">
                                        {selectedLead.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-100 text-xs">{selectedLead.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedLead.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Chatbot Toggle */}
                                    <button
                                        onClick={toggleChatbot}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all ${selectedLead.chatbot_enabled
                                            ? 'bg-pink-500/20 primary-gradient-text border border-pink-500/30 shadow-lg shadow-pink-500/10'
                                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                                            }`}
                                        title={selectedLead.chatbot_enabled ? 'Chatbot activado' : 'Chatbot desactivado'}
                                    >
                                        {selectedLead.chatbot_enabled ? <Bot size={12} /> : <BotOff size={12} />}
                                        <span className="hidden sm:inline">
                                            AI {selectedLead.chatbot_enabled ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <a
                                        href={`tel:${selectedLead.phone}`}
                                        className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
                                        title="Llamar"
                                    >
                                        <Phone size={16} />
                                    </a>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/20 custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="animate-spin text-pink-500" size={24} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                        <MessageCircle size={48} className="mb-3 opacity-10" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin mensajes aún</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {messages.map((msg) => (
                                            <MessageBubble
                                                key={msg.id}
                                                message={msg}
                                                isSent={msg.direction === 'outbound'}
                                                leadName={msg.direction === 'inbound' ? selectedLead.name : undefined}
                                            />
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-slate-900/40 border-t border-slate-800/50">
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    disabled={loading}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-2xl">
                                <MessageCircle size={32} className="opacity-20" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em]">Selecciona un chat</p>
                            <p className="text-[10px] mt-2 text-slate-700 font-medium">Elige una conversación para comenzar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationsPage;
