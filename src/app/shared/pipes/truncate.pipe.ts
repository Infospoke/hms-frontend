import { Pipe } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe {
  transform(value: string, limit = 50): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}