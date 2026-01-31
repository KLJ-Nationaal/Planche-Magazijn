import { Component, inject, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItem } from '../../models/order-item.model';

@Component({
  selector: 'app-edit-order',
  imports: [ReactiveFormsModule, AgGridAngular],
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.css'
})
export class EditOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gridApi!: GridApi<OrderItem>;
  private orderService = inject(OrderService);  
  private currentRoute = inject(ActivatedRoute);
  private router = inject(Router);

  orderItems: OrderItem[] = []; 
  rowData: OrderItem[] = [];

  saving = false;
  errorMsg: string | null = null;
  loading = true;
  notFound = false;

  form = this.fb.group({
    id: this.fb.control<number | null>(null),
    name: this.fb.control({value: '', disabled: true}),
    goalActivity: this.fb.control('', [Validators.required]),
    timing: this.fb.control({ value: '', disabled: true }),
    location: this.fb.control({ value: '', disabled: true }),
    responsibleName: this.fb.control({value: '', disabled: true}),
    responsibleEmail: this.fb.control({value: '', disabled: true}),
    responsiblePhone: this.fb.control({value: '', disabled: true}),
    comment: this.fb.control('', { nonNullable: true }),
  });

  ngOnInit() {
    const id = (Number)(this.currentRoute.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
      this.form.patchValue(order);

      this.orderItems = order.orderItems ?? [];

      this.refreshGrid();
      this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notFound = err.status === 404;
      }
    });
  }

  hasError(path: string, err: string) {
    const ctrl = this.form.get(path);
    return !!ctrl && ctrl.touched && ctrl.hasError(err);
  }

  columnDefs: ColDef<OrderItem | any>[] = 
  [
    { 
      headerName: 'Nummer',
      width: 90,
      editable: false,
      sortable: false,
      filter: false,
      valueGetter: (p) => p.node?.rowPinned ? '' : ((p.node?.rowIndex ?? 0) + 1),
    },
    { field: 'name', headerName: 'Omschrijving materiaal', editable: true, minWidth: 160 },
    { field: 'amount', 
      headerName: 'Aantal', 
      editable: true, 
      width: 110,
      valueParser: params => {
        if (params.newValue == null) return null;
        const normalized = params.newValue.replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
      } 
    },
    { 
      field: 'unit', 
      headerName: 'Unit', 
      editable: true, 
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Stuks', 'Kilogram', 'Gram', 'Ton', 'Liter', 'Mililiter', 'Kilometer', 'Meter', 'Centimeter', 'Millimeter', 'Vierkante meter', 'Hectare', 'Kubiekemeter']
      },
      width: 140 
    },
    { 
      field: 'amountType', 
      headerName: 'Aantal per', 
      editable: true, 
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Per deelnemer', 'Totaal']
      },
      width: 140 
    },
    { field: 'remarks', headerName: 'Opmerkingen', editable: true, width: 200 },
    // Actions column: delete per row
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 110,
      editable: false,
      cellRenderer: (p: ICellRendererParams<OrderItem>) => {
        if (p.node?.rowPinned) return '';
        const btn = document.createElement('button');
        btn.type = 'button';  
        btn.className = 'icon-btn delete';
        btn.title = 'Rij verwijderen';
        btn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const item = p.data as OrderItem;

          if (!item.id || item.id === 0) {
            // New row → remove completely
            this.orderItems = this.orderItems.filter(i => i !== item);
          } else {
            // Existing row → soft delete
            item.deleted = true;
          }

          this.refreshGrid();
        });
        return btn;
      },
    },
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: true };

  onGridReady(e: GridReadyEvent<OrderItem>) {
    this.gridApi = e.api;
    this.refreshGrid(); 
  }

  addRow() {
    const blank: OrderItem = { id: 0, name: '', amount: null, unit: null, amountType: null, remarks: null };
    this.orderItems.push(blank);
    this.refreshGrid();

    let rowIndex = -1;
    this.gridApi.forEachNode((node, idx) => {
      if (node.data === blank) rowIndex = idx;
    });

    if (rowIndex >= 0) {
      this.gridApi.setFocusedCell(rowIndex, 'name');
      this.gridApi.startEditingCell({ rowIndex, colKey: 'name' });
    }
  }

  private getRows(): OrderItem[] {
    const rows: OrderItem[] = [];
    this.gridApi.forEachNode(n => { if (!n.rowPinned) rows.push(n.data as OrderItem); });
    return rows;
  }

  private refreshGrid() {
    this.rowData = this.orderItems.filter(i => !i.deleted); 
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  submit() {
    this.errorMsg = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.gridApi) {
      this.errorMsg = 'Grid is nog niet klaar.';
      return;
    }

    this.gridApi.stopEditing(); // commit in-progress edits
    const rows = this.getRows();
    if (rows.length === 0) {
      this.errorMsg = 'Voeg minstens één orderlijn toe.';
      return;
    }

    this.saving = true;

    // If you want the service to format timing, pass a Date as 3rd arg (or omit)
    this.orderService.saveOrder(this.form.getRawValue(), this.orderItems)
      .subscribe({
        next: res => {
          alert(`Order is opgeslagen...`);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error(err);
          this.errorMsg = err?.error?.title || err?.error?.message || 'Opslaan mislukt';
        },
        complete: () => { this.saving = false; }
      });
  }
}
