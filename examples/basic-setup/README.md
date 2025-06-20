# Základní implementace GDPR

Tento příklad ukazuje nejjednodušší způsob implementace GDPR compliance do Next.js aplikace.

## 📁 Struktura

```
basic-setup/
├── README.md
├── layout.js           # App Router layout s GDPR
├── _app.js            # Pages Router setup
├── page.js            # Ukázková stránka
└── gdpr-page.js       # Stránka pro správu GDPR
```

## 🚀 Rychlý start

### 1. Zkopírujte komponenty

```bash
# Zkopírujte GDPR komponenty do vašeho projektu
cp -r ../../components/gdpr ./components/
cp -r ../../hooks ./
cp -r ../../lib/gdpr ./lib/
```

### 2. App Router (Next.js 13+)

```jsx
// app/layout.js
import { CookieConsent } from '../components/gdpr';
import './globals.css';

export const metadata = {
  title: 'Můj web s GDPR',
  description: 'Příklad implementace GDPR compliance'
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        {children}
        {/* GDPR Banner - automaticky se zobrazí novým návštěvníkům */}
        <CookieConsent 
          locale="cs"
          theme="modern"
          position="bottom"
        />
      </body>
    </html>
  );
}
```

### 3. Pages Router (Next.js 12)

```jsx
// pages/_app.js
import { CookieConsent } from '../components/gdpr';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <CookieConsent />
    </>
  );
}
```

### 4. Základní stránka s tracking

```jsx
// pages/index.js nebo app/page.js
'use client'; // Pouze pro App Router

import { useCookieConsent } from '../hooks/useCookieConsent';
import { useEffect } from 'react';

export default function HomePage() {
  const { hasConsent, trackEvent } = useCookieConsent();

  // Track page view pouze pokud má uživatel souhlas
  useEffect(() => {
    if (hasConsent('analytics')) {
      trackEvent('page_view', { page: 'homepage' });
    }
  }, [hasConsent, trackEvent]);

  const handleButtonClick = () => {
    // Track event pouze s consent
    trackEvent('button_click', { 
      button: 'cta',
      section: 'hero' 
    }, 'analytics');
    
    // Vaše business logika...
    alert('Děkujeme za klik!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Můj web s GDPR
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
            Vítejte na našem webu
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Tento web respektuje vaše soukromí a dodržuje GDPR.
          </p>

          <button
            onClick={handleButtonClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Vyzkoušet tracking
          </button>

          {/* Podmíněné zobrazení obsahu */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Vždy dostupné</h3>
              <p className="text-gray-600">
                Tento obsah je vždy dostupný bez ohledu na cookies.
              </p>
            </div>

            {hasConsent('analytics') ? (
              <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200">
                <h3 className="text-lg font-semibold mb-2 text-green-800">
                  Analytics aktive
                </h3>
                <p className="text-green-600">
                  Díky vašemu souhlasu můžeme vylepšovat tento web.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-600">
                  Analytics neaktivní
                </h3>
                <p className="text-gray-500">
                  Pro analytics potřebujeme váš souhlas.
                </p>
              </div>
            )}

            {hasConsent('marketing') ? (
              <div className="bg-purple-50 p-6 rounded-lg shadow border border-purple-200">
                <h3 className="text-lg font-semibold mb-2 text-purple-800">
                  Marketing aktivní
                </h3>
                <p className="text-purple-600">
                  Můžeme vám zobrazovat relevantní reklamy.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-600">
                  Marketing neaktivní
                </h3>
                <p className="text-gray-500">
                  Pro personalizované reklamy potřebujeme souhlas.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <p>Email: info@example.com</p>
              <p>Telefon: +420 123 456 789</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">GDPR</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/gdpr" className="hover:text-blue-300 transition-colors">
                    Správa osobních údajů
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="hover:text-blue-300 transition-colors">
                    Ochrana osobních údajů
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Stav cookies</h3>
              <div className="space-y-1 text-sm">
                <div>Analytics: {hasConsent('analytics') ? '✅' : '❌'}</div>
                <div>Marketing: {hasConsent('marketing') ? '✅' : '❌'}</div>
                <div>Funkční: {hasConsent('functional') ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Můj web. Všechna práva vyhrazena.</p>
            <p className="mt-2">
              GDPR template od{' '}
              <a href="https://webnamiru.site" className="text-blue-400 hover:text-blue-300">
                WEB NA MÍRU
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### 5. GDPR management stránka

```jsx
// pages/gdpr.js nebo app/gdpr/page.js
import { GDPRSettings } from '../components/gdpr';

