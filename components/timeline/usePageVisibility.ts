'use client';
import { useSyncExternalStore } from 'react';
const subscribe = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
const snapshot = () => document.visibilityState !== 'hidden';
/** Suspend the scene clock in a background tab without changing the user's play intent. */
export function usePageVisibility() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
