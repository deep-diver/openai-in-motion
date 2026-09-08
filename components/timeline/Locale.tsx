'use client';
import { createContext, useContext } from 'react';
import type { Locale } from '@/data/localization';
export const LocaleContext = createContext<Locale>('ko');
export function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, t: (ko: string, en: string) => (locale === 'en' ? en : ko) };
}
export function SceneLoader() {
  const { t } = useLocale();
  return (
    <div className="scene-loader">
      {t('다음 이야기를 준비하는 중…', 'Preparing the next story…')}
    </div>
  );
}
