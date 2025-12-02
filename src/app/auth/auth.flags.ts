import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export const SKIP_REFRESH = new HttpContextToken<boolean>(() => false); // mark refresh requests
export const RETRIED = new HttpContextToken<boolean>(() => false);      // mark once-retried requests