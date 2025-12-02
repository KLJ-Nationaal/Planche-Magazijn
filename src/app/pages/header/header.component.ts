import { Component } from '@angular/core';
import { AuthHttp } from '../../http/auth.http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 constructor(private auth: AuthHttp) {}

  logout() {
    this.auth.logout();
  }
}
