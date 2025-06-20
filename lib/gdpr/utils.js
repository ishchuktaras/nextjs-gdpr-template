// lib/gdpr/utils.js
// Utility funkce pro GDPR systém

import crypto from 'crypto';

/**
 * Konstanty pro GDPR systém
 */
export const GDPR_CONSTANTS = {
  STORAGE_KEYS: {
    CONSENT: 'cookie-consent',
    CONSENT_DATE: 'cookie-consent-date',
    CONSENT_VERSION: 'cookie-consent-version',
    USER_ID: 'gdpr-user-id'
  },
  
  EXPIRATION: {
    CONSENT_MONTHS: 12,
    VERIFICATION_TOKEN_HOURS: 24,
    DELETION_TOKEN_HOURS: 48
  },
  
  CATEGORIES: {
    NECESSARY: 'necessary',
    ANALYTICS: 'analytics', 
    MARKETING: 'marketing',
    FUNCTIONAL: 'functional'
  },
  
  LOCALES: ['cs', 'uk', 'en'],
  
  API_ENDPOINTS: {
    EXPORT: '/api/gdpr/export',
    DELETE: '/api/gdpr/delete-request',
    CONSENT: '/api/gdpr/consent'
  },
  
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100
  }
};

/**
 * Výchozí konfigurace pro consent
 */
export const DEFAULT_CONSENT_CONFIG = {
  locale: 'cs',
  theme: 'modern',
  position: 'bottom',
  autoShow: true,
  showAfterDelay: 1000,
  expirationDays: 365,
  showPoweredBy: true
};

/**
 * Generování zabezpečeného token pro verifikaci
 */
export const generateSecureToken = (data, secret, type = 'general') => {
  const timestamp = Date.now();
  const payload = `${data}:${timestamp}:${type}`;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `${hash}:${timestamp}`;
};

/**
 * Ověření security tokenu
 */
export const verifySecureToken = (token, data, secret, type = 'general', maxAgeHours = 24) => {
  try {
    const [hash, timestamp] = token.split(':');
    const payload = `${data}:${timestamp}:${type}`;
    
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const isHashValid = hash === expectedHash;
    const isNotExpired = (Date.now() - parseInt(timestamp)) < (maxAgeHours * 60 * 60 * 1000);
    
    return isHashValid && isNotExpired;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

/**
 * Validace emailové adresy
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email je povinný' };
  }
  
  if (!GDPR_CONSTANTS.VALIDATION.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Neplatný formát emailu' };
  }
  
  return { valid: true };
};

/**
 * Validace jména
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Jméno je povinné' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < GDPR_CONSTANTS.VALIDATION.NAME_MIN_LENGTH) {
    return { valid: false, error: 'Jméno je příliš krátké' };
  }
  
  if (trimmedName.length > GDPR_CONSTANTS.VALIDATION.NAME_MAX_LENGTH) {
    return { valid: false, error: 'Jméno je příliš dlouhé' };
  }
  
  return { valid: true };
};

/**
 * Validace telefonního čísla (Czech format)
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: true }; // Phone je optional
  }
  
  if (!GDPR_CONSTANTS.VALIDATION.PHONE_REGEX.test(phone)) {
    return { valid: false, error: 'Neplatný formát telefonu' };
  }
  
  return { valid: true };
};

/**
 * Kompletní validace GDPR formuláře
 */
export const validateGDPRForm = (formData) => {
  const errors = {};
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }
  
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizace uživatelského vstupu
 */
export const sanitizeInput = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Základní XSS ochrana
    .replace(/\s+/g, ' '); // Normalizace whitespace
};

/**
 * Anonymizace emailu pro logy
 */
export const anonymizeEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  
  const [local, domain] = email.split('@');
  const anonymizedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '***';
  
  return `${anonymizedLocal}@${domain}`;
};

/**
 * Anonymizace IP adresy
 */
export const anonymizeIP = (ip) => {
  if (!ip) return '***';
  
  if (ip.includes(':')) {
    // IPv6
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':****';
  } else {
    // IPv4  
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.') + '.***';
  }
};

/**
 * Generování CSV exportu uživatelských dat
 */
