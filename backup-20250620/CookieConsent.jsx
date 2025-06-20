// components/gdpr/CookieConsent.jsx
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

  // Tento useEffect se stará POUZE o zobrazení banneru
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // Pokud souhlas existuje, načteme ho, ale nespouštíme skripty znovu
      // Skripty by měly být načteny pouze jednou, když byl souhlas udělen
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
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
    if (typeof window.gtag === 'undefined') {
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
        console.log('Google Analytics loaded.');
      };
    }
  };

  const loadMarketingScripts = () => {
    if (typeof window.fbq === 'undefined' && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
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
      console.log('Facebook Pixel loaded.');
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
    setShowBanner(false);
    // Skripty se načtou AŽ ZDE, po kliknutí
    loadScriptsBasedOnConsent(allAccepted);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
    // Skripty se načtou AŽ ZDE, po kliknutí
    loadScriptsBasedOnConsent(preferences);
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
    // Zde se `loadScriptsBasedOnConsent` nevolá, takže se nic nenačte
  };

  if (!showBanner) return null;

  // ... (zbytek JSX kódu zůstává stejný) ...
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black bg-opacity-50">
      {/* ... zbytek JSX ... */}
    </div>
  );
};

export default CookieConsent;