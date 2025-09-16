import { Component } from '@angular/core';
import { buildInfo } from '../../../environments/version';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  buildInfo = buildInfo;
}