export const generateUserDataCSV = (userData) => {
  const csvRows = [
    ['Kategorie', 'Pole', 'Hodnota', 'Datum vytvoření', 'Poznámka']
  ];
  
  // Základní údaje
  if (userData.email) {
    csvRows.push(['Základní údaje', 'Email', userData.email, userData.createdAt || new Date().toISOString(), 'Identifikátor']);
  }
  
  if (userData.name) {
    csvRows.push(['Základní údaje', 'Jméno', userData.name, userData.createdAt || new Date().toISOString(), 'Osobní údaj']);
  }
  
  if (userData.phone) {
    csvRows.push(['Základní údaje', 'Telefon', userData.phone, userData.createdAt || new Date().toISOString(), 'Kontaktní údaj']);
  }
  
  // Consent údaje
  if (userData.consent) {
    Object.entries(userData.consent).forEach(([category, value]) => {
      csvRows.push(['Consent', `Souhlas ${category}`, value ? 'Ano' : 'Ne', userData.consentDate || new Date().toISOString(), 'GDPR souhlas']);
    });
  }
  
  // Activity log
  if (userData.activityLog && Array.isArray(userData.activityLog)) {
    userData.activityLog.forEach(activity => {
      csvRows.push([
        'Aktivita',
        activity.action || 'Neznámá akce',
        activity.details || activity.page || activity.form || 'N/A',
        activity.timestamp || new Date().toISOString(),
        'Log aktivity'
      ]);
    });
  }
  
  // Preferences
  if (userData.preferences) {
    Object.entries(userData.preferences).forEach(([key, value]) => {
      csvRows.push(['Předvolby', key, String(value), userData.createdAt || new Date().toISOString(), 'Uživatelské nastavení']);
    });
  }
  
  // Konverze na CSV string
  return csvRows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

/**
 * Generování reportu o GDPR compliance
 */
export const generateConsentReport = (consentData) => {
  const report = {
    timestamp: new Date().toISOString(),
    consentStatus: consentData.preferences || {},
    metadata: consentData.metadata || {},
    issues: [],
    recommendations: [],
    score: 0
  };
  
  let scorePoints = 0;
  const maxPoints = 10;
  
  // Zkontroluj, zda má uživatel platný consent
  if (consentData.preferences) {
    scorePoints += 3;
  } else {
    report.issues.push({
      severity: 'high',
      category: 'consent',
      description: 'Uživatel nemá uložený consent',
      fix: 'Zobrazit consent banner'
    });
  }
  
  // Zkontroluj metadata
  if (consentData.metadata && consentData.metadata.timestamp) {
    const consentAge = Date.now() - new Date(consentData.metadata.timestamp).getTime();
    const twelveMonths = 12 * 30 * 24 * 60 * 60 * 1000;
    
    if (consentAge < twelveMonths) {
      scorePoints += 2;
    } else {
      report.issues.push({
        severity: 'medium',
        category: 'expiration',
        description: 'Consent je starší než 12 měsíců',
        fix: 'Obnovit consent uživatele'
      });
    }
  }
  
  // Zkontroluj načtené skripty
  const loadedScripts = getLoadedScripts();
  const unauthorizedScripts = loadedScripts.filter(script => 
    !hasConsentForScript(script, consentData.preferences)
  );
  
  if (unauthorizedScripts.length === 0) {
    scorePoints += 3;
  } else {
    report.issues.push({
      severity: 'critical',
      category: 'unauthorized_scripts',
      description: `${unauthorizedScripts.length} skriptů načteno bez souhlasu`,
      fix: 'Zkontrolovat podmíněné načítání skriptů'
    });
  }
  
  // Zkontroluj localStorage/cookies
  const cookies = getCookiesByCategory();
  Object.entries(cookies).forEach(([category, cookieList]) => {
    if (category !== 'necessary' && !consentData.preferences[category] && cookieList.length > 0) {
      report.issues.push({
        severity: 'high',
        category: 'unauthorized_cookies',
        description: `Cookies kategorie ${category} bez souhlasu`,
        fix: `Smazat nebo anonymizovat cookies kategorie ${category}`
      });
    }
  });
  
  // Doporučení
  if (scorePoints < maxPoints) {
    scorePoints += 2;
    report.recommendations.push('Implementovat pravidelný GDPR audit');
    report.recommendations.push('Přidat monitoring consent událostí');
  }
  
  report.score = Math.round((scorePoints / maxPoints) * 100);
  
  return report;
};

/**
 * Helper funkce pro detekci načtených skriptů
 */
const getLoadedScripts = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  return scripts.map(script => ({
    src: script.src,
    category: getScriptCategory(script.src)
  }));
};

