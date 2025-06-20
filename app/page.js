// app/page.js
'use client';

import { useCookieConsent } from '../hooks/useCookieConsent';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react'; // Doporučuji ikonky, např. lucide-react (npm install lucide-react)

export default function HomePage() {
  const { hasConsent } = useCookieConsent();

  return (
    // Celkové rozvržení s velkorysým paddingem
    <div className="bg-white text-gray-900">
      <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-12">
        {/* Hlavní kontejner s omezenou šířkou pro lepší čitelnost */}
        <div className="w-full max-w-2xl text-center">
          
          {/* Nadpis */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Stavíme web, který respektuje soukromí
          </h1>
          
          {/* Podnadpis/Popisek */}
          <p className="text-lg text-gray-600 mb-10">
            Tato šablona vám pomůže snadno implementovat GDPR a zároveň udržet moderní a čistý design.
          </p>

          {/* Hlavní Call-to-Action tlačítko */}
          <Link 
            href="/gdpr" 
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Spravovat mé souhlasy
            <ArrowRight size={20} />
          </Link>

          {/* Sekce se stavem souhlasu - čistá a strukturovaná */}
          <div className="mt-16 w-full max-w-md mx-auto rounded-lg border border-gray-200 bg-gray-50/50 p-6 text-left">
            <h2 className="text-lg font-semibold mb-4">Aktuální stav cookies</h2>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Nezbytné</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">✅ Vždy aktivní</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Analytické</span>
                {hasConsent('analytics') 
                  ? <span className="text-green-600 font-semibold">✓ Povoleno</span>
                  : <span className="text-gray-500">✗ Zakázáno</span>
                }
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Marketingové</span>
                {hasConsent('marketing') 
                  ? <span className="text-green-600 font-semibold">✓ Povoleno</span>
                  : <span className="text-gray-500">✗ Zakázáno</span>
                }
              </li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}