# Next.js GDPR Compliance Template 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-13+-black.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)

Kompletní, production-ready GDPR implementace pro Next.js aplikace s fokusem na českou legislativu.

## ✨ Funkce

- 🍪 **Smart Cookie Consent** - Granulární kontrola kategorií cookies
- 🔒 **Uživatelská práva** - Export a smazání osobních údajů  
- ⚖️ **České právní šablony** - Připravené dokumenty pro GDPR compliance
- 🎨 **Moderní UI** - Responsivní komponenty s Tailwind CSS
- 🚀 **Zero config** - Plug & play integrace
- 📊 **Analytics ready** - Google Analytics, Facebook Pixel podpora
- 🌍 **Multijazyčnost** - Čeština, angličtina, ukrajinština

## 🚀 Rychlý start

### Instalace z template

1. Použijte tento repository jako template na GitHubu
2. Klonujte váš nový repository
3. Nainstalujte dependencies

```bash
npm install
```

### Základní implementace

```jsx
// app/layout.js
import { CookieConsent } from './components/gdpr';

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

## 📖 Dokumentace

- [Installation Guide](./docs/installation.md)
- [Configuration](./docs/configuration.md)
- [Legal Templates](./docs/legal-templates/)

## 🔧 Customizace

Všechny komponenty jsou plně customizovatelné a připravené pro production použití.

## 🤝 Přispívání

Příspěvky jsou vítány! Vytvořte Issue nebo Pull Request.

## 📄 Licence

MIT License

## ⭐ Autoři

Vytvořeno s ❤️ týmem [WEB NA MÍRU](https://webnamiru.site)

**⚠️ Právní upozornění:** Tato šablona poskytuje základ pro GDPR compliance, ale nenahrazuje právní poradenství.