/**
 * Určení kategorie skriptu podle URL
 */
const getScriptCategory = (src) => {
  if (src.includes('googletagmanager') || src.includes('google-analytics')) {
    return 'analytics';
  }
  if (src.includes('facebook.net') || src.includes('fbevents')) {
    return 'marketing';
  }
  if (src.includes('hotjar') || src.includes('intercom') || src.includes('zendesk')) {
    return 'functional';
  }
  return 'necessary';
};

/**
 * Kontrola, zda má uživatel souhlas pro konkrétní script
 */
const hasConsentForScript = (script, preferences) => {
  if (!preferences) return false;
  if (script.category === 'necessary') return true;
  return preferences[script.category] === true;
};

/**
 * Získání cookies podle kategorií
 */
const getCookiesByCategory = () => {
  const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
  const categorized = {
    necessary: [],
    analytics: [],
    marketing: [],
    functional: []
  };
  
  allCookies.forEach(cookie => {
    const [name] = cookie.split('=');
    const category = getCookieCategory(name);
    if (categorized[category]) {
      categorized[category].push(name);
    }
  });
  
  return categorized;
};

/**
 * Určení kategorie cookie podle názvu
 */
const getCookieCategory = (cookieName) => {
  // Google Analytics
  if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid') || cookieName.startsWith('_gat')) {
    return 'analytics';
  }
  
  // Facebook
  if (cookieName.startsWith('_fb') || cookieName.includes('facebook')) {
    return 'marketing';
  }
  
  // Hotjar
  if (cookieName.startsWith('_hj')) {
    return 'functional';
  }
  
  // Session cookies a GDPR related
  if (['PHPSESSID', 'JSESSIONID', 'cookie-consent', 'cookie-consent-date'].includes(cookieName)) {
    return 'necessary';
  }
  
  return 'necessary'; // Default fallback
};

/**
 * Audit GDPR compliance
 */
export const validateGDPRCompliance = () => {
  const consent = JSON.parse(localStorage.getItem(GDPR_CONSTANTS.STORAGE_KEYS.CONSENT) || 'null');
  const consentDate = localStorage.getItem(GDPR_CONSTANTS.STORAGE_KEYS.CONSENT_DATE);
  
  const report = generateConsentReport({
    preferences: consent,
    metadata: {
      timestamp: consentDate,
      userAgent: navigator.userAgent,
      method: 'validation'
    }
  });
  
  // Log do konzole pro development
  if (process.env.NODE_ENV === 'development') {
    console.group('🛡️ GDPR Compliance Report');
    console.log('Score:', report.score + '%');
    console.log('Issues:', report.issues);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();
  }
  
  return report;
};

/**
 * Export všech uživatelských dat
 */
export const exportUserData = async (userData) => {
  const csvData = generateUserDataCSV(userData);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // Vytvoření download linku
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `osobni-udaje-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

/**
 * Anonymizace dat uživatele (pro interní použití)
 */
export const anonymizeData = (userData) => {
  return {
    ...userData,
    email: anonymizeEmail(userData.email),
    name: userData.name ? userData.name[0] + '*'.repeat(userData.name.length - 1) : null,
    phone: userData.phone ? userData.phone.slice(0, 4) + '***' + userData.phone.slice(-3) : null,
    ip: userData.ip ? anonymizeIP(userData.ip) : null
  };
};

export default {
  GDPR_CONSTANTS,
  DEFAULT_CONSENT_CONFIG,
  generateSecureToken,
  verifySecureToken,
  validateEmail,
  validateName,
  validatePhone,
  validateGDPRForm,
  sanitizeInput,
  anonymizeEmail,
  anonymizeIP,
  generateUserDataCSV,
  generateConsentReport,
  validateGDPRCompliance,
  exportUserData,
  anonymizeData
};