import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
 
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from "./pages/footer/footer.component";
import { AuthHttp } from './http/auth.http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgGridModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'magazijn-app';

  constructor(private auth: AuthHttp) {}

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated;
  }
}