'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { GDPR_CONSTANTS, DEFAULT_CONSENT_CONFIG } from '../../lib/gdpr/utils';

/**
 * GDPR Context
 */
const GDPRContext = createContext(null);

/**
 * GDPR Provider komponenta
 * Poskytuje centrální management pro všechny GDPR funkce
 */
export const GDPRProvider = ({ 
  children, 
  config = {},
  onConsentChange,
  onError,
  enableDebug = false 
}) => {
  const mergedConfig = { ...DEFAULT_CONSENT_CONFIG, ...config };
  const cookieConsent = useCookieConsent();
  
  const [bannerVisible, setBannerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Debug logging
  const debugLog = useCallback((message, data) => {
    if (enableDebug || process.env.NODE_ENV === 'development') {
      console.log(`[GDPR Debug] ${message}`, data);
      setDebugInfo(prev => ({
        ...prev,
        [Date.now()]: { message, data, timestamp: new Date().toISOString() }
      }));
    }
  }, [enableDebug]);

  // Track consent changes
  useEffect(() => {
    if (cookieConsent.consent && onConsentChange) {
      debugLog('Consent changed', cookieConsent.consent);
      onConsentChange(cookieConsent.consent);
    }
  }, [cookieConsent.consent, onConsentChange, debugLog]);

  // Auto-show banner if no consent
  useEffect(() => {
    if (!cookieConsent.loading && !cookieConsent.hasInteracted && mergedConfig.autoShow) {
      const timer = setTimeout(() => {
        setBannerVisible(true);
        debugLog('Auto-showing banner', { delay: mergedConfig.showAfterDelay });
      }, mergedConfig.showAfterDelay);

      return () => clearTimeout(timer);
    }
  }, [cookieConsent.loading, cookieConsent.hasInteracted, mergedConfig.autoShow, mergedConfig.showAfterDelay, debugLog]);

  // Enhanced consent management
  const updateConsent = useCallback((newConsent, metadata = {}) => {
    try {
      const enhancedMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        version: '1.0',
        userAgent: navigator.userAgent,
        url: window.location.href,
        method: metadata.method || 'manual'
      };

      debugLog('Updating consent', { consent: newConsent, metadata: enhancedMetadata });
      
      // Uložit metadata spolu s consent
      localStorage.setItem(GDPR_CONSTANTS.STORAGE_KEYS.CONSENT_VERSION, '1.0');
      localStorage.setItem('gdpr-metadata', JSON.stringify(enhancedMetadata));
      
      cookieConsent.updateConsent(newConsent);
      setBannerVisible(false);
      setSettingsVisible(false);

      // Trigger custom event pro analytics
      window.dispatchEvent(new CustomEvent('gdpr:consentUpdated', {
        detail: { consent: newConsent, metadata: enhancedMetadata }
      }));

    } catch (error) {
      debugLog('Error updating consent', error);
      if (onError) onError(error);
    }
  }, [cookieConsent.updateConsent, debugLog, onError]);

  // Enhanced tracking function
  const trackEvent = useCallback((eventName, parameters = {}, category = 'analytics') => {
    try {
      if (!cookieConsent.hasConsent(category)) {
        debugLog(`Event blocked: ${eventName}`, { category, reason: 'no_consent' });
        return false;
      }

      debugLog(`Tracking event: ${eventName}`, { category, parameters });

      // Google Analytics
      if (category === 'analytics' && window.gtag) {
        window.gtag('event', eventName, {
          ...parameters,
          gdpr_consent: true,
          consent_timestamp: cookieConsent.consent?.timestamp
        });
      }

      // Facebook Pixel
      if (category === 'marketing' && window.fbq) {
        window.fbq('track', eventName, parameters);
      }

      // Hotjar
      if (category === 'functional' && window.hj) {
        window.hj('event', eventName);
      }

      // Custom events
      window.dispatchEvent(new CustomEvent('gdpr:eventTracked', {
        detail: { eventName, parameters, category }
      }));

      return true;
    } catch (error) {
      debugLog('Error tracking event', error);
      if (onError) onError(error);
      return false;
    }
  }, [cookieConsent.hasConsent, cookieConsent.consent, debugLog, onError]);

  // Load script conditionally
  const loadScript = useCallback((src, category = 'analytics', options = {}) => {
    return new Promise((resolve, reject) => {
      if (!cookieConsent.canLoadScript(category)) {
        debugLog(`Script blocked: ${src}`, { category, reason: 'no_consent' });
        reject(new Error(`Script ${src} blocked - no consent for category ${category}`));
        return;
      }

      // Check if script already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        debugLog(`Script already loaded: ${src}`);
        resolve(existingScript);
        return;
      }

      debugLog(`Loading script: ${src}`, { category, options });

      const script = document.createElement('script');
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer || false;

      // Add custom attributes
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
      }

      script.onload = () => {
        debugLog(`Script loaded successfully: ${src}`);
        if (options.onLoad) options.onLoad();
        resolve(script);
      };

      script.onerror = (error) => {
        debugLog(`Script failed to load: ${src}`, error);
        if (options.onError) options.onError(error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  }, [cookieConsent.canLoadScript, debugLog]);

  // Banner controls
  const showBanner = useCallback(() => {
    setBannerVisible(true);
    debugLog('Banner shown manually');
  }, [debugLog]);

  const hideBanner = useCallback(() => {
    setBannerVisible(false);
    debugLog('Banner hidden manually');
  }, [debugLog]);

  const openSettings = useCallback(() => {
    setSettingsVisible(true);
    debugLog('Settings opened');
  }, [debugLog]);

  const closeSettings = useCallback(() => {
    setSettingsVisible(false);
    debugLog('Settings closed');
  }, [debugLog]);

  // Reset all GDPR data
  const resetGDPRData = useCallback(() => {
    try {
      cookieConsent.clearConsent();
      localStorage.removeItem('gdpr-metadata');
      localStorage.removeItem(GDPR_CONSTANTS.STORAGE_KEYS.CONSENT_VERSION);
      localStorage.removeItem(GDPR_CONSTANTS.STORAGE_KEYS.USER_ID);
      
      setBannerVisible(true);
      setSettingsVisible(false);
      
      debugLog('GDPR data reset');
      
      window.dispatchEvent(new CustomEvent('gdpr:dataReset'));
    } catch (error) {
      debugLog('Error resetting GDPR data', error);
      if (onError) onError(error);
    }
  }, [cookieConsent.clearConsent, debugLog, onError]);

  // Get compliance report
  const getComplianceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      consent: cookieConsent.consent,
      hasInteracted: cookieConsent.hasInteracted,
      loadedScripts: Array.from(document.querySelectorAll('script[src]')).map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer
      })),
      cookies: document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]),
      localStorage: Object.keys(localStorage).filter(key => 
        key.includes('gdpr') || key.includes('cookie') || key.includes('consent')
      ),
      config: mergedConfig,
      debugInfo: enableDebug ? debugInfo : null
    };

    debugLog('Generated compliance report', report);
    return report;
  }, [cookieConsent.consent, cookieConsent.hasInteracted, mergedConfig, enableDebug, debugInfo, debugLog]);

  // Context value
  const contextValue = {
    // Core consent state
    consent: cookieConsent.consent,
    loading: cookieConsent.loading,
    hasInteracted: cookieConsent.hasInteracted,
    
    // Consent management
    updateConsent,
    hasConsent: cookieConsent.hasConsent,
    canLoadScript: cookieConsent.canLoadScript,
    clearConsent: cookieConsent.clearConsent,
    resetGDPRData,
    
    // Event tracking
    trackEvent,
    
    // Script loading
    loadScript,
    
    // UI controls
    bannerVisible,
    settingsVisible,
    showBanner,
    hideBanner,
    openSettings,
    closeSettings,
    
    // Utility
    analytics: cookieConsent.analytics,
    marketing: cookieConsent.marketing,
    functional: cookieConsent.functional,
    
    // Configuration
    config: mergedConfig,
    
    // Compliance
    getComplianceReport,
    
    // Debug (only in development)
    ...(enableDebug && { 
      debugInfo,
      debugLog 
    })
  };

  return (
    <GDPRContext.Provider value={contextValue}>
      {children}
    </GDPRContext.Provider>
  );
};

