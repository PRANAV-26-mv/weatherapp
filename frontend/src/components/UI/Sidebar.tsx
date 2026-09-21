import React, { useState, useEffect } from 'react';
import { ChakraLogo } from './ChakraLogo';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Map, 
  Bell, 
  ShieldAlert, 
  Camera, 
  TrendingUp, 
  Sprout, 
  Wind, 
  Anchor, 
  Plane, 
  Bookmark, 
  User, 
  Menu, 
  X,
  Search,
  Navigation,
  Settings,
  Waves,
  Sun,
  Moon,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Zap
} from 'lucide-react';
import { searchLocation } from '../../services/weatherApi';

export interface SidebarLocale {
  cat_main: string;
  cat_ai: string;
  cat_specialized: string;
  cat_system: string;
  home: string;
  chat: string;
  forecast: string;
  map: string;
  alerts: string;
  flood: string;
  disaster: string;
  vision: string;
  climate: string;
  agri: string;
  aqi: string;
  marine: string;
  aviation: string;
  locations: string;
  settings: string;
  admin: string;
  search_placeholder: string;
  select_city: string;
  pinned_home: string;
  pinned_badge: string;
  low_data: string;
  ai_chat_btn: string;
}

export const SIDEBAR_LOCALIZATIONS: Record<string, SidebarLocale> = {
  en: {
    cat_main: 'Main Dashboard',
    cat_ai: 'AI Intelligence & Safety',
    cat_specialized: 'Specialized Portals',
    cat_system: 'Preferences & System',
    home: 'Home Dashboard',
    chat: 'AI Weather Chat',
    forecast: '7-Day Forecast',
    map: 'GIS Weather Map',
    alerts: 'Disaster Alerts',
    flood: 'Flood Risk Analyzer',
    disaster: 'Disaster Operations',
    vision: 'Weather Vision AI',
    climate: 'Climate Intelligence',
    agri: 'Farm Weather Advisor',
    aqi: 'Air Quality (AQI)',
    marine: 'Marine Weather',
    aviation: 'Aviation Weather',
    locations: 'Saved Locations',
    settings: 'Alert Preferences',
    admin: 'Admin Console',
    search_placeholder: 'Search city...',
    select_city: 'Select City',
    pinned_home: 'Home',
    pinned_badge: 'PINNED',
    low_data: 'Low Data Mode',
    ai_chat_btn: 'AI Chat',
  },
  ta: {
    cat_main: 'முதன்மை பலகை',
    cat_ai: 'AI நுண்ணறிவு & பாதுகாப்பு',
    cat_specialized: 'சிறப்பு தளங்கள்',
    cat_system: 'விருப்பங்கள் & அமைப்புகள்',
    home: 'முகப்பு பலகை',
    chat: 'AI வானிலை அரட்டை',
    forecast: '7-நாள் முன்னறிவிப்பு',
    map: 'GIS வானிலை வரைபடம்',
    alerts: 'பேரிடர் எச்சரிக்கைகள்',
    flood: 'வெள்ள அபாய பகுப்பாய்வி',
    disaster: 'பேரிடர் செயல்பாடுகள்',
    vision: 'வானிலை விஷன் AI',
    climate: 'காலநிலை நுண்ணறிவு',
    agri: 'விவசாய வானிலை வழிகாட்டி',
    aqi: 'காற்று தரம் (AQI)',
    marine: 'கடல் வானிலை',
    aviation: 'விமான வானிலை',
    locations: 'சேமிக்கப்பட்ட இடங்கள்',
    settings: 'எச்சரிக்கை விருப்பங்கள்',
    admin: 'நிர்வாக பலகம்',
    search_placeholder: 'நகரத்தை தேடுக...',
    select_city: 'நகரத்தை தேர்ந்தெடுக்கவும்',
    pinned_home: 'வீடு',
    pinned_badge: 'பதிக்கப்பட்டது',
    low_data: 'குறைந்த தரவு முறை',
    ai_chat_btn: 'AI அரட்டை',
  },
  hi: {
    cat_main: 'मुख्य डैशबोर्ड',
    cat_ai: 'एआई बुद्धिमत्ता और सुरक्षा',
    cat_specialized: 'विशेष पोर्टल्स',
    cat_system: 'प्राथमिकताएं और सिस्टम',
    home: 'होम डैशबोर्ड',
    chat: 'एआई मौसम चैट',
    forecast: '7-दिवसीय पूर्वानुमान',
    map: 'जीआईएस मौसम मानचित्र',
    alerts: 'आपदा अलर्ट',
    flood: 'बाढ़ जोखिम विश्लेषक',
    disaster: 'आपदा परिचालन',
    vision: 'मौसम विज़न एआई',
    climate: 'जलवायु बुद्धिमत्ता',
    agri: 'कृषि मौसम सलाहकार',
    aqi: 'वायु गुणवत्ता (AQI)',
    marine: 'समुद्री मौसम',
    aviation: 'विमानन मौसम',
    locations: 'सहेजे गए स्थान',
    settings: 'अलर्ट प्राथमिकताएं',
    admin: 'एडमिन कंसोल',
    search_placeholder: 'शहर खोजें...',
    select_city: 'शहर चुनें',
    pinned_home: 'घर',
    pinned_badge: 'पिन किया',
    low_data: 'कम डेटा मोड',
    ai_chat_btn: 'एआई चैट',
  },
  te: {
    cat_main: 'ప్రధాన డ్యాష్‌బోర్డ్',
    cat_ai: 'AI మేధస్సు & భద్రత',
    cat_specialized: 'ప్రత్యేక పోర్టల్స్',
    cat_system: 'ప్రాధాన్యతలు & సిస్టమ్',
    home: 'హోమ్ డ్యాష్‌బోర్డ్',
    chat: 'AI వాతావరణ చాట్',
    forecast: '7-రోజుల సూచన',
    map: 'GIS వాతావరణ పటం',
    alerts: 'విపత్తు హెచ్చరికలు',
    flood: 'వరద ప్రమాద విశ్లేషణ',
    disaster: 'విపత్తు నిర్వహణ',
    vision: 'వాతావరణ విజన్ AI',
    climate: 'వాతావరణ మేధస్సు',
    agri: 'రైతు వాతావరణ సలహాదారు',
    aqi: 'గాలి నాణ్యత (AQI)',
    marine: 'సముద్ర వాతావరణం',
    aviation: 'విమానయాన వాతావరణం',
    locations: 'సేవ్ చేసిన ప్రదేశాలు',
    settings: 'హెచ్చరిక ప్రాధాన్యతలు',
    admin: 'అడ్మిన్ కన్సోల్',
    search_placeholder: 'నగరాన్ని శోధించండి...',
    select_city: 'నగరాన్ని ఎంచుకోండి',
    pinned_home: 'ఇల్లు',
    pinned_badge: 'పిన్ చేయబడింది',
    low_data: 'తక్కువ డేటా మోడ్',
    ai_chat_btn: 'AI చాట్',
  },
  kn: {
    cat_main: 'ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    cat_ai: 'AI ಬುದ್ಧಿಮತ್ತೆ & ಸುರಕ್ಷತೆ',
    cat_specialized: 'ವಿಶೇಷ ಪೋರ್ಟಲ್‌ಗಳು',
    cat_system: 'ಆದ್ಯತೆಗಳು & ವ್ಯವಸ್ಥೆ',
    home: 'ಮುಖಪುಟ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    chat: 'AI ಹವಾಮಾನ ಚಾಟ್',
    forecast: '7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ',
    map: 'GIS ಹವಾಮಾನ ನಕ್ಷೆ',
    alerts: 'ವಿಪತ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    flood: 'ಪ್ರವಾಹ ಅಪಾಯ ವಿಶ್ಲೇಷಕ',
    disaster: 'ವಿಪತ್ತು ಕಾರ್ಯಾಚರಣೆ',
    vision: 'ಹವಾಮಾನ ವಿಷನ್ AI',
    climate: 'ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
    agri: 'ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆಗಾರ',
    aqi: 'ವಾಯು ಗುಣಮಟ್ಟ (AQI)',
    marine: 'ಸಮುದ್ರ ಹವಾಮಾನ',
    aviation: 'ವಾಯುಯಾನ ಹವಾಮಾನ',
    locations: 'ಉಳಿಸಿದ ಸ್ಥಳಗಳು',
    settings: 'ಎಚ್ಚರಿಕೆ ಆದ್ಯತೆಗಳು',
    admin: 'ನಿರ್ವಾಹಕ ಕನ್ಸೋಲ್',
    search_placeholder: 'ನಗರವನ್ನು ಹುಡುಕಿ...',
    select_city: 'ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    pinned_home: 'ಮನೆ',
    pinned_badge: 'ಪಿನ್ ಮಾಡಲಾಗಿದೆ',
    low_data: 'ಕಡಿಮೆ ಡೇಟಾ ಮೋಡ್',
    ai_chat_btn: 'AI ಚಾಟ್',
  },
  ml: {
    cat_main: 'പ്രധാന ഡാഷ്‌ബോർഡ്',
    cat_ai: 'AI ഇന്റലിജൻസ് & സുരക്ഷ',
    cat_specialized: 'പ്രത്യേക പോർട്ടലുകൾ',
    cat_system: 'മുൻഗണനകളും സിസ്റ്റവും',
    home: 'ഹോം ഡാഷ്‌ബോർഡ്',
    chat: 'AI കാലാവസ്ഥ ചാറ്റ്',
    forecast: '7 ദിവസത്തെ പ്രവചനം',
    map: 'GIS കാലാവസ്ഥ ഭൂപടം',
    alerts: 'ദുരന്ത മുന്നറിയിപ്പുകൾ',
    flood: 'പ്രളയ സാധ്യത വിശകലനം',
    disaster: 'ദുരന്ത നിവാരണം',
    vision: 'കാലാവസ്ഥാ വിഷൻ AI',
    climate: 'കാലാവസ്ഥാ ഇന്റലിജൻസ്',
    agri: 'കാർഷിക കാലാവസ്ഥാ ഉപദേശകൻ',
    aqi: 'വായു ഗുണനിലവാരം (AQI)',
    marine: 'സമുദ്ര കാലാവസ്ഥ',
    aviation: 'വ്യോമയാന കാലാവസ്ഥ',
    locations: 'സംരക്ഷിച്ച സ്ഥലങ്ങൾ',
    settings: 'മുന്നറിയിപ്പ് മുൻഗണനകൾ',
    admin: 'അഡ്മിൻ കൺസോൾ',
    search_placeholder: 'നഗരം തിരയുക...',
    select_city: 'നഗരം തിരഞ്ഞെടുക്കുക',
    pinned_home: 'വീട്',
    pinned_badge: 'പിൻ ചെയ്‌തു',
    low_data: 'ലോ ഡാറ്റ മോഡ്',
    ai_chat_btn: 'AI ചാറ്റ്',
  },
  mr: {
    cat_main: 'मुख्य डॅशबोर्ड',
    cat_ai: 'एआय बुद्धिमत्ता आणि सुरक्षा',
    cat_specialized: 'विशेष पोर्टल्स',
    cat_system: 'प्राधान्ये आणि प्रणाली',
    home: 'होम डॅशबोर्ड',
    chat: 'एआय हवामान चॅट',
    forecast: '7-दिवसांचा अंदाज',
    map: 'जीआयएस हवामान नकाशा',
    alerts: 'आपत्ती सूचना',
    flood: 'पूर जोखीम विश्लेषक',
    disaster: 'आपत्ती व्यवस्थापन',
    vision: 'हवामान व्हिजन एआय',
    climate: 'हवामान बुद्धिमत्ता',
    agri: 'कृषी हवामान सल्लागार',
    aqi: 'हवेची गुणवत्ता (AQI)',
    marine: 'सागरी हवामान',
    aviation: 'विमान वाहतूक हवामान',
    locations: 'जतन केलेले ठिकाणे',
    settings: 'सूचना प्राधान्ये',
    admin: 'अ‍ॅडमिन कन्सोल',
    search_placeholder: 'शहर शोधा...',
    select_city: 'शहर निवडा',
    pinned_home: 'घर',
    pinned_badge: 'पिन केले',
    low_data: 'कमी डेटा मोड',
    ai_chat_btn: 'एआय चॅट',
  },
  bn: {
    cat_main: 'মূল ড্যাশবোর্ড',
    cat_ai: 'এআই বুদ্ধিমত্তা ও নিরাপত্তা',
    cat_specialized: 'বিশেষ পোর্টাল',
    cat_system: 'পছন্দ ও সিস্টেম',
    home: 'হোম ড্যাশবোর্ড',
    chat: 'এআই আবহাওয়া চ্যাট',
    forecast: '৭ দিনের পূর্বাভাস',
    map: 'জিআইএস আবহাওয়া মানচিত্র',
    alerts: 'দুর্যোগ সতর্কতা',
    flood: 'বন্যা ঝুঁকি বিশ্লেষক',
    disaster: 'দুর্যোগ কার্যক্রম',
    vision: 'আবহাওয়া ভিশন এআই',
    climate: 'জলবায়ু বুদ্ধিমত্তা',
    agri: 'কৃষি আবহাওয়া উপদেষ্টা',
    aqi: 'বাতাসের মান (AQI)',
    marine: 'সামুদ্রিক আবহাওয়া',
    aviation: 'বিমান আবহাওয়া',
    locations: 'সংরক্ষিত স্থান',
    settings: 'সতর্কতা পছন্দ',
    admin: 'অ্যাডমিন কনসোল',
    search_placeholder: 'শহর অনুসন্ধান করুন...',
    select_city: 'শহর নির্বাচন করুন',
    pinned_home: 'বাড়ি',
    pinned_badge: 'পিন করা',
    low_data: 'কম ডেটা মোড',
    ai_chat_btn: 'এআই চ্যাট',
  },
  gu: {
    cat_main: 'મુખ્ય ડેશબોર્ડ',
    cat_ai: 'AI બુદ્ધિમત્તા અને સુરક્ષા',
    cat_specialized: 'વિશેષ પોર્ટલ્સ',
    cat_system: 'પસંદગીઓ અને સિસ્ટમ',
    home: 'હોમ ડેશબોર્ડ',
    chat: 'AI હવામાન ચેટ',
    forecast: '7-દિવસની આગાહી',
    map: 'GIS હવામાન નકશો',
    alerts: 'હોનારત ચેતવણી',
    flood: 'પૂર જોખમ વિશ્લેષક',
    disaster: 'હોનારત કામગીરી',
    vision: 'હવામાન વિઝન AI',
    climate: 'આબોહવા બુદ્ધિમત્તા',
    agri: 'કૃષિ હવામાન સલાહકાર',
    aqi: 'હવાની ગુણવત્તા (AQI)',
    marine: 'દરિયાઈ હવામાન',
    aviation: 'વિમાનયાન હવામાન',
    locations: 'સાચવેલા સ્થળો',
    settings: 'ચેતવણી પસંદગીઓ',
    admin: 'એડમિન કન્સોલ',
    search_placeholder: 'શહેર શોધો...',
    select_city: 'શહેર પસંદ કરો',
    pinned_home: 'ઘર',
    pinned_badge: 'પિન કરેલ',
    low_data: 'ઓછો ડેટા મોડ',
    ai_chat_btn: 'AI ચેટ',
  },
  pa: {
    cat_main: 'ਮੁੱਖ ਡੈਸ਼ਬੋਰਡ',
    cat_ai: 'AI ਬੁੱਧੀਮਤਾ ਅਤੇ ਸੁਰੱਖਿਆ',
    cat_specialized: 'ਵਿਸ਼ੇਸ਼ ਪੋਰਟਲ',
    cat_system: 'ਤਰਜੀਹਾਂ ਅਤੇ ਸਿਸਟਮ',
    home: 'ਹੋਮ ਡੈਸ਼ਬੋਰਡ',
    chat: 'AI ਮੌਸਮ ਚੈਟ',
    forecast: '7-ਦਿਨ ਦਾ ਅਨੁਮਾਨ',
    map: 'GIS ਮੌਸਮ ਦਾ ਨਕਸ਼ਾ',
    alerts: 'ਆਫ਼ਤ ਅਲਰਟ',
    flood: 'ਹੜ੍ਹ ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਕ',
    disaster: 'ਆਫ਼ਤ ਕਾਰਜ',
    vision: 'ਮੌਸਮ ਵਿਜ਼ਨ AI',
    climate: 'ਜਲਵਾਯੂ ਬੁੱਧੀਮਤਾ',
    agri: 'ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਸਲਾਹਕਾਰ',
    aqi: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ (AQI)',
    marine: 'ਸਮੁੰਦਰੀ ਮੌਸਮ',
    aviation: 'ਹਵਾਬਾਜ਼ੀ ਮੌਸਮ',
    locations: 'ਸੰਭਾਲੇ ਗਏ ਸਥਾਨ',
    settings: 'ਅਲਰਟ ਤਰਜੀਹਾਂ',
    admin: 'ਐਡਮਿਨ ਕੰਸੋਲ',
    search_placeholder: 'ਸ਼ਹਿਰ ਖੋਜੋ...',
    select_city: 'ਸ਼ਹਿਰ ਚੁਣੋ',
    pinned_home: 'ਘਰ',
    pinned_badge: 'ਪਿੰਨ ਕੀਤਾ',
    low_data: 'ਘੱਟ ਡੇਟਾ ਮੋਡ',
    ai_chat_btn: 'AI ਚੈਟ',
  },
  or: {
    cat_main: 'ମୁଖ୍ୟ ଡ୍ୟାସବୋର୍ଡ',
    cat_ai: 'AI ବୁଦ୍ଧିମତ୍ତା ଏବଂ ସୁରକ୍ଷା',
    cat_specialized: 'ବିଶେଷ ପୋର୍ଟାଲ୍',
    cat_system: 'ପସନ୍ଦ ଏବଂ ସିଷ୍ଟମ୍',
    home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା ଡ୍ୟାସବୋର୍ଡ',
    chat: 'AI ପାଣିପାଗ ଚାଟ୍',
    forecast: '୭-ଦିନର ପୂର୍ବାନୁମାନ',
    map: 'GIS ପାଣିପାଗ ମାନଚିତ୍ର',
    alerts: 'ବିପର୍ଯ୍ୟୟ ସତର୍କତା',
    flood: 'ବନ୍ୟା ବିପଦ ବିଶ୍ଳେଷକ',
    disaster: 'ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା',
    vision: 'ପାଣିପାଗ ଭିଜନ୍ AI',
    climate: 'ଜଳବାୟୁ ବୁଦ୍ଧିମତ୍ତା',
    agri: 'କୃଷି ପାଣିପାଗ ଉପଦେଷ୍ଟା',
    aqi: 'ବାୟୁ ଗୁଣବତ୍ତା (AQI)',
    marine: 'ସାମୁଦ୍ରିକ ପାଣିପାଗ',
    aviation: 'ବିମାନ ଚଳାଚଳ ପାଣିପାଗ',
    locations: 'ସଂରକ୍ଷିତ ସ୍ଥାନଗୁଡ଼ିକ',
    settings: 'ସତର୍କତା ପସନ୍ଦ',
    admin: 'ପ୍ରଶାସକ କନସୋଲ୍',
    search_placeholder: 'ସହର ଖୋଜନ୍ତୁ...',
    select_city: 'ସହର ଚୟନ କରନ୍ତୁ',
    pinned_home: 'ଘର',
    pinned_badge: 'ପିନ୍ ହୋଇଛି',
    low_data: 'କମ୍ ଡାଟା ମୋଡ୍',
    ai_chat_btn: 'AI ଚାଟ୍',
  },
  as: {
    cat_main: 'মুখ্য ডেশ্বব’ৰ্ড',
    cat_ai: 'AI বুদ্ধিমত্তা আৰু সুৰক্ষা',
    cat_specialized: 'বিশেষ পৰ্টেল',
    cat_system: 'পছন্দ আৰু চিষ্টেম',
    home: 'গৃহ ডেশ্বব’ৰ্ড',
    chat: 'AI বতৰ চেট',
    forecast: '৭-দিনীয়া পূৰ্বাভাস',
    map: 'GIS বতৰ মানচিত্ৰ',
    alerts: 'দুৰ্যোগ সতৰ্কবাণী',
    flood: 'বানপানী বিপদ বিশ্লেষক',
    disaster: 'দুৰ্যোগ কাৰ্যকলাপ',
    vision: 'বতৰ ভিজন AI',
    climate: 'জলবায়ু বুদ্ধিমত্তা',
    agri: 'কৃষি বতৰ উপদেষ্টা',
    aqi: 'বায়ুৰ গুণমান (AQI)',
    marine: 'সামুদ্ৰিক বতৰ',
    aviation: 'বিমান পৰিবহণ বতৰ',
    locations: 'সংৰক্ষিত স্থানসমূহ',
    settings: 'সতৰ্কতাৰ পছন্দসমূহ',
    admin: 'এডমিন কনচ’ল',
    search_placeholder: 'চহৰ সন্ধান কৰক...',
    select_city: 'চহৰ বাছক',
    pinned_home: 'ঘৰ',
    pinned_badge: 'পিন কৰা',
    low_data: 'কম ডেটা ম’ড',
    ai_chat_btn: 'AI চেট',
  },
  ur: {
    cat_main: 'مرکزی ڈیش بورڈ',
    cat_ai: 'اے آئی انٹیلی جنس اور حفاظت',
    cat_specialized: 'خصوصی پورٹلز',
    cat_system: 'ترجیحات اور سسٹم',
    home: 'ہوم ڈیش بورڈ',
    chat: 'اے آئی موسم چیٹ',
    forecast: '7 دن کی پیشن گوئی',
    map: 'جی آئی ایس موسم کا نقشہ',
    alerts: 'آفات کے الرٹس',
    flood: 'سیلاب کے خطرے کا تجزیہ',
    disaster: 'آفات کے آپریشنز',
    vision: 'موسم وژن اے آئی',
    climate: 'آب و ہوا کی بصیرت',
    agri: 'زرعی موسم کا مشیر',
    aqi: 'ہوا کا معیار (AQI)',
    marine: 'سمندری موسم',
    aviation: 'ہوا بازی کا موسم',
    locations: 'محفوظ مقامات',
    settings: 'الرٹ کی ترجیحات',
    admin: 'ایڈمن کنسول',
    search_placeholder: 'شہر تلاش کریں...',
    select_city: 'شہر منتخب کریں',
    pinned_home: 'گھر',
    pinned_badge: 'پن شدہ',
    low_data: 'کم ڈیٹا موڈ',
    ai_chat_btn: 'اے آئی چیٹ',
  },
};

