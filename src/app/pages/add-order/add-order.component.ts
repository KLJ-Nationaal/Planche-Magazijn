import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';

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

  rowData: Row[] = [
    { id: 1, description: 'Apples', quantity: 10, unit: 'Totaal' },
    { id: 2, description: 'Bananas', quantity: 5, unit: 'Per stuks' },
    { id: 3, description: 'Cherries', quantity: 2, unit: 'Per deelnemer' },
  ];

  private nextId = Math.max(...this.rowData.map(r => r.id), 0) + 1;

  // Easiest way: bind pinned bottom row data
  pinnedBottomRowData = [{ add: true } as any];

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

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Form value:', this.form.value);
    alert('Formulier verzonden! 🎉');
    this.form.reset();
  }

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
    // No API call needed for pinned rows — it's bound in the template.
  }

  addRow() {
    const blank: Row = { id: this.nextId++, description: '', quantity: null, unit: null };
    this.gridApi.applyTransaction({ add: [blank] });

    const idx = this.gridApi.getDisplayedRowCount() - 1;
    this.gridApi.setFocusedCell(idx, 'description');
    this.gridApi.startEditingCell({ rowIndex: idx, colKey: 'description' });
  }
}