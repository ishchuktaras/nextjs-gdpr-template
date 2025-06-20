'use client';

// components/gdpr/GDPRProvider.js
// 🔐 GDPR Components - JavaScript verze (bez TypeScript syntax)
import React, { createContext, useContext, useState, useEffect } from 'react';

// GDPR Context
const GDPRContext = createContext(undefined);

// GDPR Provider komponenta
export function GDPRProvider({ children }) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  // Načtení consent při mount - s check pro browser environment
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const savedConsent = localStorage.getItem('gdpr-consent');
      const savedPreferences = localStorage.getItem('gdpr-preferences');
      
      if (savedConsent) {
        setConsentGiven(JSON.parse(savedConsent));
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } else {
        // Pokud consent není, zobraz banner po 1 sekundě
        const timer = setTimeout(() => setShowConsentBanner(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('GDPR: Error loading consent from localStorage:', error);
      // Fallback - zobraz banner
      const timer = setTimeout(() => setShowConsentBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Funkce pro uložení consent
  const saveConsent = (consent, prefs = preferences) => {
    if (typeof window === 'undefined') return;
    
    try {
      setConsentGiven(consent);
      setPreferences(prefs);
      setShowConsentBanner(false);
      
      localStorage.setItem('gdpr-consent', JSON.stringify(consent));
      localStorage.setItem('gdpr-preferences', JSON.stringify(prefs));
      localStorage.setItem('gdpr-consent-date', new Date().toISOString());
      
      // Trigger custom event pro analytics
      window.dispatchEvent(new CustomEvent('gdpr-consent-updated', {
        detail: { consent, preferences: prefs }
      }));
    } catch (error) {
      console.error('GDPR: Error saving consent:', error);
    }
  };

  // Funkce pro přijetí všech cookies
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    saveConsent(true, allAccepted);
  };

  // Funkce pro odmítnutí volitelných cookies
  const rejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    saveConsent(true, onlyNecessary);
  };

  // Funkce pro reset consent (pro testování)
  const resetConsent = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('gdpr-consent');
      localStorage.removeItem('gdpr-preferences');
      localStorage.removeItem('gdpr-consent-date');
      
      setConsentGiven(false);
      setShowConsentBanner(true);
      setPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
      });
    } catch (error) {
      console.error('GDPR: Error resetting consent:', error);
    }
  };

  const value = {
    consentGiven,
    showConsentBanner,
    preferences,
    saveConsent,
    acceptAll,
    rejectOptional,
    resetConsent,
    setShowConsentBanner
  };

  return (
    <GDPRContext.Provider value={value}>
      {children}
    </GDPRContext.Provider>
  );
}

// Hook pro použití GDPR contextu
export function useGDPR() {
  const context = useContext(GDPRContext);
  if (!context) {
    throw new Error('useGDPR must be used within GDPRProvider');
  }
  return context;
}

// CookieConsent Banner komponenta
export function CookieConsent({ className = '' }) {
  const { showConsentBanner, acceptAll, rejectOptional, setShowConsentBanner } = useGDPR();
  const [showDetails, setShowDetails] = useState(false);

  if (!showConsentBanner) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-slide-up ${className}`}>
      <div className="max-w-6xl mx-auto">
        {!showDetails ? (
          // Základní consent banner
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                🍪 Souhlas s použitím cookies
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Tento web používá cookies pro zlepšení uživatelského zážitku a analýzu návštěvnosti. 
                Vaše osobní údaje zpracováváme v souladu s GDPR.{' '}
                <a 
                  href="/privacy-policy" 
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Více informací o ochraně osobních údajů
                </a>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors duration-200 border border-gray-600"
                aria-label="Otevřít detailní nastavení cookies"
                type="button"
              >
                ⚙️ Nastavení
              </button>
              <button
                onClick={rejectOptional}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm transition-colors duration-200"
                aria-label="Přijmout pouze nutné cookies"
                type="button"
              >
                Pouze nutné
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-semibold transition-colors duration-200 shadow-lg"
                aria-label="Přijmout všechny cookies"
                type="button"
              >
                ✅ Přijmout vše
              </button>
            </div>
          </div>
        ) : (
          // Detailní nastavení
          <CookieSettingsPanel onClose={() => setShowDetails(false)} />
        )}
      </div>
    </div>
  );
}

// Detailní nastavení cookies
function CookieSettingsPanel({ onClose }) {
  const { preferences, saveConsent } = useGDPR();
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const cookieTypes = [
    {
      key: 'necessary',
      name: 'Nutné cookies',
      description: 'Tyto cookies jsou nezbytné pro správné fungování webu a nelze je vypnout. Zahrnují autentizaci, bezpečnostní funkce a základní funkcionalitu.',
      required: true,
      icon: '🔒'
    },
    {
      key: 'analytics',
      name: 'Analytické cookies', 
      description: 'Pomáhají nám pochopit, jak návštěvníci používají web prostřednictvím Google Analytics. Data jsou anonymizovaná.',
      required: false,
      icon: '📊'
    },
    {
      key: 'marketing',
      name: 'Marketingové cookies',
      description: 'Používají se pro personalizaci reklam a měření jejich účinnosti. Zahrnují Facebook Pixel a podobné nástroje.',
      required: false,
      icon: '📢'
    },
    {
      key: 'functional',
      name: 'Funkční cookies',
      description: 'Umožňují pokročilé funkce jako chat podpora, video přehrávání nebo personalizace obsahu.',
      required: false,
      icon: '⚙️'
    }
  ];

  const handleToggle = (key) => {
    if (key === 'necessary') return; // Nutné cookies nelze vypnout
    
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    saveConsent(true, localPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setLocalPreferences(allAccepted);
    saveConsent(true, allAccepted);
    onClose();
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setLocalPreferences(onlyNecessary);
    saveConsent(true, onlyNecessary);
    onClose();
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-2">
        <h3 className="text-lg font-semibold">🍪 Detailní nastavení cookies</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-xl"
          aria-label="Zavřít nastavení"
          type="button"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        {cookieTypes.map(({ key, name, description, required, icon }) => (
          <div key={key} className="flex items-start justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex-1 pr-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <span>{icon}</span>
                {name}
                {required && <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">Povinné</span>}
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences[key]}
                  onChange={() => handleToggle(key)}
                  disabled={required}
                  className="sr-only peer"
                />
                <div className={`
                  relative w-11 h-6 rounded-full transition-colors duration-200
                  ${localPreferences[key] 
                    ? 'bg-blue-600' 
                    : 'bg-gray-600'
                  }
                  ${required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'}
                `}>
                  <div className={`
                    absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200
                    ${localPreferences[key] ? 'translate-x-full border-white' : 'translate-x-0'}
                  `}></div>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleRejectOptional}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors duration-200"
          type="button"
        >
          Pouze nutné
        </button>
        <button
          onClick={handleAcceptAll}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors duration-200"
          type="button"
        >
          Přijmout vše
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-md font-semibold transition-colors duration-200"
          type="button"
        >
          💾 Uložit nastavení
        </button>
      </div>
    </div>
  );
}