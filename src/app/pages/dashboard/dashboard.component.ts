import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { OrderSheet } from '../../models/order-sheet.model';
import { OrderStatus, translateOrderStatus } from '../../models/order-status.enum';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AgGridAngular, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  columnDefs: ColDef<OrderSheet>[] = [];
  rowData: OrderSheet[] = [];

  ngOnInit(): void {
    // Set data after view init to ensure bindings are live
    this.columnDefs = [
      { field: 'id', headerName: 'Bestelnummer' },
      { field: 'name', headerName: 'Naam' },
      { field: 'responsible', headerName: 'Verantwoordelijke' },
      { field: 'orderStatus', 
        headerName: 'Status', 
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [
            OrderStatus.Pending,
            OrderStatus.Processing,
            OrderStatus.Completed,
            OrderStatus.Cancelled
          ]
        }, valueFormatter: params => translateOrderStatus(params.value) }
    ];
  }
}
