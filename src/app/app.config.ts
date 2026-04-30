import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CheckCircleOutline, CloseCircleOutline, ExclamationCircleOutline, InfoCircleOutline } from '@ant-design/icons-angular/icons';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { PermissionService } from './core/services/permission.service';
import { authInterceptor } from './core/auth/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loaderInterceptor } from './core/interceptors/loader-interceptor';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { QuillModule } from 'ngx-quill';
import { NzModalModule } from 'ng-zorro-antd/modal';
function initializeApp(authService: AuthService, permissionService: PermissionService) {
  return () => {
    permissionService.loadFromStorage();
    const restore = authService.tryRestoreSession();
    return restore ? restore.toPromise().catch(() => {}) : Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([loaderInterceptor, authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
     importProvidersFrom(NzModalModule),
    { provide: NZ_I18N, useValue: en_US },
     importProvidersFrom(
      QuillModule.forRoot({
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean']
          ]
        }
      })
    ),
    provideNzConfig({ notification: { nzPlacement: 'topRight', nzDuration: 4000 } }),
    provideNzIcons([CheckCircleOutline, CloseCircleOutline, ExclamationCircleOutline, InfoCircleOutline]),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService, perm: PermissionService) => initializeApp(auth, perm),
      deps: [AuthService, PermissionService],
      multi: true
    }
  ]
};