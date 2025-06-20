// app/layout.js
import { CookieConsent } from '@webnamiru/nextjs-gdpr';

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}