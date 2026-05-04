import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function alphabetsOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const regex = /^[A-Za-z]+$/;
    return regex.test(value) ? null : { alphabetsOnly: true };
  };
}


export function numericOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return /^\d+$/.test(control.value) ? null : { numericOnly: true };
  };
}

export function notSameAsMobile(mobileField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const parent = control.parent;
    if (!parent) return null;
    const mobile = parent.get(mobileField)?.value;
    return control.value === mobile ? { sameAsMobile: true } : null;
  };
}

export function mobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const value = control.value.trim();
    const regex = /^(\+\d{1,3}\s?)?\d{10}$/;
    return regex.test(value) ? null : { invalidMobile: true };
  };
}



export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {

    return words[0].substring(0, 2).toUpperCase();
  }


  return words
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}