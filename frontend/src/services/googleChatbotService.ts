import type { CurrentWeatherData } from '../types';
import { LANGUAGE_NAME_MAP } from './aiAssistant';

/**
 * Dedicated Google Cloud API Chatbot Service
 * Manages dedicated Chatbot API key configuration and executes deep question analysis.
 */

const LOCAL_STORAGE_KEY = 'VITE_CHATBOT_GEMINI_API_KEY';
const BACKEND_BASE = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '') || 'http://localhost:8000';

export function stripMarkdownAsterisks(text: string): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

export function getChatbotApiKey(): string | null {
  const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localKey && localKey.trim().length > 10) return localKey.trim();

  const envKey = (import.meta as any).env?.VITE_CHATBOT_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 10) return envKey.trim();

  const windowKey = (window as any).CHATBOT_GEMINI_API_KEY;
  if (windowKey && windowKey.trim().length > 10) return windowKey.trim();

  // Fallback to primary Gemini key if dedicated chatbot key is not set
  const fallbackLocalKey = localStorage.getItem('VITE_GEMINI_API_KEY');
  if (fallbackLocalKey && fallbackLocalKey.trim().length > 10) return fallbackLocalKey.trim();

  const fallbackEnvKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (fallbackEnvKey && fallbackEnvKey.trim().length > 10) return fallbackEnvKey.trim();

  return null;
}

export function setChatbotApiKey(apiKey: string): void {
  const cleanKey = apiKey.trim();
  if (cleanKey) {
    localStorage.setItem(LOCAL_STORAGE_KEY, cleanKey);
    (window as any).CHATBOT_GEMINI_API_KEY = cleanKey;
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    delete (window as any).CHATBOT_GEMINI_API_KEY;
  }
}

export interface ChatbotAnalysisResult {
  text: string;
  toolCalled: string;
  sources: string[];
  isDedicatedKeyUsed: boolean;
}

export interface TrainedRule {
  id: number;
  query_pattern: string;
  corrected_answer: string;
  target_intent: string;
  language_code: string;
  created_at?: string;
}

/**
 * Execute deep meteorological question analysis.
 * Prioritizes the backend endpoint (/api/ai/chatbot) to honor user-trained rules and corrections,
 * then falls back to client-side Google Cloud Gemini API if backend is unreachable.
 */
export async function analyzeChatbotQuestion(
  query: string,
  locationName: string,
  weatherContext?: CurrentWeatherData,
  langCode: string = 'en',
  customApiKey?: string,
  recentHistory?: string
): Promise<ChatbotAnalysisResult | null> {
  const apiKey = (customApiKey && customApiKey.trim().length > 10) ? customApiKey.trim() : getChatbotApiKey();
  const languageName = LANGUAGE_NAME_MAP[langCode] || 'English';

  // 1. Primary: Query Backend FastAPI Chatbot Endpoint (/api/ai/chatbot)
  // This ensures user-trained corrections & rules from the database are ALWAYS applied first!
  try {
    const backendRes = await fetch(`${BACKEND_BASE}/api/ai/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        location: locationName,
        weather_context: weatherContext,
        lang_code: langCode,
        api_key: apiKey,
        recent_history: recentHistory
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.text) {
        return {
          text: stripMarkdownAsterisks(data.text),
          toolCalled: data.tool_called || 'WeatherGPT AI Engine',
          sources: [data.sources || 'India Meteorological Department (IMD) • Mausam Portal • NDMA'],
          isDedicatedKeyUsed: !!apiKey
        };
      }
    }
  } catch (err) {
    console.warn('Backend chatbot endpoint unreachable, falling back to direct client API:', err);
  }

  if (apiKey) {
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash'
    ];
    
    const promptText = `You are WeatherGPT, an advanced meteorological, agricultural, and atmospheric intelligence partner citing official portals including the India Meteorological Department (IMD), Mausam Portal, and NDMA.
Provide a direct, accurate, professional, user-friendly, and detailed answer to the user's weather, crop/farming, health, or science question.

CRITICAL MANDATES:
1. NO ASTERISKS (** or *): Do NOT use any asterisks (** or *) in your text output! Provide clean plain text responses with emojis for readability.
2. LANGUAGE: You MUST write your ENTIRE response natively in ${languageName} (language code: "${langCode}"). Do NOT write in English unless the language code is 'en'.
3. DIRECT ANSWER FIRST: Answer the specific question directly on Line 1. If asked whether to plant crops, play outdoor sports, or whether it will rain, start with an explicit YES or NO verdict with reasoning!
Examples for Line 1:
- Tamil: 'ஆம் 🌧️ — நாளை மழை பெய்ய வாய்ப்புள்ளது.' (YES) or 'இல்லை ☀️ — நாளை மழை பெய்ய வாய்ப்பில்லை.' (NO).
- Hindi: 'हाँ 🌧️ — कल बारिश होने की संभावना है।' (YES) or 'नहीं ☀️ — कल बारिश की संभावना नहीं है।' (NO).
- Telugu: 'అవును 🌧️ — రేపు వర్షం పడే అవకాశం ఉంది.' (YES) or 'లేదు ☀️ — రేపు వర్షం పడే అవకాశం లేదు.' (NO).
- English: 'YES 🌧️ — Rain is expected tomorrow.' or 'NO ☀️ — No rain expected tomorrow.'
4. PRACTICAL VALUE: Follow the verdict with specific, actionable metrics (temperature, humidity, wind speed, rain risk, agronomic factors, or health precautions).
${recentHistory ? `\nRecent Conversation History Context:\n${recentHistory}\n` : ''}
User Question: "${query}"
Location Context: ${locationName}
${weatherContext ? `Live Telemetry Context: ${weatherContext.tempC}°C, Humidity ${weatherContext.humidity}%, Condition ${weatherContext.conditionText}, Wind ${weatherContext.windSpeedKmh} km/h` : ''}`;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return {
              text: stripMarkdownAsterisks(responseText),
              toolCalled: `google_cloud_chatbot_service(${model})`,
              sources: ['India Meteorological Department (IMD)', 'Mausam Portal', 'NDMA', 'NCMRWF'],
              isDedicatedKeyUsed: true,
            };
          }
        }
      } catch (err) {
        console.warn(`Direct Google Cloud Chatbot API call (${model}) failed:`, err);
      }
    }
  }

  return null;
}

/**
 * 🎓 Chatbot Training API Functions:
 * Allows user to train or correct mistakes in the chatbot's answers.
 */

export async function trainChatbotRule(
  queryPattern: string,
  correctedAnswer: string,
  targetIntent: string = 'custom_training',
  languageCode: string = 'en'
): Promise<{ success: boolean; message: string; rule?: TrainedRule }> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/ai/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_pattern: queryPattern,
        corrected_answer: correctedAnswer,
        target_intent: targetIntent,
        language_code: languageCode
      })
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.detail || 'Training failed.' };
  } catch (err) {
    console.error('Error training chatbot rule:', err);
    return { success: false, message: 'Could not connect to training backend.' };
  }
}

export async function fetchTrainedRules(): Promise<TrainedRule[]> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/ai/trained-rules`);
    if (res.ok) {
      const data = await res.json();
      return data.rules || [];
    }
  } catch (err) {
    console.warn('Failed to fetch trained rules:', err);
  }
  return [];
}

export async function deleteTrainedRule(ruleId: number): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/ai/trained-rules/${ruleId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error(`Failed to delete trained rule ${ruleId}:`, err);
    return false;
  }
}
