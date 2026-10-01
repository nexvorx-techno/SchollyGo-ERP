'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+C for Create New
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        const createKeywords = [
          'Add New',
          'Create New',
          'Schedule New',
          'Assign Home Work',
          'Create First',
          'Create Exam',
          'Add Subject',
          'Ask Question',
          'Add Staff',
          'Add Student'
        ];

        // Find all buttons and links with class btn
        const btnElements = Array.from(document.querySelectorAll('.btn'));

        // Find the first button that matches one of the create keywords
        const targetBtn = btnElements.find(btn =>
          createKeywords.some(keyword => btn.textContent.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (targetBtn) {
          e.preventDefault();

          if (targetBtn.tagName.toLowerCase() === 'a' && targetBtn.getAttribute('href')) {
            router.push(targetBtn.getAttribute('href'));
          } else {
            targetBtn.click();
          }
        }
      }

      // Esc for Cancel
      if (e.key === 'Escape') {
        const btnElements = Array.from(document.querySelectorAll('.btn, button'));
        // Find all buttons that look like a cancel/close button and are visible, starting from the last (top-most modal)
        const cancelBtn = btnElements.reverse().find(btn => {
          const text = btn.textContent.trim().toLowerCase();
          const isCancelText = text === 'cancel' || text === 'close' || text.startsWith('back to') || text.startsWith('return to');
          const hasXIcon = btn.querySelector('svg.lucide-x') !== null;

          const isCancel = isCancelText || hasXIcon;
          const isVisible = btn.offsetWidth > 0 || btn.offsetHeight > 0;
          return isCancel && isVisible;
        });

        if (cancelBtn) {
          e.preventDefault();
          if (cancelBtn.tagName.toLowerCase() === 'a' && cancelBtn.getAttribute('href')) {
            router.push(cancelBtn.getAttribute('href'));
          } else {
            cancelBtn.click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
