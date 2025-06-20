// jest.setup.js
// Jest setup pro GDPR template testing

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn(),
};

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'jest-test-user-agent',
});

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock environment variables
process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-ID';
process.env.NEXT_PUBLIC_FB_PIXEL_ID = 'FB-TEST-ID';
process.env.NEXT_PUBLIC_HOTJAR_ID = 'HJ-TEST-ID';
process.env.GDPR_ENCRYPTION_KEY = 'test-encryption-key';
process.env.GDPR_JWT_SECRET = 'test-jwt-secret';

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => {
      return 'test-uuid-' + Math.random().toString(36).substr(2, 9);
    }
  };
}

// Mock Date.now pro konzistentní testování
const mockDateNow = 1640995200000; // 2022-01-01 00:00:00 UTC
Date.now = jest.fn(() => mockDateNow);

// Global test utilities
global.createMockConsent = (overrides = {}) => ({
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  ...overrides
});

global.createMockUserData = (overrides = {}) => ({
  email: 'test@example.com',
  name: 'Test User',
  phone: '+420 123 456 789',
  createdAt: new Date().toISOString(),
  preferences: {
    newsletter: true,
    marketing: false
  },
  activityLog: [
    { action: 'login', timestamp: new Date().toISOString() },
    { action: 'page_view', timestamp: new Date().toISOString(), page: '/test' }
  ],
  ...overrides
});

global.mockGDPRResponse = (success = true, data = null, error = null) => ({
  success,
  data,
  error,
  requestId: crypto.randomUUID(),
  timestamp: new Date().toISOString()
});

// Mock fetch for API testing
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  // Reset localStorage mock
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Reset sessionStorage mock
  sessionStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Reset fetch mock
  fetch.mockClear();

  // Reset document.cookie
  document.cookie = '';

  // Clear any custom events
  window.removeEventListener = jest.fn();
  window.addEventListener = jest.fn();
  window.dispatchEvent = jest.fn();

  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Reset console methods (optional, for debugging)
  jest.clearAllMocks();
});

// Global timeout for async tests
jest.setTimeout(10000);

// Suppress console.error for expected error tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || 
       args[0].includes('Error:') ||
       args[0].includes('Failed prop type'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Custom matchers pro GDPR testing
expect.extend({
  toHaveValidConsent(received) {
    const requiredKeys = ['necessary', 'analytics', 'marketing', 'functional'];
    const pass = requiredKeys.every(key => 
      received.hasOwnProperty(key) && typeof received[key] === 'boolean'
    );

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid consent structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid consent structure with keys: ${requiredKeys.join(', ')}`,
        pass: false,
      };
    }
  },

  toHaveValidGDPRApiResponse(received) {
    const requiredKeys = ['success'];
    const pass = requiredKeys.every(key => received.hasOwnProperty(key));

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to have valid GDPR API response structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to have valid GDPR API response structure`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  }
});

// Debug helper pro development
if (process.env.NODE_ENV === 'development') {
  global.debugGDPR = (message, data) => {
    console.log(`[GDPR Test Debug] ${message}`, data);
  };
} else {
  global.debugGDPR = () => {}; // No-op v production testech
}