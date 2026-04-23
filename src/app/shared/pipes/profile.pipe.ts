import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'profile', standalone: true })
export class ProfilePipe implements PipeTransform {

  transform(username: any): string {
    if (!username) return '';

    const words = username.trim().split(' ');

    if (words.length === 1) {

      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}