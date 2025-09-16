import { Injectable } from '@angular/core';
import packageInfo from '../../../package.json';

@Injectable({ providedIn: 'root' })
export class VersionService {
  readonly version = packageInfo.version;
}