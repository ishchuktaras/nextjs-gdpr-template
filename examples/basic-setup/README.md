# Základní implementace

Nejjednodušší způsob implementace GDPR compliance:

```jsx
import { CookieConsent } from '../../components/gdpr';

export default function App() {
  return (
    <div>
      <h1>Moje aplikace</h1>
      <CookieConsent />
    </div>
  );
}
```

## Konfigurace

1. Zkopírujte `.env.example` jako `.env.local`
2. Vyplňte vaše Google Analytics ID
3. Přidejte odkazy na právní stránky
