import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const router = inject(Router);
  return next(req).pipe(catchError((err : HttpErrorResponse) => {
    if(err.status === 401) return throwError(()=> err);
    if(req.url.includes('auth')) return throwError(()=> err);
    const customCode = err.error?.responseCode;
    const customMsg = err.error?.responseMessage || err.error?.message;

    if (customCode && customCode !== '200') {
        notification.error(customMsg || 'Something went wrong');
        return throwError(() => err);
    }

      switch (err.status) {
        case 0:   notification.error('Server unreachable'); break;
        case 400: notification.error(customMsg || 'Bad request'); break;
        case 403: notification.error('Access denied'); router.navigate(['/dashboard']); break;
        case 404: notification.error('Resource not found'); break;
        case 409: notification.error(customMsg || 'Conflict'); break;
        case 422: notification.error(customMsg || 'Validation failed'); break;
        case 429: notification.error('Too many requests'); break;
        case 500: notification.error('Server error'); break;
        default:  notification.error(customMsg || 'Something went wrong');
      }
    return throwError(()=> err);
  }));
};
