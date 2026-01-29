import React, { useState, useRef } from 'react';
import { Paperclip, Mic, Send, Image, FileText, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatInputProps {
    onSendMessage: (content: string, mediaUrl?: string, mediaType?: string, fileName?: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('messages-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('messages-media')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al subir archivo');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 10MB');
            return;
        }

        const url = await uploadToStorage(file, 'images');
        if (url) {
            onSendMessage('', url, 'image', file.name);
        }

        if (imageInputRef.current) imageInputRef.current.value = '';
        setShowAttachMenu(false);
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert('El archivo es muy grande. Máximo 50MB');
            return;
        }

        const url = await uploadToStorage(file, 'documents');
        if (url) {
            onSendMessage('', url, 'document', file.name);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowAttachMenu(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });

                const url = await uploadToStorage(audioFile, 'audio');
                if (url) {
                    onSendMessage('', url, 'audio', audioFile.name);
                }

                stream.getTracks().forEach(track => track.stop());
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Recording error:', error);
            alert('No se pudo acceder al micrófono');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 p-3 bg-slate-900 border-t border-slate-800">
                <div className="flex-1 flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-400 font-mono">{formatRecordingTime(recordingTime)}</span>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 animate-pulse" style={{ width: '50%' }} />
                    </div>
                </div>
                <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    Enviar
                </button>
            </div>
        );
    }

    return (
        <div className="relative p-3 bg-slate-900 border-t border-slate-800">
            {isUploading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-white">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm font-medium">Subiendo...</span>
                    </div>
                </div>
            )}

            {showAttachMenu && (
                <div className="absolute bottom-full left-3 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-lg transition-colors w-full text-left"
                    >
                        <Image size={18} className="text-purple-400" />
                        <span className="text-sm text-slate-200">Imagen</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-lg transition-colors w-full text-left"
                    >
                        <FileText size={18} className="text-blue-400" />
                        <span className="text-sm text-slate-200">Documento</span>
                    </button>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    disabled={disabled}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    {showAttachMenu ? <X size={20} className="text-slate-400" /> : <Paperclip size={20} className="text-slate-400" />}
                </button>

                <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                />

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    disabled={disabled}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                />

                {message.trim() ? (
                    <button
                        onClick={handleSend}
                        disabled={disabled}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Send size={20} className="text-white" />
                    </button>
                ) : (
                    <button
                        onClick={startRecording}
                        disabled={disabled}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Mic size={20} className="text-slate-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatInput;
