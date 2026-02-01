import { Component } from '@angular/core';
import { AuthHttp } from '../../http/auth.http';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 constructor(private auth: AuthHttp, public theme: ThemeService) {}

  toggleTheme() {
    this.theme.toggle();
  }

  logout() {
    this.auth.logout();
  }
}