/**
 * Hook pro přístup k GDPR contextu
 */
export const useGDPR = () => {
  const context = useContext(GDPRContext);
  
  if (!context) {
    throw new Error('useGDPR must be used within a GDPRProvider');
  }
  
  return context;
};

/**
 * HOC pro komponenty vyžadující consent
 */
export const withGDPRConsent = (WrappedComponent, requiredCategory = 'analytics') => {
  const WithGDPRConsentComponent = (props) => {
    const { hasConsent, canLoadScript } = useGDPR();
    
    if (!canLoadScript(requiredCategory)) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            Tato komponenta vyžaduje souhlas s kategorií "{requiredCategory}".
          </p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
  
  WithGDPRConsentComponent.displayName = `withGDPRConsent(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithGDPRConsentComponent;
};

/**
 * Component pro podmíněné renderování podle consent
 */
export const ConditionalRender = ({ 
  category, 
  children, 
  fallback = null,
  showFallbackMessage = true 
}) => {
  const { hasConsent, canLoadScript } = useGDPR();
  
  if (canLoadScript(category)) {
    return children;
  }
  
  if (fallback) {
    return fallback;
  }
  
  if (showFallbackMessage) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
        Obsah vyžaduje souhlas s kategorií "{category}".
      </div>
    );
  }
  
  return null;
};

export default GDPRProvider;