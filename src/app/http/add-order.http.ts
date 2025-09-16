import { HttpClient } from '@angular/common/http';

export class AddOrderComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private gridApi!: GridApi<Row>;

  // …

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Neem disabled velden mee
    const v = this.form.getRawValue();

    // Verzamel grid-rijen -> API OrderItems
    const orderItems: { name: string; amount: number; unit: string | null; amountType: string | null; remarks?: string | null }[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort(n => {
      if (n.rowPinned) return;
      const r = n.data as Row;
      if (!r) return;
 
      orderItems.push({
        name: (r.description ?? '').trim(),
        amount: Number(r.amount ?? 0),
        unit: r.unit ?? null,
        amountType: r.amountType ?? null,
        remarks: r.remarks ?? null,
      });
    });

    // (optioneel) eenvoudige validatie
    if (orderItems.length === 0) {
      alert('Voeg minstens 1 materiaalregel toe.');
      return;
    }

    const payload = {
      name: v.name,
      goalActivity: v.goalActivity,
      timing: v.timing || null,
      location: v.location || null,
      remarks: v.comment || null,  
      responsibleName: v.nameResponsible,
      responsibleEmail: v.emailResponsible,
      responsiblePhone: v.phoneResponsible,
      orderItems
    };

    this.http.post(`${this.apiBase}/orders/add`, payload).subscribe({
      next: (res) => {
        console.log('OK', res);
        alert('Order aangemaakt ✅');
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Aanmaken mislukt. Kijk console/logs.');
      }
    });
  }
}
