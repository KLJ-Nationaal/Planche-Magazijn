import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute } from '@angular/router';
import { OrderItem } from '../../models/order-item.model';

@Component({
  selector: 'app-edit-order',
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.css'
})
export class EditOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gridApi!: GridApi<OrderItem>;
  private orderService = inject(OrderService);  
  private currentRoute = inject(ActivatedRoute);

  rowData: OrderItem[] = [];
  private nextId = Math.max(...this.rowData.map(r => r.id), 0) + 1;

  saving = false;
  errorMsg: string | null = null;
  loading = true;
  notFound = false;

  form = this.fb.group({
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
        this.rowData = order.orderItems ?? [];
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
          p.api.applyTransaction({ remove: [p.data as OrderItem] });
        });
        return btn;
      },
      onCellClicked: params => {
        if (!params.node?.rowPinned && params.data) {
          params.api.applyTransaction({ remove: [params.data as OrderItem] });
        }
      },
    },
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: true };

  onGridReady(e: GridReadyEvent<OrderItem>) {
    this.gridApi = e.api;
  }

  addRow() {
    const blank: OrderItem = { id: this.nextId++, name: '', amount: null, unit: null, amountType: null, remarks: null };
    this.gridApi.applyTransaction({ add: [blank] });

    const idx = this.gridApi.getDisplayedRowCount() - 1;
    this.gridApi.setFocusedCell(idx, 'name');
    this.gridApi.startEditingCell({ rowIndex: idx, colKey: 'name' });
  }

  private getRows(): OrderItem[] {
    const rows: OrderItem[] = [];
    this.gridApi.forEachNode(n => { if (!n.rowPinned) rows.push(n.data as OrderItem); });
    return rows;
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
    this.orderService.createFrom(this.form.getRawValue(), rows /*, new Date() */)
      .subscribe({
        next: res => {
          alert(`Order aangemaakt met id: ${res.id}`);
          this.form.reset();
          this.gridApi.setGridOption('rowData', []);
          this.nextId = 1;
        },
        error: err => {
          console.error(err);
          this.errorMsg = err?.error?.title || err?.error?.message || 'Opslaan mislukt';
        },
        complete: () => { this.saving = false; }
      });
  }
}
