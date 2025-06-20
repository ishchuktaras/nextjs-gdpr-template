// app/layout.js
import { Inter } from 'next/font/google';
import '../app/global.css';
import { GDPRProvider, CookieConsent } from '../components/gdpr';

// Nastavení fontu
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GDPR Ready App',
  description: 'Moderní aplikace s GDPR řešením',
};

export default function RootLayout({ children }) {
  return (
    // Použití fontu na celou aplikaci
    <html lang="cs" className={inter.className}>
      <body>
        <GDPRProvider>
          {children}
          <CookieConsent />
        </GDPRProvider>
      </body>
    </html>
  );
}