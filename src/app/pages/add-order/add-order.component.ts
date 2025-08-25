import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams, ColSpanParams } from 'ag-grid-community';

type Row = {
  id: number;
  name?: string;
  qty?: number | null;
  price?: number | null;
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
    timing: this.fb.control('', [Validators.required]), // keep simple; change to a date validator if you like
    location: this.fb.control('', []),
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
    { id: 1, name: 'Apples', qty: 10, price: 1.2 },
    { id: 2, name: 'Bananas', qty: 5, price: 0.8 },
    { id: 3, name: 'Cherries', qty: 2, price: 2.9 },
  ];

  columnDefs: ColDef<Row | any>[] = [
    { field: 'id', headerName: 'ID', editable: false, width: 90 },
    { field: 'name', headerName: 'Name', editable: true, minWidth: 160 },
    { field: 'qty', headerName: 'Qty', editable: true, width: 110 },
    { field: 'price', headerName: 'Price', editable: true, width: 140 },

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
          const blank: Row = { id: Date.now(), name: '', qty: null, price: null };
          p.api.applyTransaction({ add: [blank] });
          const idx = p.api.getDisplayedRowCount() - 1;
          p.api.setFocusedCell(idx, 'name');
          p.api.startEditingCell({ rowIndex: idx, colKey: 'name' });
        });
        return btn;
      },
      onCellClicked: params => {
        if (params.node?.rowPinned) {
          const blank: Row = { id: this.nextId++, name: '', qty: null, price: null };
          params.api.applyTransaction({ add: [blank] });

          // focus first editable cell of the new row
          const idx = params.api.getDisplayedRowCount() - 1;
          params.api.setFocusedCell(idx, 'name');
          params.api.startEditingCell({ rowIndex: idx, colKey: 'name' });
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