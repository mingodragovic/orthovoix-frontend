// src/providers/I18nProvider.tsx
import { IntlProvider } from 'react-intl';
import { ReactNode, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

// Import messages
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';
import arMessages from '@/messages/ar.json';

const messages: Record<string, any> = {
  fr: frMessages,
  en: enMessages,
  ar: arMessages,
};

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { language } = useLanguage();
  const [key, setKey] = useState(language);

  // Force re-render when language changes
  useEffect(() => {
    console.log('🔄 I18nProvider: language changed to', language);
    setKey(`${language}-${Date.now()}`);
  }, [language]);

  console.log('🔄 I18nProvider rendering with language:', language, 'key:', key);

  return (
    <IntlProvider
      key={key}
      locale={language}
      messages={messages[language] || messages.fr}
      defaultLocale="fr"
      onError={(err) => {
        if (import.meta.env.MODE === 'development') {
          console.warn('⚠️ Translation missing:', err);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
}