import { HttpClient, HttpClientModule } from '@angular/common/http';
// … in @Component imports: voeg HttpClientModule toe

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
    const orderItems: { name: string; amount: number; unit: string | null; remarks?: string | null }[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort(n => {
      if (n.rowPinned) return;
      const r = n.data as Row;
      if (!r) return;
      // Map velden: description->name, quantity->amount, remarks->remarks
      orderItems.push({
        name: (r.description ?? '').trim(),
        amount: Number(r.quantity ?? 0),
        unit: r.unit ?? null,
        remarks: r.remarks ?? null,
      });
    });

    // (optioneel) eenvoudige validatie
    if (orderItems.length === 0) {
      alert('Voeg minstens 1 materiaalregel toe.');
      return;
    }

    // Payload exact zoals je C# model het verwacht (inclusief 'remarkts' typo)
    const payload = {
      name: v.name,
      goalActivity: v.goalActivity,
      timing: v.timing || null,     // beter ISO string gebruiken
      location: v.location || null,
      remarkts: v.comment || null,  // let op: API heeft 'Remarkts' gespeld
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
