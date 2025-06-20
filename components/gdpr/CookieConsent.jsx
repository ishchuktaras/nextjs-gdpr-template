'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Check } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      loadScriptsBasedOnConsent(savedPreferences);
    }
  }, []);

  const loadScriptsBasedOnConsent = (prefs) => {
    if (prefs.analytics && process.env.NEXT_PUBLIC_GA_ID) {
      loadGoogleAnalytics();
    }
    if (prefs.marketing && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
      loadMarketingScripts();
    }
  };

  const loadGoogleAnalytics = () => {
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', process.env.NEXT_PUBLIC_GA_ID);
      };
    }
  };

  const loadMarketingScripts = () => {
    // Facebook Pixel implementation
    if (process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID);
      fbq('track', 'PageView');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    loadScriptsBasedOnConsent(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    loadScriptsBasedOnConsent(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    setPreferences(onlyNecessary);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black bg-opacity-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Respektujeme vaše soukromí
              </h3>
              <button 
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Používáme cookies pro vylepšení vašeho zážitku na našich webových stránkách, 
              analýzu návštěvnosti a personalizaci obsahu. Můžete si vybrat, které kategorie 
              cookies povolíte.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Přijmout vše
              </button>
              
              <button
                onClick={handleRejectAll}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Odmítnout vše
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Settings size={18} />
                Nastavit
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Více informací najdete v našich{' '}
              <a href="/ochrana-osobnich-udaju" className="text-blue-600 hover:underline">
                Zásadách ochrany osobních údajů
              </a>
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Nastavení cookies
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Nezbytné cookies</h4>
                    <p className="text-sm text-gray-600">
                      Tyto cookies jsou nezbytné pro základní fungování webu
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-green-600 mr-2" size={20} />
                    <span className="text-sm text-gray-500">Vždy aktivní</span>
                  </div>
                </div>
              </div>
              
              {['analytics', 'marketing', 'functional'].map((category) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {category === 'analytics' && 'Analytické cookies'}
                        {category === 'marketing' && 'Marketingové cookies'}
                        {category === 'functional' && 'Funkční cookies'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category === 'analytics' && 'Pomáhají nám pochopit, jak návštěvníci používají náš web'}
                        {category === 'marketing' && 'Používají se pro zobrazování relevantních reklam'}
                        {category === 'functional' && 'Umožňují pokročilé funkce jako chat nebo mapy'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[category]}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          [category]: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAcceptSelected}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Uložit nastavení
              </button>
              
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Zpět
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
