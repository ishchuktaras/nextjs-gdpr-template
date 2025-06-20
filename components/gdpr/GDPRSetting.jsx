'use client';

import { useState } from 'react';
import { Download, Trash2, Settings, Shield, AlertTriangle, CheckCircle, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

const GDPRSettings = ({ locale = 'cs' }) => {
  const { consent, updateConsent, clearConsent } = useCookieConsent();
  const [activeTab, setActiveTab] = useState('cookies');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showExportForm, setShowExportForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', phone: '' });

  const texts = {
    cs: {
      title: "Správa osobních údajů a soukromí",
      subtitle: "Spravujte vaše osobní údaje a nastavení soukromí podle GDPR",
      
      // Tagy
      cookies: "Cookies",
      dataRights: "Práva k datům",
      contact: "Kontakt",
      
      // Cookies sekce
      cookiesTitle: "Nastavení cookies",
      cookiesDesc: "Upravte vaše preference pro používání cookies na našich webových stránkách",
      currentSettings: "Současné nastavení",
      enabled: "Povolené",
      disabled: "Zakázané",
      resetCookies: "Resetovat nastavení cookies",
      cookiesReset: "Nastavení cookies bylo resetováno",
      
      // Data rights sekce
      dataRightsTitle: "Vaše práva podle GDPR",
      dataRightsDesc: "Uplatněte vaše práva na přístup, opravu nebo smazání osobních údajů",
      
      exportTitle: "Export osobních údajů",
      exportDesc: "Získejte kopii všech osobních údajů, které o vás zpracováváme",
      exportBtn: "Požádat o export dat",
      exportEmail: "Email pro zaslání dat",
      exportName: "Vaše jméno",
      exportPhone: "Telefon (volitelné)",
      exportSubmit: "Odeslat žádost o export",
      exportCancel: "Zrušit",
      exportSuccess: "Žádost o export byla odeslána na váš email",
      
      deleteTitle: "Smazání osobních údajů",
      deleteDesc: "Požádejte o smazání všech vašich osobních údajů. Tato akce je nevratná",
      deleteBtn: "Požádat o smazání dat",
      deleteWarning: "UPOZORNĚNÍ: Smazání dat je nevratné. Ztratíte přístup k vašemu účtu a všem souvisejícím službám.",
      deleteSubmit: "Odeslat žádost o smazání",
      deleteSuccess: "Žádost o smazání byla odeslána. Budeme vás kontaktovat do 30 dnů",
      
      // Kontakt sekce
      contactTitle: "Kontakt pro GDPR",
      contactDesc: "Kontaktní informace pro otázky týkající se zpracování osobních údajů",
      controller: "Správce osobních údajů",
      email: "Email",
      phone: "Telefon",
      address: "Adresa",
      ico: "IČO",
      
      // Obecné
      required: "povinné",
      processing: "Zpracováváme...",
      error: "Nastala chyba při zpracování požadavku",
      
      // Kategorie cookies
      necessary: "Nezbytné",
      analytics: "Analytické", 
      marketing: "Marketingové",
      functional: "Funkční"
    },
    
    uk: {
      title: "Управління персональними даними та приватністю",
      subtitle: "Керуйте вашими персональними даними та налаштуваннями приватності згідно з GDPR",
      
      cookies: "Cookies",
      dataRights: "Права на дані",
      contact: "Контакт",
      
      cookiesTitle: "Налаштування cookies",
      cookiesDesc: "Змініть ваші уподобання щодо використання cookies на наших веб-сайтах",
      currentSettings: "Поточні налаштування",
      enabled: "Увімкнено",
      disabled: "Вимкнено",
      resetCookies: "Скинути налаштування cookies",
      cookiesReset: "Налаштування cookies було скинуто",
      
      dataRightsTitle: "Ваші права згідно з GDPR",
      dataRightsDesc: "Реалізуйте ваші права на доступ, виправлення або видалення персональних даних",
      
      exportTitle: "Експорт персональних даних",
      exportDesc: "Отримайте копію всіх персональних даних, які ми про вас обробляємо",
      exportBtn: "Запросити експорт даних",
      exportEmail: "Email для надсилання даних",
      exportName: "Ваше ім'я",
      exportPhone: "Телефон (необов'язково)",
      exportSubmit: "Надіслати запит на експорт",
      exportCancel: "Скасувати",
      exportSuccess: "Запит на експорт надіслано на ваш email",
      
      deleteTitle: "Видалення персональних даних",
      deleteDesc: "Запросіть видалення всіх ваших персональних даних. Ця дія незворотна",
      deleteBtn: "Запросити видалення даних",
      deleteWarning: "УВАГА: Видалення даних незворотне. Ви втратите доступ до вашого акаунту та всіх пов'язаних послуг.",
      deleteSubmit: "Надіслати запит на видалення",
      deleteSuccess: "Запит на видалення надіслано. Ми зв'яжемося з вами протягом 30 днів",
      
      contactTitle: "Контакт для GDPR",
      contactDesc: "Контактна інформація для питань щодо обробки персональних даних",
      controller: "Контролер персональних даних",
      email: "Email",
      phone: "Телефон",
      address: "Адреса",
      ico: "IČO",
      
      required: "обов'язково",
      processing: "Обробляємо...",
      error: "Виникла помилка при обробці запиту",
      
      necessary: "Необхідні",
      analytics: "Аналітичні",
      marketing: "Маркетингові",
      functional: "Функціональні"
    }
  };

  const t = texts[locale] || texts.cs;

  const handleExportData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(t.exportSuccess);
        setShowExportForm(false);
        setFormData({ email: '', name: '', phone: '' });
      } else {
        setMessage(data.error || t.error);
      }
    } catch (error) {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/gdpr/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(t.deleteSuccess);
        setShowDeleteForm(false);
        setFormData({ email: '', name: '', phone: '' });
      } else {
        setMessage(data.error || t.error);
      }
    } catch (error) {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCookies = () => {
    clearConsent();
    setMessage(t.cookiesReset);
    // Banner se zobrazí automaticky po clearConsent
  };

  const categoryInfo = {
    necessary: { icon: Shield, color: 'text-green-600' },
    analytics: { icon: Download, color: 'text-blue-600' },
    marketing: { icon: ExternalLink, color: 'text-purple-600' },
    functional: { icon: Settings, color: 'text-orange-600' }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-blue-600" size={20} />
          <span className="text-blue-800">{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: 'cookies', label: t.cookies, icon: Settings },
          { id: 'rights', label: t.dataRights, icon: Shield },
          { id: 'contact', label: t.contact, icon: Mail }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'cookies' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t.cookiesTitle}</h2>
            <p className="text-gray-600 mb-6">{t.cookiesDesc}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">{t.currentSettings}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consent && Object.entries(consent).map(([category, enabled]) => {
                const info = categoryInfo[category];
                const Icon = info?.icon || Settings;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Icon className={info?.color || 'text-gray-600'} size={20} />
                      <span className="font-medium">{t[category]}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {enabled ? t.enabled : t.disabled}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={handleResetCookies}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              {t.resetCookies}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rights' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t.dataRightsTitle}</h2>
            <p className="text-gray-600 mb-6">{t.dataRightsDesc}</p>
          </div>

          {/* Export dat */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <Download className="text-blue-600 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-medium mb-2">{t.exportTitle}</h3>
                <p className="text-gray-600 mb-4">{t.exportDesc}</p>
                
                {!showExportForm ? (
                  <button
                    onClick={() => setShowExportForm(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t.exportBtn}
                  </button>
                ) : (
                  <form onSubmit={handleExportData} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.exportEmail} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="vas.email@firma.cz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.exportName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Vaše jméno"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.exportPhone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+420 xxx xxx xxx"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? t.processing : t.exportSubmit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowExportForm(false);
                          setFormData({ email: '', name: '', phone: '' });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        {t.exportCancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Smazání dat */}
          <div className="border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <Trash2 className="text-red-600 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-medium mb-2">{t.deleteTitle}</h3>
                <p className="text-gray-600 mb-4">{t.deleteDesc}</p>
                
                {!showDeleteForm ? (
                  <button
                    onClick={() => setShowDeleteForm(true)}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {t.deleteBtn}
                  </button>
                ) : (
                  <form onSubmit={handleDeleteData} className="space-y-4 max-w-md">
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        <span className="font-medium text-red-800">UPOZORNĚNÍ</span>
                      </div>
                      <p className="text-red-700 text-sm">{t.deleteWarning}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.exportEmail} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="vas.email@firma.cz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.exportName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Vaše jméno"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? t.processing : t.deleteSubmit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteForm(false);
                          setFormData({ email: '', name: '', phone: '' });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        {t.exportCancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t.contactTitle}</h2>
            <p className="text-gray-600 mb-6">{t.contactDesc}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">{t.controller}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-600" size={20} />
                <div>
                  <span className="font-medium">{t.email}:</span>
                  <a href="mailto:gdpr@webnamiru.site" className="ml-2 text-blue-600 hover:underline">
                    gdpr@webnamiru.site
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-gray-600" size={20} />
                <div>
                  <span className="font-medium">{t.phone}:</span>
                  <a href="tel:+420777596216" className="ml-2 text-blue-600 hover:underline">
                    +420 777596216
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-600" size={20} />
                <div>
                  <span className="font-medium">{t.address}:</span>
                  <span className="ml-2">Jihlava, Kraj Vysočina</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ExternalLink className="text-gray-600" size={20} />
                <div>
                  <span className="font-medium">{t.ico}:</span>
                  <span className="ml-2">19632831</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDPRSettings;