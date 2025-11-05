import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  rowData: Row[] = [];
  private nextId = Math.max(...this.rowData.map(r => r.id), 0) + 1;

  saving = false;
  errorMsg: string | null = null;

  form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    goalActivity: this.fb.control('', [Validators.required]),
    timing: this.fb.control({ value: '', disabled: true }), // keep simple; change to a date validator if you like
    location: this.fb.control({ value: '', disabled: true }),
    responsibleName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    responsibleEmail: this.fb.control('', [Validators.required, Validators.email]),
    responsiblePhone: this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]),
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
    { field: 'amount', 
      headerName: 'Aantal', 
      editable: true, 
      width: 110,
      valueFormatter: p => this.formatBeNumber(p.value),
      valueParser: p => this.parseBeNumber(p.newValue),
      filter: 'agNumberColumnFilter',
      cellEditorParams: {
        allowedCharPattern: '[0-9\\,\\.]',
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

    this.orderService.createFrom(this.form.getRawValue(), rows)
      .subscribe({
        next: res => {
          console.log(`Order aangemaakt: ${res.id}`);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error(err);
          this.errorMsg = err?.error?.title || err?.error?.message || 'Opslaan mislukt';
        },
        complete: () => { this.saving = false; }
      });
    }

    parseBeNumber(raw: unknown): number | null {
      if (raw == null) return null;
      let s = String(raw).trim();
      if (!s) return null;

      // remove spaces used as thousand sep
      s = s.replace(/\s+/g, '');

      const hasDot = s.includes('.');
      const hasComma = s.includes(',');

      if (hasDot && hasComma) {
        // last separator is the decimal; strip the other as thousands
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        if (lastComma > lastDot) {
          s = s.replace(/\./g, '').replace(',', '.'); // comma decimal
        } else {
          s = s.replace(/,/g, ''); // dot decimal, remove commas as thousands
        }
      } else if (hasComma) {
        s = s.replace(',', '.'); // single comma = decimal
      }
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }

    formatBeNumber(v: unknown): string {
      if (v == null || v === '') return '';
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) return '';
      return n.toLocaleString('nl-BE', { maximumFractionDigits: 2 });
    }
}