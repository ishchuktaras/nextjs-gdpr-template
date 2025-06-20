// components/gdpr/index.js
// Hlavní export soubor pro všechny GDPR komponenty

// Hlavní komponenty
export { default as CookieConsent } from './CookieConsent';
export { default as GDPRSettings } from './GDPRSettings';

// Hooks
export { 
  useCookieConsent, 
  useCookieConsentListener, 
  useConditionalScript 
} from '../../hooks/useCookieConsent';

// Utility funkce
export { 
  generateConsentReport,
  validateGDPRCompliance,
  anonymizeData,
  exportUserData
} from '../../lib/gdpr/utils';

// TypeScript typy (pokud používáte TS)
export type {
  ConsentPreferences,
  GDPRSettings as GDPRSettingsType,
  DataExportRequest,
  DataDeletionRequest,
  ConsentEvent
} from '../../types/gdpr';

// Re-export všech hooks
export * from '../../hooks/useCookieConsent';

// Provider komponenta pro context
export { default as GDPRProvider } from './GDPRProvider';

// Konstanty a konfigurace
export { GDPR_CONSTANTS, DEFAULT_CONSENT_CONFIG } from '../../lib/gdpr/constants';