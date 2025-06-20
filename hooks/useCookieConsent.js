'use client';

import { useState, useEffect } from 'react';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    }
    setLoading(false);
  }, []);

  const updateConsent = (newConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setConsent(newConsent);
  };

  const hasConsent = (category) => {
    return consent?.[category] || false;
  };

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent');
    setConsent(null);
  };

  return {
    consent,
    loading,
    updateConsent,
    hasConsent,
    clearConsent
  };
};
