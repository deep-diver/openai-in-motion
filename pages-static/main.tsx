import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import './fonts.css';

const History = lazy(() => import('../components/timeline/HistoryExperience'));
const route = document.documentElement.dataset.route;
createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<p style={{ padding: '2rem' }}>Loading…</p>}>
    <History initialLocale={route === 'en' ? 'en' : 'ko'} />
  </Suspense>,
);
