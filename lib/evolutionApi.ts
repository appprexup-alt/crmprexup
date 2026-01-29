import { supabase } from './supabase';

interface EvolutionSettings {
    evolution_api_url: string;
    evolution_api_key: string;
    evolution_instance_name: string;
}

let cachedSettings: EvolutionSettings | null = null;

// Get Evolution API settings from database
export const getEvolutionSettings = async (): Promise<EvolutionSettings | null> => {
    if (cachedSettings) return cachedSettings;

    try {
        const { data, error } = await supabase
            .from('settings')
            .select('evolution_api_url, evolution_api_key, evolution_instance_name')
            .single();

        if (error || !data?.evolution_api_url || !data?.evolution_api_key) {
            return null;
        }

        cachedSettings = data as EvolutionSettings;
        return cachedSettings;
    } catch (err) {
        console.error('Error fetching Evolution settings:', err);
        return null;
    }
};

// Clear cached settings (call when settings are updated)
export const clearEvolutionCache = () => {
    cachedSettings = null;
};

// Check connection status
export const getConnectionStatus = async (): Promise<'connected' | 'disconnected' | 'error'> => {
    // Clear cache to get fresh settings
    cachedSettings = null;
    const settings = await getEvolutionSettings();

    if (!settings || !settings.evolution_instance_name) {
        console.log('Evolution API: No settings configured');
        return 'error';
    }

    try {
        console.log('Checking Evolution API status for:', settings.evolution_instance_name);
        const res = await fetch(
            `${settings.evolution_api_url}/instance/connectionState/${settings.evolution_instance_name}`,
            { headers: { 'apikey': settings.evolution_api_key } }
        );

        if (!res.ok) {
            console.log('Evolution API status check failed:', res.status);
            return 'error';
        }

        const data = await res.json();
        console.log('Evolution API status response:', data);

        // Handle different response formats
        const state = data.instance?.state || data.state;
        return state === 'open' ? 'connected' : 'disconnected';
    } catch (err) {
        console.error('Evolution API connection error:', err);
        return 'error';
    }
};

// Format phone number for WhatsApp (remove spaces, add country code if needed)
const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    // Add Peru country code if not present and starts with 9
    if (cleaned.startsWith('9') && cleaned.length === 9) {
        cleaned = '51' + cleaned;
    }
    return cleaned;
};

// Send text message
export const sendTextMessage = async (phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const settings = await getEvolutionSettings();
    if (!settings) return { success: false, error: 'Evolution API no configurada' };

    try {
        const res = await fetch(
            `${settings.evolution_api_url}/message/sendText/${settings.evolution_instance_name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': settings.evolution_api_key
                },
                body: JSON.stringify({
                    number: formatPhone(phone),
                    text: message
                })
            }
        );

        const data = await res.json();

        if (data.key?.id) {
            return { success: true, messageId: data.key.id };
        }

        return { success: false, error: data.message || 'Error al enviar mensaje' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

// Send media message (image, video, document)
export const sendMediaMessage = async (
    phone: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document',
    caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const settings = await getEvolutionSettings();
    if (!settings) return { success: false, error: 'Evolution API no configurada' };

    try {
        const res = await fetch(
            `${settings.evolution_api_url}/message/sendMedia/${settings.evolution_instance_name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': settings.evolution_api_key
                },
                body: JSON.stringify({
                    number: formatPhone(phone),
                    mediatype: mediaType,
                    media: mediaUrl,
                    caption: caption || ''
                })
            }
        );

        const data = await res.json();

        if (data.key?.id) {
            return { success: true, messageId: data.key.id };
        }

        return { success: false, error: data.message || 'Error al enviar media' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

// Send audio message (base64)
export const sendAudioMessage = async (
    phone: string,
    audioBase64: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const settings = await getEvolutionSettings();
    if (!settings) return { success: false, error: 'Evolution API no configurada' };

    try {
        const res = await fetch(
            `${settings.evolution_api_url}/message/sendWhatsAppAudio/${settings.evolution_instance_name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': settings.evolution_api_key
                },
                body: JSON.stringify({
                    number: formatPhone(phone),
                    audio: audioBase64
                })
            }
        );

        const data = await res.json();

        if (data.key?.id) {
            return { success: true, messageId: data.key.id };
        }

        return { success: false, error: data.message || 'Error al enviar audio' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

// Upload file to Supabase Storage and get public URL
export const uploadMediaToStorage = async (file: File): Promise<string | null> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `chat_${Date.now()}.${fileExt}`;
        const filePath = `chat-media/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (err) {
        console.error('Error uploading media:', err);
        return null;
    }
};
