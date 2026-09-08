import type { CurrentWeatherData } from '../types';
import { LANGUAGE_NAME_MAP } from './aiAssistant';

/**
 * Dedicated Google Cloud API Chatbot Service
 * Manages dedicated Chatbot API key configuration and executes deep question analysis.
 */

const LOCAL_STORAGE_KEY = 'VITE_CHATBOT_GEMINI_API_KEY';

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

/**
 * Execute deep meteorological question analysis using Google Cloud Gemini API
 */
export async function analyzeChatbotQuestion(
  query: string,
  locationName: string,
  weatherContext?: CurrentWeatherData,
  langCode: string = 'en',
  customApiKey?: string
): Promise<ChatbotAnalysisResult | null> {
  const apiKey = (customApiKey && customApiKey.trim().length > 10) ? customApiKey.trim() : getChatbotApiKey();
  const languageName = LANGUAGE_NAME_MAP[langCode] || 'English';

  // 1. Direct Client-side call to Google Cloud Gemini API
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const promptText = `You are WeatherGPT, a dedicated meteorological assistant powered by Google Cloud AI.
Provide a direct, accurate, professional, user-friendly, and detailed answer to the user's weather or science question.

CRITICAL MANDATES:
1. LANGUAGE: You MUST write your ENTIRE response natively in ${languageName} (language code: "${langCode}"). Do NOT write in English unless the language code is 'en'.
2. RAIN / FORECAST VERDICT: If the user asks whether it will rain today, tomorrow, or on a specific day (e.g. 'will it rain tomorrow?', 'நாளை மழை பெய்யுமா?', 'कल बारिश होगी?'), start on line 1 with an explicit bold YES or NO verdict in the user's language!
Examples for Line 1:
- Tamil: 'ஆம் 🌧️ — நாளை மழை பெய்ய வாய்ப்புள்ளது.' (YES) or 'இல்லை ☀️ — நாளை மழை பெய்ய வாய்ப்பில்லை.' (NO).
- Hindi: 'हाँ 🌧️ — कल बारिश होने की संभावना है।' (YES) or 'नहीं ☀️ — कल बारिश की संभावना नहीं है।' (NO).
- Telugu: 'అవును 🌧️ — రేపు వర్షం పడే అవకాశం ఉంది.' (YES) or 'లేదు ☀️ — రేపు వర్షం పడే అవకాశం లేదు.' (NO).
- English: 'YES 🌧️ — Rain is expected tomorrow.' or 'NO ☀️ — No rain expected tomorrow.'
3. ANALYSIS: Follow verdict with moisture, cloud, wind, temperature analysis, and practical safety advice.

User Question: "${query}"
Location Context: ${locationName}
${weatherContext ? `Live Telemetry Context: ${weatherContext.tempC}°C, Humidity ${weatherContext.humidity}%, Condition ${weatherContext.conditionText}, Wind ${weatherContext.windSpeedKmh} km/h` : ''}`;

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
            text: responseText,
            toolCalled: 'google_cloud_gemini_chatbot_service(generate_content)',
            sources: ['Google Cloud Gemini 1.5 Flash AI Engine', 'WMO Meteorological Standards'],
            isDedicatedKeyUsed: true,
          };
        }
      }
    } catch (err) {
      console.warn('Direct Google Cloud Chatbot API call failed, trying backend endpoint:', err);
    }
  }

  // 2. Fallback to Backend FastAPI Chatbot Endpoint (/api/ai/chatbot)
  try {
    const backendRes = await fetch('http://localhost:8000/api/ai/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        location: locationName,
        weather_context: weatherContext,
        lang_code: langCode,
        api_key: apiKey
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.text) {
        return {
          text: data.text,
          toolCalled: data.tool_called || 'google_cloud_backend_chatbot_api',
          sources: [data.sources || 'Google Cloud AI Proxy, WMO Meteorological Network'],
          isDedicatedKeyUsed: !!apiKey
        };
      }
    }
  } catch (err) {
    console.warn('Backend chatbot endpoint unreachable:', err);
  }

  return null;
}
