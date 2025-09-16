import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common'; 
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from "./pages/footer/footer.component";
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgGridModule, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'magazijn-app';

  constructor(private auth: AuthService) {}

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated;
  }
}