import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' },
    { provide: LOCALE_ID, useValue: 'en-IN' }
  ]
};