import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add-order',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    firstName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    lastName:  this.fb.control('', [Validators.required]),
    email:     this.fb.control('', [Validators.required, Validators.email]),
    phone:     this.fb.control('', []),
    address: this.fb.group({
      street: this.fb.control('', [Validators.required]),
      zip:    this.fb.control('', [Validators.required, Validators.pattern(/^\d{4}$/)]),
      city:   this.fb.control('', [Validators.required]),
    }),
    // Dynamische lijst (bijv. extra opmerkingen)
    notes: this.fb.array<string>([])
  });

  get notes(): FormArray {
    return this.form.get('notes') as FormArray;
  }

  addNote() {
    this.notes.push(this.fb.control(''));
  }

  removeNote(i: number) {
    this.notes.removeAt(i);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Hier zou je naar je API posten
    console.log('Form value:', this.form.value);
    alert('Formulier verzonden! 🎉');
    this.form.reset();
  }

  hasError(path: string, err: string) {
    const ctrl = this.form.get(path);
    return !!ctrl && ctrl.touched && ctrl.hasError(err);
  }

}
