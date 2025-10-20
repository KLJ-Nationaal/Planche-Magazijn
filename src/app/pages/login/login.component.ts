import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttp } from '../../http/auth.http';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthHttp);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

 form = this.fb.nonNullable.group({
  username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
  password: ['', [Validators.required, Validators.minLength(6)]],
});

  submit() {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) return;

    const payload = {
      username: this.form.value.username!,
      password: this.form.value.password!,
    };

    this.loading.set(true);
    this.auth.login(payload).subscribe({
      next: () => {
        console.log('Login OK, token:', this.auth.token);
        this.router.navigateByUrl('/');
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(e?.error?.message ?? 'Login mislukt');
        this.loading.set(false);
      },
    });
  }
}