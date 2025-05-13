'use client';

import { useEffect } from 'react';

export function usePrintStyles(layout: string) {
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';

    style.innerHTML = `
      @page {
        ${layout === 'single' ? 'size: 10cm 10cm; margin: 0.5cm;' : ''}
      

      .print-label-container {
        ${layout === 'single' ? `
          width: 10cm;
          height: 10cm;
          margin: 0 auto;
          box-sizing: border-box;
        ` : `
        `}
      }

      .no-print {
        display: none !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [layout]);
}
