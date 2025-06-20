# Installation Guide

## Rychlá instalace

1. Použijte tento repository jako template na GitHubu
2. Klonujte váš nový repository
3. Nainstalujte dependencies

```bash
npm install
```

## Implementace

### Next.js App Router

```jsx
// app/layout.js
import { CookieConsent } from '../components/gdpr';

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
```

### Konfigurace

```bash
cp .env.example .env.local
```

Vyplňte hodnoty podle vaší aplikace.

## Troubleshooting

- Zkontrolujte console pro chyby
- Ověřte import cesty
- Zkontrolujte environment variables
