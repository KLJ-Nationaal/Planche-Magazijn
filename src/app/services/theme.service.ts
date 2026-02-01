// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme';

  setDark(enabled: boolean) {
    document.documentElement.classList.toggle('app-dark', enabled);
    localStorage.setItem(this.key, enabled ? 'dark' : 'light');
  }

  toggle() {
    const isDark = document.documentElement.classList.contains('app-dark');
    this.setDark(!isDark);
  }

  init() {
    const saved = localStorage.getItem(this.key);
    this.setDark(saved === 'dark');
  }

  isDark(): boolean {
    return document.documentElement.classList.contains('app-dark');
  }
}
