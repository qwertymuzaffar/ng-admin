import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export const LOCAL_STORAGE = new InjectionToken('localStorage', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT, { optional: true });
    return (document?.defaultView?.localStorage as Storage) || null;
  },
});