export const getSidebarText = (key: keyof SidebarLocale, lang: string = 'en'): string => {
  const dict = SIDEBAR_LOCALIZATIONS[lang] || SIDEBAR_LOCALIZATIONS['en'];
  return dict[key] || SIDEBAR_LOCALIZATIONS['en'][key] || key;
};

export interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  currentLang: string;
  onSelectLanguage?: (code: string) => void;
  onOpenLanguageModal?: () => void;
  onOpenGuideModal?: () => void;
  onSelectLocation: (name: string, lat: number, lon: number) => void;
  onDetectCurrentLocation: () => void;
  permanentLocation?: { name: string; lat: number; lon: number } | null;
  activeAlertCount?: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLang,
  onSelectLanguage: _onSelectLanguage,
  onOpenLanguageModal,
  onOpenGuideModal,
  onSelectLocation,
  onDetectCurrentLocation,
  permanentLocation,
  activeAlertCount = 1,
  theme,
  onToggleTheme,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; country: string; lat: number; lon: number }>>([]);
  const [isLowDataMode, setIsLowDataMode] = useState(false);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
  };

  const navCategories = [
    {
      title: getSidebarText('cat_main', currentLang),
      items: [
        { id: 'home', label: getSidebarText('home', currentLang), icon: Home },
        { id: 'chat', label: getSidebarText('chat', currentLang), icon: MessageSquare, badge: 'AI' },
        { id: 'forecast', label: getSidebarText('forecast', currentLang), icon: Calendar },
        { id: 'map', label: getSidebarText('map', currentLang), icon: Map },
        { id: 'alerts', label: getSidebarText('alerts', currentLang), icon: Bell, alertCount: activeAlertCount },
      ]
    },
    {
      title: getSidebarText('cat_ai', currentLang),
      items: [
        { id: 'flood', label: getSidebarText('flood', currentLang), icon: Waves, badge: 'AI' },
        { id: 'disaster', label: getSidebarText('disaster', currentLang), icon: ShieldAlert },
        { id: 'vision', label: getSidebarText('vision', currentLang), icon: Camera, badge: 'Vision' },
        { id: 'climate', label: getSidebarText('climate', currentLang), icon: TrendingUp },
        { id: 'agri', label: getSidebarText('agri', currentLang), icon: Sprout },
        { id: 'aqi', label: getSidebarText('aqi', currentLang), icon: Wind },
      ]
    },
    {
      title: getSidebarText('cat_specialized', currentLang),
      items: [
        { id: 'marine', label: getSidebarText('marine', currentLang), icon: Anchor },
        { id: 'aviation', label: getSidebarText('aviation', currentLang), icon: Plane },
      ]
    },
    {
      title: getSidebarText('cat_system', currentLang),
      items: [
        { id: 'locations', label: getSidebarText('locations', currentLang), icon: Bookmark },
        { id: 'settings', label: getSidebarText('settings', currentLang), icon: Settings },
        { id: 'admin', label: getSidebarText('admin', currentLang), icon: User },
      ]
    }
  ];

  const renderNavList = (isMobile: boolean = false) => (
    <div className="space-y-5 px-3 py-2">
      {navCategories.map((cat, catIdx) => (
        <div key={catIdx} className="space-y-1">
          {(!isCollapsed || isMobile) && (
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-saffron font-heading">
              {cat.title}
            </div>
          )}

          <div className="space-y-0.5">
            {cat.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isMobile) setMobileDrawerOpen(false);
                  }}
                  title={item.label}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-saffron to-amber-500 text-black font-extrabold shadow-md shadow-saffron/30 scale-[1.01]'
                      : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-amber-600 dark:text-saffron'}`} />

                  {(!isCollapsed || isMobile) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {/* Badges */}
                  {(!isCollapsed || isMobile) && item.badge && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-black' : 'bg-saffron/20 text-amber-700 dark:text-saffron border border-saffron/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                      {item.alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 📱 MOBILE TOP HEADER BAR (< lg screens)               */}
      {/* ---------------------------------------------------- */}
      <header className={`lg:hidden sticky top-0 z-40 px-3.5 py-2.5 flex items-center justify-between shadow-md transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 text-slate-900'
          : 'bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 text-white'
      }`}>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-saffron/20 text-slate-800 dark:text-white hover:text-saffron transition-all border border-slate-200 dark:border-white/10"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div onClick={() => onSelectTab('home')} className="cursor-pointer">
            <ChakraLogo size="sm" showSubtitle={false} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Language Switcher Button */}
          {onOpenLanguageModal && (
            <button
              onClick={onOpenLanguageModal}
              className="px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-saffron/60"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-saffron" />
              <span>{currentLang.toUpperCase()}</span>
            </button>
          )}

          {/* Quick Help Guide */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="p-2 rounded-xl border transition-all bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-saffron"
              title="User Guide"
              aria-label="Open User Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border transition-all bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-saffron"
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 📱 MOBILE DRAWER BACKDROP & SLIDING PANEL (< lg)      */}
      {/* ---------------------------------------------------- */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className={`relative w-72 max-w-[85vw] h-full flex flex-col justify-between z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300 ${
            theme === 'light'
              ? 'bg-white text-slate-900 border-r border-slate-200'
              : 'bg-[#0B0F19] text-white border-r border-white/15'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div onClick={() => { onSelectTab('home'); setMobileDrawerOpen(false); }} className="cursor-pointer">
                  <ChakraLogo size="sm" />
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-3 border-b border-slate-200 dark:border-white/10">
                <form onSubmit={(e) => { handleSearchSubmit(e); setMobileDrawerOpen(false); }} className="relative">
                  <input
                    type="text"
                    placeholder="Search city (e.g. Delhi, London)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-input text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/15 focus:border-saffron text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 absolute left-2.5 top-2.5" />
                </form>
              </div>

              {/* Navigation Items List */}
              {renderNavList(true)}
            </div>

            {/* Drawer Bottom Controls */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2 bg-slate-50 dark:bg-black/40">
              <div className="flex items-center justify-between gap-2">
                {/* Language Button */}
                {onOpenLanguageModal && (
                  <button
                    onClick={() => { onOpenLanguageModal(); setMobileDrawerOpen(false); }}
                    className="flex-1 px-3 py-2 rounded-xl glass-pill text-xs font-bold text-slate-700 dark:text-gray-200 hover:border-saffron/50 flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-4 h-4 text-saffron" />
                    <span>{currentLang.toUpperCase()}</span>
                  </button>
                )}

                {/* User Guide */}
                {onOpenGuideModal && (
                  <button
                    onClick={() => { onOpenGuideModal(); setMobileDrawerOpen(false); }}
                    className="p-2 rounded-xl glass-pill text-amber-600 dark:text-saffron hover:bg-slate-200 dark:hover:bg-saffron/20"
                    title="User Guide"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={onToggleTheme}
                  className="p-2 rounded-xl glass-pill text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 💻 DESKTOP PERMANENT LEFT SIDEBAR (lg+ screens)        */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col justify-between transition-all duration-300 shadow-2xl ${
          theme === 'light'
            ? 'bg-white text-slate-900 border-r border-slate-200'
            : 'bg-[#0B0F19]/95 backdrop-blur-xl text-white border-r border-white/10'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Header: Brand & Collapse Toggle */}
        <div>
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
            <div 
              onClick={() => onSelectTab('home')} 
              className="cursor-pointer flex items-center gap-2 overflow-hidden"
              title="WeatherGPT Home"
            >
              <ChakraLogo size="sm" showText={!isCollapsed} showSubtitle={!isCollapsed} />
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-saffron" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* City Autocomplete Search Bar */}
          {!isCollapsed && (
            <div className="p-3 border-b border-slate-200 dark:border-white/10">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder={getSidebarText('search_placeholder', currentLang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-input text-xs pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-white/15 focus:border-saffron placeholder-slate-400 dark:placeholder-gray-400 text-slate-900 dark:text-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 absolute left-2.5 top-2.5" />

                <button
                  type="button"
                  onClick={onDetectCurrentLocation}
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg hover:bg-saffron text-slate-400 hover:text-black transition-colors"
                  title="Detect GPS Live Location"
                >
                  <Navigation className="w-3.5 h-3.5 text-saffron" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-1.5 glass-panel rounded-xl border border-slate-200 dark:border-white/15 shadow-2xl p-1 z-50">
                  <div className="text-[9px] text-amber-700 dark:text-saffron uppercase font-bold px-2 py-0.5">{getSidebarText('select_city', currentLang)}</div>
                  {searchResults.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectLocation(loc.name, loc.lat, loc.lon);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2 py-1 text-[11px] text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-saffron/20 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-semibold truncate">{loc.name}</span>
                      <span className="text-[9px] text-slate-500 dark:text-gray-400 shrink-0">{loc.country}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Permanent Home Pin Shortcut */}
              {permanentLocation && (
                <button
                  type="button"
                  onClick={() => onSelectLocation(permanentLocation.name, permanentLocation.lat, permanentLocation.lon)}
                  className="mt-2 w-full px-2.5 py-1 rounded-lg bg-saffron/10 hover:bg-saffron/20 border border-saffron/30 text-amber-700 dark:text-saffron text-[10px] font-bold flex items-center justify-between transition-all"
                  title={`Go to Permanent Location: ${permanentLocation.name}`}
                >
                  <span className="flex items-center gap-1 truncate">
                    <span>🏠 {getSidebarText('pinned_home', currentLang)}:</span>
                    <strong className="text-slate-900 dark:text-white truncate">{permanentLocation.name}</strong>
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-gray-400">{getSidebarText('pinned_badge', currentLang)}</span>
                </button>
              )}
            </div>
          )}

          {/* Scrollable Categories Navigation */}
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-saffron/40">
            {renderNavList(false)}
          </div>
        </div>

        {/* Sidebar Bottom Controls: Language, Theme, Guide, Low-Data */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2 bg-slate-50 dark:bg-black/40">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between gap-1.5">
                {/* Language Picker Trigger */}
                {onOpenLanguageModal && (
                  <button
                    onClick={onOpenLanguageModal}
                    className="flex-1 px-2.5 py-1.5 rounded-xl glass-pill text-[11px] font-bold text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white hover:border-saffron/60 flex items-center gap-1.5 transition-all"
                    title="Change UI & Assistant Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-saffron shrink-0" />
                    <span className="truncate">{currentLang.toUpperCase()}</span>
                  </button>
                )}

                {/* Theme Toggle Button */}
                <button
                  onClick={onToggleTheme}
                  className="p-1.5 rounded-xl glass-pill text-slate-700 dark:text-white hover:text-saffron transition-all"
                  title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>

                {/* User Guide Button */}
                {onOpenGuideModal && (
                  <button
                    onClick={onOpenGuideModal}
                    className="p-1.5 rounded-xl glass-pill text-amber-600 dark:text-saffron hover:bg-slate-200 dark:hover:bg-saffron/20 transition-all"
                    title="Open User Guide & Instructions"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Data Saver Mode Pill */}
              <div className="flex items-center justify-between px-1 text-[10px] text-slate-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Zap className={`w-3 h-3 ${isLowDataMode ? 'text-indiagreen' : 'text-slate-400 dark:text-gray-500'}`} />
                  <span>{getSidebarText('low_data', currentLang)}</span>
                </span>
                <input
                  type="checkbox"
                  checked={isLowDataMode}
                  onChange={(e) => setIsLowDataMode(e.target.checked)}
                  className="rounded bg-white dark:bg-black border-slate-300 dark:border-white/20 text-saffron focus:ring-saffron w-3 h-3 cursor-pointer"
                />
              </div>
            </>
          ) : (
            /* Collapsed Compact Bottom Icons */
            <div className="flex flex-col items-center gap-2 py-1">
              {onOpenLanguageModal && (
                <button
                  onClick={onOpenLanguageModal}
                  className="p-2 rounded-xl text-saffron hover:bg-slate-200 dark:hover:bg-white/10"
                  title={`Language (${currentLang.toUpperCase()})`}
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
              {onOpenGuideModal && (
                <button
                  onClick={onOpenGuideModal}
                  className="p-2 rounded-xl text-amber-600 dark:text-saffron hover:bg-slate-200 dark:hover:bg-white/10"
                  title="User Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
