// Configuración de zona horaria para toda la aplicación
// Zona horaria: America/Lima (UTC-5)

export const APP_TIMEZONE = 'America/Lima';

/**
 * Formatea una fecha a la zona horaria de Lima
 */
export const formatDateTimeLima = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        ...options
    };

    return new Intl.DateTimeFormat('es-PE', defaultOptions).format(dateObj);
};

/**
 * Formatea solo la fecha (sin hora) en Lima
 */
export const formatDateLima = (date: string | Date): string => {
    return formatDateTimeLima(date, {
        hour: undefined,
        minute: undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Formatea solo la hora en Lima
 */
export const formatTimeLima = (date: string | Date): string => {
    return formatDateTimeLima(date, {
        year: undefined,
        month: undefined,
        day: undefined,
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Obtiene la fecha y hora actual en Lima
 */
export const getNowInLima = (): Date => {
    // Crear fecha en UTC
    const now = new Date();

    // Convertir a string en timezone Lima y volver a Date
    const limaString = now.toLocaleString('en-US', { timeZone: APP_TIMEZONE });
    return new Date(limaString);
};

/**
 * Convierte una fecha local a la zona horaria de Lima
 */
export const toTimezoneDate = (date: Date): Date => {
    const dateString = date.toLocaleString('en-US', { timeZone: APP_TIMEZONE });
    return new Date(dateString);
};

/**
 * Formatea fecha para inputs datetime-local considerando Lima timezone
 */
export const formatForDateTimeInput = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Ajustar a timezone Lima
    const limaDate = toTimezoneDate(dateObj);

    const year = limaDate.getFullYear();
    const month = String(limaDate.getMonth() + 1).padStart(2, '0');
    const day = String(limaDate.getDate()).padStart(2, '0');
    const hours = String(limaDate.getHours()).padStart(2, '0');
    const minutes = String(limaDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Verifica si una fecha/hora está próxima (para notificaciones)
 */
export const isUpcoming = (datetime: string | Date, minutesAhead: number): boolean => {
    const now = getNowInLima();
    const targetDate = typeof datetime === 'string' ? new Date(datetime) : datetime;

    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes > 0 && diffMinutes <= minutesAhead;
};

/**
 * Formatea duración relativa (ej: "hace 5 minutos", "en 2 horas")
 */
export const formatRelativeTime = (date: string | Date): string => {
    const now = getNowInLima();
    const targetDate = typeof date === 'string' ? new Date(date) : date;

    const diffMs = targetDate.getTime() - now.getTime();
    const diffMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    const isPast = diffMs < 0;

    if (diffMinutes < 1) {
        return 'ahora';
    } else if (diffMinutes < 60) {
        return isPast ? `hace ${diffMinutes} min` : `en ${diffMinutes} min`;
    } else if (diffHours < 24) {
        return isPast ? `hace ${diffHours}h` : `en ${diffHours}h`;
    } else {
        return isPast ? `hace ${diffDays}d` : `en ${diffDays}d`;
    }
};

/**
 * Formatea fecha completa en español (Lima)
 */
export const formatFullDateTimeLima = (date: string | Date): string => {
    return formatDateTimeLima(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formatea fecha corta (para mensajes, etc)
 */
export const formatShortDateTime = (date: string | Date): string => {
    return formatDateTimeLima(date, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
