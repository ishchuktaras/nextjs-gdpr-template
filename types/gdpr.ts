// types/gdpr.ts
// TypeScript definice pro GDPR systém

/**
 * Základní typy pro consent management
 */
export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export type ConsentCategory = keyof ConsentPreferences;

export interface ConsentMetadata {
  timestamp: string;
  version: string;
  userAgent?: string;
  ipAddress?: string;
  method: 'banner' | 'settings' | 'api';
}

export interface ConsentRecord {
  preferences: ConsentPreferences;
  metadata: ConsentMetadata;
}

/**
 * Konfigurace pro CookieConsent komponentu
 */
export interface CookieConsentConfig {
  locale?: 'cs' | 'uk' | 'en';
  theme?: 'modern' | 'dark' | 'glass' | 'minimal';
  position?: 'bottom' | 'top' | 'center';
  autoShow?: boolean;
  showAfterDelay?: number;
  expirationDays?: number;
  onConsentChange?: (consent: ConsentPreferences) => void;
  onBannerShow?: () => void;
  onBannerHide?: () => void;
  customTexts?: Partial<ConsentTexts>;
  showPoweredBy?: boolean;
}

export interface ConsentTexts {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  saveSettings: string;
  necessary: CategoryTexts;
  analytics: CategoryTexts;
  marketing: CategoryTexts;
  functional: CategoryTexts;
}

export interface CategoryTexts {
  title: string;
  description: string;
}

/**
 * GDPR Settings komponenta
 */
export interface GDPRSettings {
  showCookies?: boolean;
  showDataRights?: boolean;
  showContact?: boolean;
  allowDataExport?: boolean;
  allowDataDeletion?: boolean;
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  controllerName: string;
  email: string;
  phone?: string;
  address?: string;
  ico?: string;
  website?: string;
}

/**
 * Data export/deletion requests
 */
export interface DataExportRequest {
  email: string;
  name: string;
  phone?: string;
  requestType: 'export';
  timestamp: string;
  status: RequestStatus;
  verificationToken?: string;
}

export interface DataDeletionRequest {
  email: string;
  name: string;
  phone?: string;
  requestType: 'deletion';
  timestamp: string;
  status: RequestStatus;
  verificationToken?: string;
  confirmationRequired: boolean;
}

export type RequestStatus = 
  | 'pending' 
  | 'verified' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'expired';

/**
 * Event tracking
 */
export interface ConsentEvent {
  type: 'consent_given' | 'consent_updated' | 'consent_withdrawn' | 'banner_shown' | 'settings_opened';
  category?: ConsentCategory;
  preferences?: ConsentPreferences;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TrackingEvent {
  name: string;
  parameters?: Record<string, any>;
  category: ConsentCategory;
  requiresConsent: boolean;
}

/**
 * Script loading
 */
export interface ScriptConfig {
  src: string;
  category: ConsentCategory;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  attributes?: Record<string, string>;
}

export interface LoadedScript {
  src: string;
  category: ConsentCategory;
  loaded: boolean;
  error?: Error;
  element?: HTMLScriptElement;
}

/**
 * Audit a reporting
 */
export interface ComplianceAudit {
  timestamp: string;
  consentStatus: ConsentPreferences;
  loadedScripts: LoadedScript[];
  issues: ComplianceIssue[];
  score: number;
  recommendations: string[];
}

export interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  fix?: string;
}

/**
 * Data processing records
 */
export interface ProcessingRecord {
  purpose: string;
  legalBasis: LegalBasis;
  categories: DataCategory[];
  retention: RetentionPeriod;
  recipients?: string[];
  transfers?: DataTransfer[];
}

export type LegalBasis = 
  | 'consent' 
  | 'contract' 
  | 'legal_obligation' 
  | 'vital_interests' 
  | 'public_task' 
  | 'legitimate_interests';

export type DataCategory = 
  | 'personal_identifiers' 
  | 'contact_details' 
  | 'behavioral_data' 
  | 'technical_data' 
  | 'preference_data';

export interface RetentionPeriod {
  duration: number;
  unit: 'days' | 'months' | 'years';
  description: string;
}

export interface DataTransfer {
  country: string;
  safeguards: string;
  adequacyDecision?: boolean;
}

/**
 * API Response typy
 */
export interface GDPRApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requestId?: string;
}

export interface ExportApiResponse extends GDPRApiResponse {
  exportId?: string;
  estimatedCompletion?: string;
}

export interface DeletionApiResponse extends GDPRApiResponse {
  deletionId?: string;
  confirmationRequired?: boolean;
  verificationMethod?: string;
}

/**
 * Provider context
 */
export interface GDPRContextValue {
  consent: ConsentPreferences | null;
  loading: boolean;
  hasInteracted: boolean;
  updateConsent: (preferences: ConsentPreferences) => void;
  hasConsent: (category: ConsentCategory) => boolean;
  canLoadScript: (category: ConsentCategory) => boolean;
  clearConsent: () => void;
  trackEvent: (name: string, parameters?: Record<string, any>, category?: ConsentCategory) => void;
  showBanner: () => void;
  hideBanner: () => void;
  openSettings: () => void;
}

/**
 * Utility types
 */
export type ConsentChangeHandler = (preferences: ConsentPreferences) => void;
export type ConsentEventHandler = (event: ConsentEvent) => void;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Validace schémata (pro runtime validaci)
 */
export interface ValidationSchema {
  email: RegExp;
  phone: RegExp;
  name: {
    minLength: number;
    maxLength: number;
  };
  consent: {
    categories: ConsentCategory[];
    required: ConsentCategory[];
  };
}

/**
 * Konfigurace pro různé prostředí
 */
export interface EnvironmentConfig {
  development: {
    debug: boolean;
    mockApi: boolean;
    showDebugPanel: boolean;
  };
  production: {
    debug: boolean;
    analytics: {
      enableGA: boolean;
      enableFB: boolean;
      enableHotjar: boolean;
    };
  };
}

/**
 * Error typy
 */
export class GDPRError extends Error {
  constructor(
    message: string,
    public code: string,
    public category: 'consent' | 'api' | 'validation' | 'script_loading'
  ) {
    super(message);
    this.name = 'GDPRError';
  }
}

export interface ErrorReport {
  error: GDPRError;
  timestamp: string;
  context: Record<string, any>;
  userAgent: string;
  url: string;
}