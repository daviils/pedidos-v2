import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { finalize } from 'rxjs';

import { LoginDocument } from '../../../../graphql/generated/graphql';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected showPassword = false;
  protected isSubmitting = false;
  protected errorMessage = '';
  protected accessToken = '';

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apollo: Apollo,
  ) {}

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.login(email, password);
  }

  private login(email: string, password: string): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.apollo
      .mutate({
        mutation: LoginDocument,
        variables: {
          email,
          password,
        },
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: ({ data }) => {
          this.accessToken = data?.login.accessToken ?? '';
          console.log(this.accessToken);
        },
        error: () => {
          this.errorMessage = 'Email ou senha invalidos';
        },
      });
  }
}
