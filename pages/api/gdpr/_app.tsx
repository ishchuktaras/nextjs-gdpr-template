// pages/_app.tsx
import type { AppProps } from 'next/app';
import { GDPRProvider, CookieConsent } from '../../../components/gdpr/GDPRProvider';
// import '../styles/globals.css'; // Pokud máte global styles

// Správné použití - importujeme komponenty jako hodnoty, ne jako typy
export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <GDPRProvider>
      <Component {...pageProps} />
      <CookieConsent />
    </GDPRProvider>
  );
}

// Pokud byste potřebovali typy pro props, použijte:
// import type { GDPRProviderProps } from '../types/gdpr';

// Nebo pokud byste potřebovali typeof:
type MyGDPRProviderType = typeof GDPRProvider;