export const metadata = {
  title: 'Správa osobních údajů | Můj web',
  description: 'Spravujte vaše osobní údaje a nastavení soukromí'
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GDPRSettings locale="cs" />
      </div>
    </div>
  );
}
```

## ⚙️ Konfigurace

### Environment variables (.env.local)

```bash
# Základní konfigurace
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME="Můj web"

# Analytics (volitelné)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789

# GDPR API keys (pro export/smazání dat)
GDPR_ENCRYPTION_KEY=your-32-character-secret-key
GDPR_JWT_SECRET=your-jwt-secret-key

# Email pro GDPR notifikace
BREVO_API_KEY=your-brevo-api-key
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password

# Právní kontakt
GDPR_CONTROLLER_NAME="Vaše jméno"
GDPR_CONTROLLER_EMAIL=gdpr@yourdomain.com
GDPR_CONTROLLER_PHONE="+420 xxx xxx xxx"
```

### Tailwind CSS

Přidejte do `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    // ... ostatní cesty
    './components/gdpr/**/*.{js,jsx}',
  ],
  // ... zbytek konfigurace
}
```

## 🧪 Testování

### Test cookie banner

1. Otevřete web v incognito režimu
2. Banner by se měl zobrazit automaticky po 1 sekundě
3. Vyzkoušejte různé kombinace souhlasu
4. Zkontrolujte localStorage: `cookie-consent`

### Test tracking

1. Otevřete Developer Tools → Console
2. Povolte analytics cookies
3. Klikněte na tlačítko "Vyzkoušet tracking"
4. V console by se měly zobrazit tracking eventy

### Test GDPR stránky

1. Přejděte na `/gdpr`
2. Vyzkoušejte export dat (test email)
3. Zkontrolujte změny cookie preferencí

## 🚀 Nasazení

### Vercel

```bash
# Nastavte environment variables ve Vercel dashboard
vercel env add GDPR_ENCRYPTION_KEY
vercel env add GDPR_JWT_SECRET
# ... ostatní proměnné

# Deploy
vercel --prod
```

### Netlify

```bash
# Přidejte environment variables do netlify.toml
# nebo v Netlify dashboard
netlify deploy --prod
```

## 🔍 Debugging

### Zapnutí debug módu

```jsx
<CookieConsent 
  debug={true} // Zobrazí debug informace v console
/>
```

### Sledování consent změn

```jsx
import { useCookieConsentListener } from '../hooks/useCookieConsent';

function MyComponent() {
  useCookieConsentListener((newConsent) => {
    console.log('Consent changed:', newConsent);
  });
  
  return <div>Komponenta sledující změny</div>;
}
```

## 📋 Checklist

Po implementaci zkontrolujte:

- [ ] Banner se zobrazuje novým návštěvníkům
- [ ] Consent se ukládá do localStorage
- [ ] Analytics se načítají pouze po souhlasu
- [ ] Tracking funguje správně
- [ ] GDPR stránka je dostupná
- [ ] Environment variables jsou nastaveny
- [ ] Legal stránky jsou vytvořeny

## 💡 Tipy

1. **Performance**: Banner se načítá asynchronně, neblokuje stránku
2. **SEO**: GDPR komponenty neovlivňují SEO, pokud jsou správně implementovány
3. **Accessibility**: Všechny komponenty podporují keyboard navigation
4. **Mobile**: Banner je plně responzivní

## 🆘 Řešení problémů

**Banner se nezobrazuje**
```javascript
// Zkontrolujte localStorage
console.log(localStorage.getItem('cookie-consent'));
// Mělo by být null pro nové návštěvníky
```

**Tracking nefunguje**
```javascript
// Zkontrolujte consent stav
import { useCookieConsent } from '../hooks/useCookieConsent';
const { consent } = useCookieConsent();
console.log('Current consent:', consent);
```

**Styling problémy**
```bash
# Ujistěte se, že Tailwind zahrnuje GDPR komponenty
npm run build
# Zkontrolujte CSS output
```

## 📞 Podpora

Potřebujete pomoč? Kontaktujte nás:

- 📧 **Email**: tech-podpora@webnamiru.site
- 🐛 **Issues**: [GitHub Issues](https://github.com/webnamiru/nextjs-gdpr-template/issues)
- 💬 **Discord**: [WEB NA MÍRU Community](https://discord.gg/webnamiru)

---

**🎉 Gratulujeme! Váš web je nyní GDPR compliant!** 🛡️