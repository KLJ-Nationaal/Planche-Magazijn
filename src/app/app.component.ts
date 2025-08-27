import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { HeaderComponent } from './pages/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgGridModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'magazijn-app';
}