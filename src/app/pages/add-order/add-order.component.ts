import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams, ColSpanParams } from 'ag-grid-community';

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
  private nextId = 4;

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

  rowData: Row[] = [
    { id: 1, description: 'Apples', quantity: 10, unit: 'Totaal' },
    { id: 2, description: 'Bananas', quantity: 5, unit: 'Per stuks' },
    { id: 3, description: 'Cherries', quantity: 2, unit: 'Per deelnemer' },
  ];

  columnDefs: ColDef<Row | any>[] = [
    { field: 'id', headerName: 'Nummer', editable: false, width: 100 },
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
        btn.className = 'icon-btn';
        btn.title = 'Delete row';
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

    // Footer “Add row” button (rendered on the pinned bottom row)
    {
      headerName: '',
      field: 'add',
      flex: 1,
      colSpan: (params: ColSpanParams<Row>) =>
        params.node?.rowPinned ? params.api.getDisplayedCenterColumns().length : 1,
      valueGetter: () => '',
      cellRenderer: (p: ICellRendererParams<Row>) => {
        if (!p.node?.rowPinned) return '';
        // Right-align the *cell* itself
        const cell = p.eGridCell as HTMLElement;
        cell.style.display = 'flex';
        cell.style.justifyContent = 'flex-end';
        cell.style.alignItems = 'center';
      
        const btn = document.createElement('button');
        btn.className = 'add-btn icon-only';
        btn.title = 'Add row';
        btn.setAttribute('aria-label', 'Add row');
        btn.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">add</span>`;
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const blank: Row = { id: Date.now(), description: '', quantity: null, unit: null };
          p.api.applyTransaction({ add: [blank] });
          const idx = p.api.getDisplayedRowCount() - 1;
          p.api.setFocusedCell(idx, 'description');
          p.api.startEditingCell({ rowIndex: idx, colKey: 'description' });
        });
        return btn;
      },
      onCellClicked: params => {
        if (params.node?.rowPinned) {
          const blank: Row = { id: this.nextId++, description: '', quantity: null, unit: null };
          params.api.applyTransaction({ add: [blank] });

          // focus first editable cell of the new row
          const idx = params.api.getDisplayedRowCount() - 1;
          params.api.setFocusedCell(idx, 'description');
          params.api.startEditingCell({ rowIndex: idx, colKey: 'description' });
        }
      },
    },
  ];

  defaultColDef: ColDef = { resizable: true, sortable: true, filter: true };

  onGridReady(e: GridReadyEvent<Row>) {
    this.gridApi = e.api;
    // No API call needed for pinned rows — it's bound in the template.
  }
}