import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/internal/operators/finalize';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);
  if (req.headers.has('X-Skip-Loader')) return next(req);
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};
