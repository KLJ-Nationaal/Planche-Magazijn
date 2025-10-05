import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { catchError, map, mapTo, Observable, of, shareReplay, startWith } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { OrderSheet } from '../../models/order-sheet.model';
import { OrderStatus, translateOrderStatus } from '../../models/order-status.enum';
import { OrderHttp } from '../../http/order.http';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AgGridAngular, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private orderHttp = inject(OrderHttp);

  columnDefs: ColDef<OrderSheet>[] = [];
  // Expose an observable for the async pipe
  orders$!: Observable<OrderSheet[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  ngOnInit(): void {
    const statusValues = Object.values(OrderStatus); 

    // Set data after view init to ensure bindings are live
    this.columnDefs = [
      { field: 'id', headerName: 'Bestelnummer' },
      { field: 'name', headerName: 'Naam' },
      { field: 'responsible', headerName: 'Verantwoordelijke' },
      {
        field: 'orderStatus',
        headerName: 'Status',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: statusValues }, // UI shows options
        valueFormatter: p => translateOrderStatus(p.value as OrderStatus)
      }
    ];

    const request$ = this.orderHttp.me().pipe(
      shareReplay(1)
    );

    this.orders$ = request$.pipe(
      startWith<OrderSheet[]>([]),
      catchError(() => of<OrderSheet[]>([]))
    );

    // Simple loading & error signals for your template (optional)
    this.loading$ = this.orderHttp.me().pipe(
      map(() => false),
      startWith(true),
      catchError(() => of(false))
    );

    this.error$ = request$.pipe(
      mapTo<string | null>(null),
      startWith<string | null>(null),
      catchError(() => of<string | null>('Kon bestellingen niet laden.'))
    );
  }
}
