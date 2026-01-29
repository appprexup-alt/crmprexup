import React from 'react';
import { Check, CheckCheck, Download, Play, Pause } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    isSent: boolean;
    leadName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent, leadName }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const handleAudioPlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const renderMedia = () => {
        if (!message.media_type || !message.media_url) return null;

        switch (message.media_type) {
            case 'image':
                return (
                    <div className="mb-2 rounded-lg overflow-hidden max-w-xs">
                        <img
                            src={message.media_url}
                            alt="Imagen enviada"
                            className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.media_url, '_blank')}
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2 mb-2 min-w-[200px]">
                        <button
                            onClick={handleAudioPlay}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <div className="flex-1 h-6 bg-white/20 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/40" style={{ width: '0%' }} />
                        </div>
                        <audio ref={audioRef} src={message.media_url} onEnded={() => setIsPlaying(false)} />
                    </div>
                );

            case 'document':
                return (
                    <a
                        href={message.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-black/10 rounded-lg p-3 mb-2 hover:bg-black/20 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{message.file_name || 'Documento'}</p>
                            <p className="text-[10px] opacity-60">Click para descargar</p>
                        </div>
                        <Download size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                );

            default:
                return null;
        }
    };

    const getStatusIcon = () => {
        if (!isSent) return null;
        if (message.read_at) return <CheckCheck size={14} className="text-blue-400" />;
        if (message.delivered_at) return <CheckCheck size={14} className="text-slate-400" />;
        return <Check size={14} className="text-slate-400" />;
    };

    return (
        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-xl ${isSent
                    ? 'text-white ml-auto primary-gradient'
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 mr-auto backdrop-blur-sm'
                    }`}
            >
                {!isSent && leadName && (
                    <p className="text-[10px] font-black primary-gradient-text mb-1 uppercase tracking-widest">{leadName}</p>
                )}

                {renderMedia()}

                {message.content && (
                    <p className="text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {message.content}
                    </p>
                )}

                <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-60">
                    <span className={`text-[9px] font-bold ${isSent ? 'text-white/80' : 'text-slate-500'}`}>
                        {formatTime(message.created_at)}
                    </span>
                    {getStatusIcon()}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
