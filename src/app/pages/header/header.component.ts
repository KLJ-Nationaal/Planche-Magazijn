import { Component } from '@angular/core';
import { AuthService } from '../../http/auth.http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
