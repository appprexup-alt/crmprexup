
import React, { useEffect, useState, useRef } from 'react';
import { Task } from '../types.ts';
import { Bell, BellOff, X, Clock, AlarmClock } from 'lucide-react';
import { getNowInLima, formatFullDateTimeLima } from '../lib/timezone.ts';

interface NotificationManagerProps {
    tasks: Task[];
}

interface ActiveAlarm {
    task: Task;
    startTime: number;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ tasks }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Verificar permiso de notificaciones al montar
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    // Solicitar permiso de notificaciones
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('Este navegador no soporta notificaciones');
            return;
        }

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            setNotificationsEnabled(perm === 'granted');

            if (perm === 'granted') {
                // Mostrar notificación de prueba
                new Notification('¡Notificaciones activadas!', {
                    body: 'Recibirás alertas 5 minutos antes de tus tareas',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico'
                });
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
        }
    };

    // Función para verificar tareas próximas
    const checkUpcomingTasks = () => {
        if (!notificationsEnabled) return;

        const now = getNowInLima();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

        tasks.forEach(task => {
            if (task.status === 'completado') return;

            const taskTime = new Date(task.datetime);

            // Si la tarea está entre 5 y 6 minutos en el futuro
            if (taskTime >= fiveMinutesFromNow && taskTime <= sixMinutesFromNow) {
                triggerAlarm(task);
            }
        });
    };

    // Activar alarma
    const triggerAlarm = (task: Task) => {
        // Evitar alarmas duplicadas
        if (activeAlarm?.task.id === task.id) return;

        console.log('🔔 Activando alarma para:', task.description);

        // Notificación del navegador
        if (notificationsEnabled) {
            new Notification('⏰ Tarea próxima', {
                body: `${task.description}\n📅 ${new Date(task.datetime).toLocaleString('es-PE')}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: task.id,
                requireInteraction: true
            });
        }

        // Activar alarma visual y sonora
        setActiveAlarm({ task, startTime: Date.now() });

        // Reproducir audio
        playAlarmSound();

        // Auto-desactivar después de 60 segundos
        alarmTimeoutRef.current = setTimeout(() => {
            dismissAlarm();
        }, 60000);
    };

    // Reproducir sonido de alarma
    const playAlarmSound = () => {
        // Crear audio context para generar un tono de alarma
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Frecuencia del tono (Hz)
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3; // Volumen

        // Patrón de beep intermitente
        const beepPattern = () => {
            oscillator.start();
            setTimeout(() => oscillator.stop(), 300); // Beep de 300ms

            setTimeout(() => {
                if (activeAlarm) {
                    const newOsc = audioContext.createOscillator();
                    const newGain = audioContext.createGain();
                    newOsc.connect(newGain);
                    newGain.connect(audioContext.destination);
                    newOsc.frequency.value = 800;
                    newOsc.type = 'sine';
                    newGain.gain.value = 0.3;
                    newOsc.start();
                    setTimeout(() => newOsc.stop(), 300);
                }
            }, 500);
        };

        beepPattern();

        // Repetir el patrón cada segundo
        const beepInterval = setInterval(() => {
            if (!activeAlarm) {
                clearInterval(beepInterval);
                return;
            }

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => osc.stop(), 300);
        }, 1000);

        // Guardar referencia para poder detenerlo
        if (audioRef.current) {
            (audioRef.current as any).beepInterval = beepInterval;
        }
    };

    // Desactivar alarma
    const dismissAlarm = () => {
        setActiveAlarm(null);

        if (alarmTimeoutRef.current) {
            clearTimeout(alarmTimeoutRef.current);
            alarmTimeoutRef.current = null;
        }

        // Detener audio
        if (audioRef.current && (audioRef.current as any).beepInterval) {
            clearInterval((audioRef.current as any).beepInterval);
        }
    };

    // Iniciar verificación periódica
    useEffect(() => {
        if (notificationsEnabled) {
            // Verificar cada minuto
            checkIntervalRef.current = setInterval(checkUpcomingTasks, 60000);

            // Verificar inmediatamente al activar
            checkUpcomingTasks();
        }

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [notificationsEnabled, tasks]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            dismissAlarm();
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="relative shrink-0">
            {/* Botón de activar/desactivar notificaciones */}
            <button
                onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestNotificationPermission}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all shrink-0 ${notificationsEnabled
                    ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            >
                {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                <span className="text-[9px] font-bold uppercase tracking-wide hidden md:inline">
                    {notificationsEnabled ? 'Notif. ON' : 'Notif. OFF'}
                </span>
            </button>

            {/* Modal de alarma */}
            {activeAlarm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 rounded-2xl border-2 border-purple-500 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
                        {/* Header con animación */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="animate-bounce">
                                    <AlarmClock size={24} className="text-white" />
                                </div>
                                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                                    ⏰ Alarma de Tarea
                                </h3>
                            </div>
                            <button
                                onClick={dismissAlarm}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 space-y-4">
                            {/* Tiempo restante */}
                            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <Clock size={20} className="text-purple-400 shrink-0" />
                                <div>
                                    <p className="text-purple-400 font-bold text-[10px] uppercase tracking-wide">
                                        Empieza en 5 minutos
                                    </p>
                                    <p className="text-slate-400 text-[9px] mt-1">
                                        {new Date(activeAlarm.task.datetime).toLocaleString('es-PE', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Descripción de la tarea */}
                            <div>
                                <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-2">
                                    Descripción:
                                </p>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                    {activeAlarm.task.description}
                                </p>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-slate-500 uppercase font-bold">Estado:</span>
                                <span className={`px-2 py-1 rounded-full font-bold uppercase ${activeAlarm.task.status === 'pendiente'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                    {activeAlarm.task.status}
                                </span>
                            </div>

                            {/* Botón de desactivar */}
                            <button
                                onClick={dismissAlarm}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-purple-500/50"
                            >
                                Entendido - Cerrar Alarma
                            </button>

                            {/* Contador de tiempo */}
                            <p className="text-center text-slate-600 text-[8px] uppercase tracking-widest">
                                {Math.max(0, Math.floor((60000 - (Date.now() - activeAlarm.startTime)) / 1000))}s restantes
                            </p>
                        </div>
                    </div>

                    {/* Audio element (invisible) */}
                    <audio ref={audioRef} />
                </div>
            )}
        </div>
    );
};

export default NotificationManager;
