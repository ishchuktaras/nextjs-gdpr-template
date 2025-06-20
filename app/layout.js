// app/layout.js
import { CookieConsent, GDPRProvider } from '../components/gdpr';
// nebo: import { CookieConsent, GDPRProvider } from '@webnamiru/nextjs-gdpr';

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <GDPRProvider 
          config={{
            locale: 'cs',
            theme: 'modern',
            autoShow: true
          }}
        >
          {children}
          <CookieConsent />
        </GDPRProvider>
      </body>
    </html>
  );
}