import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(isoString: string, type: 'date' | 'time'): string {
    if (!isoString) return '-';

    const date = new Date(isoString);

    if (isNaN(date.getTime())) return '-';

    if (type === 'date') {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}