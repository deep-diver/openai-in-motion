'use client';
import { useEffect, type Dispatch, type SetStateAction } from 'react';

/** Discrete navigation with wheel accumulation and momentum suppression. */
export function useTimelineInput(
  setStep: Dispatch<SetStateAction<number>>,
  paused: boolean,
  total = 5,
) {
  useEffect(() => {
    if (paused) return;
    let sum = 0,
      lastWheel = 0,
      lastNavigation = -Infinity,
      touchY: number | null = null,
      touchX = 0;
    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest(
        'button,a,input,select,textarea,[role="slider"],[data-slot="slider"],[role="dialog"],[role="switch"],[role="combobox"],[role="spinbutton"],[data-annotation-scroll="true"],[contenteditable]:not([contenteditable="false"])',
      );
    const isEditing = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest(
        'input,select,textarea,[role="slider"],[data-slot="slider"],[role="dialog"],[role="switch"],[role="combobox"],[role="spinbutton"],[data-annotation-scroll="true"],[contenteditable]:not([contenteditable="false"])',
      );
    const pageOverflows = () =>
      document.documentElement.scrollHeight > window.innerHeight + 2;
    const move = (direction: number) => {
      setStep((current) =>
        Math.max(0, Math.min(total - 1, current + direction)),
      );
      lastNavigation = performance.now();
      sum = 0;
    };
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        isInteractive(event.target) ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      // A scrollable document must remain scrollable even over the large stage.
      if (window.innerWidth <= 700 || pageOverflows()) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (gap > 180) sum = 0;
      if (now - lastNavigation < 1100) return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);
      if (Math.sign(sum) !== Math.sign(delta)) sum = 0;
      sum += delta;
      if (Math.abs(sum) >= 70) move(Math.sign(sum));
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        isEditing(event.target) ||
        event.isComposing ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      // Preserve native page scrolling in mobile/short or enlarged layouts.
      if (
        pageOverflows() &&
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(
          event.key,
        )
      )
        return;
      if (
        [
          'ArrowRight',
          'ArrowDown',
          'PageDown',
          'ArrowLeft',
          'ArrowUp',
          'PageUp',
          'Home',
          'End',
        ].includes(event.key)
      ) {
        event.preventDefault();
        if (event.repeat) return;
        if (event.key === 'Home') setStep(0);
        else if (event.key === 'End') setStep(total - 1);
        else
          move(
            ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)
              ? 1
              : -1,
          );
      }
    };
    const touchStart = (event: TouchEvent) => {
      touchY = null;
      if (
        event.touches.length !== 1 ||
        isInteractive(event.target) ||
        !(event.target instanceof Element) ||
        !event.target.closest('.scene-view')
      )
        return;
      touchY = event.touches[0].clientY;
      touchX = event.touches[0].clientX;
    };
    const touchEnd = (event: TouchEvent) => {
      if (touchY === null || !event.changedTouches.length) return;
      const dy = touchY - event.changedTouches[0].clientY;
      const dx = touchX - event.changedTouches[0].clientX;
      touchY = null;
      if (
        Math.abs(dx) > 50 &&
        Math.abs(dx) > Math.abs(dy) * 1.4 &&
        performance.now() - lastNavigation > 750
      )
        move(Math.sign(dx));
    };
    const touchCancel = () => {
      touchY = null;
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', keyboard);
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchend', touchEnd, { passive: true });
    window.addEventListener('touchcancel', touchCancel, { passive: true });
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('touchcancel', touchCancel);
    };
  }, [setStep, paused, total]);
}
