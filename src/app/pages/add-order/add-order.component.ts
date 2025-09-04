import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { OrderService } from '../../services/order.service';

type Row = {
  id: number;
  description?: string;
  quantity?: number | null;
  unit?: string | null;
  remarks?: string | null;
};

@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.css'],
})
export class AddOrderComponent {
  private fb = inject(FormBuilder);
  private gridApi!: GridApi<Row>;
  private orderService = inject(OrderService);  

  rowData: Row[] = [];
  private nextId = Math.max(...this.rowData.map(r => r.id), 0) + 1;

  saving = false;
  errorMsg: string | null = null;

  form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    goalActivity: this.fb.control('', [Validators.required]),
    timing: this.fb.control({ value: '', disabled: true }), // keep simple; change to a date validator if you like
    location: this.fb.control({ value: '', disabled: true }),
    nameResponsible: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    emailResponsible: this.fb.control('', [Validators.required, Validators.email]),
    phoneResponsible: this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]),
    comment: this.fb.control('', { nonNullable: true }),
  });

  hasError(path: string, err: string) {
    const ctrl = this.form.get(path);
    return !!ctrl && ctrl.touched && ctrl.hasError(err);
  }

  columnDefs: ColDef<Row | any>[] = [
    { 
       headerName: 'Nummer',
      width: 90,
      editable: false,
      sortable: false,
      filter: false,
      valueGetter: (p) => p.node?.rowPinned ? '' : ((p.node?.rowIndex ?? 0) + 1),
    },
    { field: 'description', headerName: 'Omschrijving materiaal', editable: true, minWidth: 160 },
    { field: 'quantity', headerName: 'Aantal', editable: true, width: 110 },
    { 
      field: 'unit', 
      headerName: 'Unit', 
      editable: true, 
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Per deelnemer', 'Totaal', 'Per stuks']  // dropdown opties
      },
      width: 140 
    },
    { field: 'remarks', headerName: 'Opmerkingen', editable: true, width: 200 },
    // Actions column: delete per row
    {
      headerName: 'Actions',
      field: 'actions',
      width: 110,
      editable: false,
      cellRenderer: (p: ICellRendererParams<Row>) => {
        if (p.node?.rowPinned) return '';
        const btn = document.createElement('button');
        btn.type = 'button';  
        btn.className = 'icon-btn delete';
        btn.title = 'Rij verwijderen';
        btn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          p.api.applyTransaction({ remove: [p.data as Row] });
        });
        return btn;
      },
      onCellClicked: params => {
        if (!params.node?.rowPinned && params.data) {
          params.api.applyTransaction({ remove: [params.data as Row] });
        }
      },
    },
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: true };

  onGridReady(e: GridReadyEvent<Row>) {
    this.gridApi = e.api;
  }

  addRow() {
    const blank: Row = { id: this.nextId++, description: '', quantity: null, unit: null };
    this.gridApi.applyTransaction({ add: [blank] });

    const idx = this.gridApi.getDisplayedRowCount() - 1;
    this.gridApi.setFocusedCell(idx, 'description');
    this.gridApi.startEditingCell({ rowIndex: idx, colKey: 'description' });
  }

  private getRows(): Row[] {
    const rows: Row[] = [];
    this.gridApi.forEachNode(n => { if (!n.rowPinned) rows.push(n.data as Row); });
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