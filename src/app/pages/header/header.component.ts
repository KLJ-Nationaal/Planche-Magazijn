import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated;
  }
}
